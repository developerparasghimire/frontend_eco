from django.utils import timezone
from rest_framework import status as http_status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import ReturnRequest
from .serializers import ReturnRequestSerializer, ReturnStatusUpdateSerializer


class ReturnRequestViewSet(viewsets.ModelViewSet):
    """
    GET    /api/returns/                       – list user's RMAs (admin sees all)
    POST   /api/returns/                       – create RMA
    GET    /api/returns/<id>/                  – detail
    POST   /api/returns/<id>/update-status/    – admin transition
    """
    serializer_class = ReturnRequestSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = ReturnRequest.objects.select_related('order', 'user').prefetch_related('items')
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='update-status',
            permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        rma = self.get_object()
        ser = ReturnStatusUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        new_status = ser.validated_data['status']
        rma.status = new_status

        now = timezone.now()
        if new_status == ReturnRequest.Status.APPROVED and not rma.approved_at:
            rma.approved_at = now
        if new_status == ReturnRequest.Status.REFUNDED and not rma.refunded_at:
            rma.refunded_at = now
        if new_status == ReturnRequest.Status.COMPLETED and not rma.completed_at:
            rma.completed_at = now
        if 'admin_notes' in ser.validated_data:
            rma.admin_notes = ser.validated_data['admin_notes']
        if 'refund_reference' in ser.validated_data:
            rma.refund_reference = ser.validated_data['refund_reference']

        rma.save()
        return Response(ReturnRequestSerializer(rma).data, status=http_status.HTTP_200_OK)
