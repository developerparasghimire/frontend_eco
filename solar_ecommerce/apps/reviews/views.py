from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.permissions import IsOwnerOrReadOnly

from .models import Review
from .serializers import ReviewAdminSerializer, ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    GET    /api/reviews/?product=<uuid>   – list reviews
    GET    /api/reviews/mine/             – list current user's reviews
    POST   /api/reviews/                  – create
    PATCH  /api/reviews/<id>/             – update own
    DELETE /api/reviews/<id>/             – delete own (or admin)
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filterset_fields = ['product']

    def get_queryset(self):
        return Review.objects.select_related('user', 'product')

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mine(self, request):
        qs = (
            Review.objects.filter(user=request.user)
            .select_related('product')
            .order_by('-created_at')
        )
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


class ReviewAdminViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Admin: list all reviews and delete abusive ones."""
    queryset = Review.objects.select_related('user', 'product').order_by('-created_at')
    serializer_class = ReviewAdminSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['rating', 'product']
    search_fields = ['title', 'comment', 'user__email', 'product__name']
