from django.contrib import admin
from django.utils.html import format_html

from .models import Cart, CartItem, Order, OrderItem, WarrantyDocument


STATUS_COLORS = {
    'pending': '#f59e0b',
    'confirmed': '#3b82f6',
    'processing': '#8b5cf6',
    'shipped': '#06b6d4',
    'delivered': '#22c55e',
    'cancelled': '#ef4444',
}

PAYMENT_COLORS = {
    'paid': '#22c55e',
    'unpaid': '#f59e0b',
    'refunded': '#ef4444',
    'partially_refunded': '#f97316',
}


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('unit_price', 'line_total')
    fields = ('product', 'quantity', 'include_installation', 'unit_price', 'line_total')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'grand_total', 'updated_at')
    search_fields = ('user__email',)
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'sku', 'unit_price', 'quantity',
                       'include_installation', 'installation_fee', 'line_total')
    fields = ('product_name', 'sku', 'unit_price', 'quantity',
              'include_installation', 'installation_fee', 'line_total')


class WarrantyInline(admin.TabularInline):
    model = WarrantyDocument
    extra = 0
    fk_name = 'order_item'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'customer_display', 'status_badge', 'payment_badge',
        'grand_total_display', 'payment_method', 'created_at',
    )
    list_filter = ('status', 'payment_method', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__email', 'guest_email', 'coupon_code',
                     'shipping_full_name', 'shipping_phone')
    readonly_fields = (
        'order_number', 'coupon_code', 'discount_amount', 'subtotal',
        'installation_total', 'tax_amount', 'shipping_cost', 'grand_total',
        'payment_id', 'paid_at', 'cancelled_at', 'cancellation_reason',
        'created_at', 'updated_at',
    )
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline]
    actions = ['mark_confirmed', 'mark_processing', 'mark_shipped', 'mark_delivered', 'mark_cancelled']

    fieldsets = (
        ('Order', {
            'fields': ('order_number', 'user', 'status', 'note'),
        }),
        ('Shipping', {
            'fields': (
                'shipping_full_name', 'shipping_phone',
                'shipping_address', 'shipping_city', 'shipping_state',
                'shipping_postal_code', 'shipping_country',
            ),
        }),
        ('Payment', {
            'fields': ('payment_method', 'payment_status', 'payment_id', 'paid_at'),
        }),
        ('Totals', {
            'fields': ('subtotal', 'installation_total', 'coupon_code', 'discount_amount',
                       'shipping_cost', 'tax_amount', 'grand_total'),
        }),
        ('Cancellation', {
            'fields': ('cancelled_at', 'cancellation_reason'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def customer_display(self, obj):
        if obj.user:
            return obj.user.email
        return format_html('<i style="color:#888;">{} (guest)</i>', obj.guest_email or '—')
    customer_display.short_description = 'Customer'

    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    def payment_badge(self, obj):
        color = PAYMENT_COLORS.get(obj.payment_status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.payment_status.replace('_', ' ').title(),
        )
    payment_badge.short_description = 'Payment'

    def grand_total_display(self, obj):
        return format_html('<b>₹{}</b>', obj.grand_total)
    grand_total_display.short_description = 'Total'

    @admin.action(description='Mark selected as Confirmed')
    def mark_confirmed(self, request, queryset):
        queryset.update(status='confirmed')

    @admin.action(description='Mark selected as Processing')
    def mark_processing(self, request, queryset):
        queryset.update(status='processing')

    @admin.action(description='Mark selected as Shipped')
    def mark_shipped(self, request, queryset):
        queryset.update(status='shipped')

    @admin.action(description='Mark selected as Delivered')
    def mark_delivered(self, request, queryset):
        queryset.update(status='delivered')

    @admin.action(description='Mark selected as Cancelled')
    def mark_cancelled(self, request, queryset):
        queryset.update(status='cancelled')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_name', 'sku', 'quantity', 'unit_price', 'line_total')
    search_fields = ('order__order_number', 'product_name', 'sku')
    inlines = [WarrantyInline]
