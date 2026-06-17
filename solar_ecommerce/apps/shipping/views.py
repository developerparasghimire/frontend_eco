from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .models import ShippingZone
from .serializers import ShippingZoneSerializer


class ShippingZoneViewSet(viewsets.ModelViewSet):
    """Admin CRUD for shipping zones."""
    queryset = ShippingZone.objects.all().order_by('name')
    serializer_class = ShippingZoneSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['is_active', 'country']
    search_fields = ['name', 'states']
