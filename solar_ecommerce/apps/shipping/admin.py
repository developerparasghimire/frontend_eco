from django.contrib import admin
from django.utils.html import format_html

from .models import ShippingZone


@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'rate_display', 'free_above_display',
                    'eta_display', 'is_active')
    list_filter = ('country', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('name', 'states')

    fieldsets = (
        ('Zone', {
            'fields': ('name', 'country', 'is_active'),
        }),
        ('Coverage', {
            'fields': ('states',),
            'description': 'Comma-separated list of states / regions this zone covers.',
        }),
        ('Rates & Delivery', {
            'fields': ('rate', 'free_above', 'estimated_days_min', 'estimated_days_max'),
        }),
    )

    def rate_display(self, obj):
        if obj.rate == 0:
            return format_html('<span style="color:#22c55e;font-weight:bold;">Free</span>')
        return f'₹{obj.rate}'
    rate_display.short_description = 'Rate'

    def free_above_display(self, obj):
        if obj.free_above:
            return f'₹{obj.free_above}'
        return '—'
    free_above_display.short_description = 'Free Above'

    def eta_display(self, obj):
        return f'{obj.estimated_days_min}–{obj.estimated_days_max} days'
    eta_display.short_description = 'Delivery ETA'
