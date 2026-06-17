from rest_framework import serializers

from .models import ShippingZone


class ShippingZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingZone
        fields = (
            'id', 'name', 'states', 'country', 'rate', 'free_above',
            'estimated_days_min', 'estimated_days_max', 'is_active',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
