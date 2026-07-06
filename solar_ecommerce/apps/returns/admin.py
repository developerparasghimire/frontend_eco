from django.contrib import admin
from django.utils.html import format_html

from .models import ReturnRequest, ReturnItem

STATUS_COLORS = {
    'pending': '#f59e0b',
    'approved': '#3b82f6',
    'rejected': '#ef4444',
    'item_received': '#8b5cf6',
    'refunded': '#22c55e',
    'completed': '#22c55e',
    'cancelled': '#6b7280',
}


class ReturnItemInline(admin.TabularInline):
    model = ReturnItem
    extra = 0
    readonly_fields = ('order_item', 'quantity', 'refund_amount')


@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ('rma_number', 'order', 'user', 'status_badge', 'reason',
                    'refund_amount_display', 'created_at')
    list_filter = ('status', 'reason', 'created_at')
    search_fields = ('rma_number', 'order__order_number', 'user__email')
    inlines = [ReturnItemInline]
    readonly_fields = ('rma_number', 'created_at', 'updated_at',
                       'approved_at', 'refunded_at', 'completed_at')
    date_hierarchy = 'created_at'
    actions = ['approve', 'reject']

    fieldsets = (
        ('Return Request', {
            'fields': ('rma_number', 'order', 'user', 'status', 'reason'),
        }),
        ('Details', {
            'fields': ('description', 'refund_amount', 'admin_notes'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'approved_at', 'refunded_at', 'completed_at'),
            'classes': ('collapse',),
        }),
    )

    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    def refund_amount_display(self, obj):
        if obj.refund_amount:
            return f'₹{obj.refund_amount}'
        return '—'
    refund_amount_display.short_description = 'Refund'

    @admin.action(description='Approve selected return requests')
    def approve(self, request, queryset):
        queryset.update(status='approved')

    @admin.action(description='Reject selected return requests')
    def reject(self, request, queryset):
        queryset.update(status='rejected')
