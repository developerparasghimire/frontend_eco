from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    title = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')
    comment = serializers.CharField(max_length=5000, required=False, allow_blank=True, default='')

    class Meta:
        model = Review
        fields = ('id', 'product', 'user', 'user_name', 'rating', 'title', 'comment', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

    def validate(self, attrs):
        request = self.context['request']
        if self.instance is None and Review.objects.filter(
            user=request.user, product=attrs['product']
        ).exists():
            raise serializers.ValidationError('You have already reviewed this product.')
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
