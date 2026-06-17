from django.contrib import admin

from .models import ShippingZone


@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'rate', 'free_above', 'estimated_days_min',
                    'estimated_days_max', 'is_active')
    list_filter = ('country', 'is_active')
    search_fields = ('name', 'states')
