from django.contrib import admin

from .models import ReturnRequest, ReturnItem


class ReturnItemInline(admin.TabularInline):
    model = ReturnItem
    extra = 0
    readonly_fields = ('order_item', 'quantity', 'refund_amount')


@admin.register(ReturnRequest)
class ReturnRequestAdmin(admin.ModelAdmin):
    list_display = ('rma_number', 'order', 'user', 'status', 'reason',
                    'refund_amount', 'created_at')
    list_filter = ('status', 'reason')
    search_fields = ('rma_number', 'order__order_number', 'user__email')
    inlines = [ReturnItemInline]
    readonly_fields = ('rma_number', 'created_at', 'updated_at',
                       'approved_at', 'refunded_at', 'completed_at')
