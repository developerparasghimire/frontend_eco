from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'sort_order', 'image_preview')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="60" style="border-radius:4px;"/>', obj.image.url)
        return '—'
    image_preview.short_description = 'Preview'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'product_count', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

    def product_count(self, obj):
        count = obj.products.count()
        return format_html('<b>{}</b>', count)
    product_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'sku', 'category', 'price_display', 'stock_display',
        'brand', 'is_featured', 'is_active',
    )
    list_filter = ('category', 'is_active', 'is_featured', 'installation_available', 'brand')
    list_editable = ('is_featured', 'is_active')
    search_fields = ('name', 'sku', 'brand', 'tags')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    readonly_fields = ('discounted_price_display', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'name', 'slug', 'sku', 'brand', 'tags'),
        }),
        ('Pricing', {
            'fields': ('price', 'discount_percent', 'discounted_price_display'),
        }),
        ('Specifications', {
            'fields': ('capacity', 'warranty_years', 'lifespan_years'),
        }),
        ('Description', {
            'fields': ('description', 'technical_description'),
            'classes': ('collapse',),
        }),
        ('Inventory & Delivery', {
            'fields': ('stock', 'delivery_days', 'installation_available', 'installation_fee'),
        }),
        ('Visibility', {
            'fields': ('is_active', 'is_featured'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['mark_featured', 'unmark_featured', 'mark_active', 'mark_inactive']

    def price_display(self, obj):
        if obj.discount_percent:
            return format_html(
                '₹{} <small style="color:#888;text-decoration:line-through;">₹{}</small>',
                obj.discounted_price, obj.price,
            )
        return f'₹{obj.price}'
    price_display.short_description = 'Price'

    def stock_display(self, obj):
        if obj.stock == 0:
            return format_html('<span style="color:red;font-weight:bold;">Out of stock</span>')
        if obj.stock <= 10:
            return format_html('<span style="color:orange;font-weight:bold;">Low ({})</span>', obj.stock)
        return format_html('<span style="color:green;">{}</span>', obj.stock)
    stock_display.short_description = 'Stock'

    def discounted_price_display(self, obj):
        return f'₹{obj.discounted_price}'
    discounted_price_display.short_description = 'Sale price (calculated)'

    @admin.action(description='Mark selected as Featured')
    def mark_featured(self, request, queryset):
        queryset.update(is_featured=True)

    @admin.action(description='Remove Featured from selected')
    def unmark_featured(self, request, queryset):
        queryset.update(is_featured=False)

    @admin.action(description='Mark selected as Active')
    def mark_active(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description='Mark selected as Inactive')
    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)
