from rest_framework import serializers

from apps.orders.models import Order, OrderItem

from .models import ReturnRequest, ReturnItem


class ReturnItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='order_item.product_name', read_only=True)
    sku = serializers.CharField(source='order_item.sku', read_only=True)

    class Meta:
        model = ReturnItem
        fields = ('id', 'order_item', 'product_name', 'sku', 'quantity', 'refund_amount')
        read_only_fields = ('id', 'product_name', 'sku', 'refund_amount')


class ReturnRequestSerializer(serializers.ModelSerializer):
    items = ReturnItemSerializer(many=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = ReturnRequest
        fields = (
            'id', 'rma_number', 'order', 'order_number', 'status', 'reason',
            'description', 'refund_amount', 'refund_reference', 'admin_notes',
            'approved_at', 'refunded_at', 'completed_at',
            'items', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'rma_number', 'status', 'refund_amount', 'refund_reference',
            'admin_notes', 'approved_at', 'refunded_at', 'completed_at',
            'created_at', 'updated_at', 'order_number',
        )

    def validate(self, attrs):
        request = self.context['request']
        order: Order = attrs['order']

        if order.user_id != request.user.id and not request.user.is_staff:
            raise serializers.ValidationError({'order': 'Order not found.'})
        if order.status != Order.Status.DELIVERED:
            raise serializers.ValidationError(
                {'order': 'Returns are only allowed for delivered orders.'}
            )
        items = attrs.get('items') or []
        if not items:
            raise serializers.ValidationError({'items': 'At least one item is required.'})

        order_item_ids = set(order.items.values_list('id', flat=True))
        for item in items:
            oi: OrderItem = item['order_item']
            if oi.id not in order_item_ids:
                raise serializers.ValidationError({'items': 'Item does not belong to order.'})
            if item['quantity'] < 1 or item['quantity'] > oi.quantity:
                raise serializers.ValidationError(
                    {'items': f'Invalid quantity for {oi.product_name}.'}
                )
        return attrs

    def create(self, validated_data):
        items = validated_data.pop('items')
        validated_data['user'] = self.context['request'].user
        return_request = ReturnRequest.objects.create(**validated_data)

        for item in items:
            oi: OrderItem = item['order_item']
            ReturnItem.objects.create(
                return_request=return_request,
                order_item=oi,
                quantity=item['quantity'],
                refund_amount=oi.unit_price * item['quantity'],
            )
        return_request.refund_amount = sum(i.refund_amount for i in return_request.items.all())
        return_request.save(update_fields=['refund_amount'])
        return return_request


class ReturnStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ReturnRequest.Status.choices)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    refund_reference = serializers.CharField(required=False, allow_blank=True, max_length=100)
