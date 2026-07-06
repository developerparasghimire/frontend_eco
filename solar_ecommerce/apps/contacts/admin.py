from django.contrib import admin
from django.utils.html import format_html

from .models import ContactMessage, NewsletterSubscriber

STATUS_COLORS = {
    'new': '#3b82f6',
    'in_progress': '#f59e0b',
    'resolved': '#22c55e',
}


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'phone', 'status_badge', 'created_at')
    list_filter = ('status', 'created_at')
    list_editable = ()
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'phone', 'subject', 'message', 'created_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Customer', {
            'fields': ('name', 'email', 'phone'),
        }),
        ('Message', {
            'fields': ('subject', 'message'),
        }),
        ('Admin', {
            'fields': ('status', 'admin_notes'),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    actions = ['mark_in_progress', 'mark_resolved']

    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    @admin.action(description='Mark selected as In Progress')
    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')

    @admin.action(description='Mark selected as Resolved')
    def mark_resolved(self, request, queryset):
        queryset.update(status='resolved')


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'created_at')
    list_filter = ('is_active',)
    list_editable = ('is_active',)
    search_fields = ('email',)
    date_hierarchy = 'created_at'
    actions = ['activate', 'deactivate']

    @admin.action(description='Activate selected subscribers')
    def activate(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description='Deactivate selected subscribers')
    def deactivate(self, request, queryset):
        queryset.update(is_active=False)
