from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_display', 'usage_display', 'min_order_display',
                    'valid_until', 'status_badge', 'is_active')
    list_filter = ('discount_type', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('code', 'description')
    readonly_fields = ('used_count', 'created_at')
    date_hierarchy = 'valid_until'

    fieldsets = (
        ('Coupon Code', {
            'fields': ('code', 'description', 'is_active'),
        }),
        ('Discount', {
            'fields': ('discount_type', 'discount_value', 'max_discount_amount'),
        }),
        ('Restrictions', {
            'fields': ('min_order_amount', 'usage_limit', 'per_user_limit'),
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_until'),
        }),
        ('Usage Stats', {
            'fields': ('used_count', 'created_at'),
        }),
    )

    def discount_display(self, obj):
        if obj.discount_type == 'percentage':
            val = f'{obj.discount_value}% off'
            if obj.max_discount_amount:
                val += f' (max ₹{obj.max_discount_amount})'
        else:
            val = f'₹{obj.discount_value} off'
        return val
    discount_display.short_description = 'Discount'

    def usage_display(self, obj):
        limit = str(obj.usage_limit) if obj.usage_limit else '∞'
        return f'{obj.used_count} / {limit}'
    usage_display.short_description = 'Used'

    def min_order_display(self, obj):
        if obj.min_order_amount:
            return f'₹{obj.min_order_amount}'
        return '—'
    min_order_display.short_description = 'Min Order'

    def status_badge(self, obj):
        now = timezone.now()
        if not obj.is_active:
            return format_html('<span style="color:#888;">Inactive</span>')
        if now > obj.valid_until:
            return format_html('<span style="color:#ef4444;font-weight:bold;">Expired</span>')
        if now < obj.valid_from:
            return format_html('<span style="color:#3b82f6;font-weight:bold;">Upcoming</span>')
        return format_html('<span style="color:#22c55e;font-weight:bold;">✓ Active</span>')
    status_badge.short_description = 'Status'


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ('coupon', 'user', 'order', 'created_at')
    search_fields = ('coupon__code', 'user__email')
    readonly_fields = ('coupon', 'user', 'order', 'created_at')
