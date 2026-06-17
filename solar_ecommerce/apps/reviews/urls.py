from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('', views.ReviewViewSet, basename='review')

admin_router = DefaultRouter()
admin_router.register('reviews', views.ReviewAdminViewSet, basename='review-admin')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
