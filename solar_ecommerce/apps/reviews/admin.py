from django.contrib import admin
from django.utils.html import format_html

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating_stars', 'title', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'user__email', 'title', 'comment')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'

    def rating_stars(self, obj):
        filled = '★' * obj.rating
        empty = '☆' * (5 - obj.rating)
        color = '#f59e0b' if obj.rating >= 4 else '#94a3b8' if obj.rating <= 2 else '#fb923c'
        return format_html(
            '<span style="color:{};font-size:16px;" title="{}/5">{}{}</span>',
            color, obj.rating, filled, empty,
        )
    rating_stars.short_description = 'Rating'
    rating_stars.admin_order_field = 'rating'
