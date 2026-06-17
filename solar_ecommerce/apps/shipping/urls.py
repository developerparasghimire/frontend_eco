from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('admin/zones', views.ShippingZoneViewSet, basename='shipping-zone')

urlpatterns = [
    path('', include(router.urls)),
]
