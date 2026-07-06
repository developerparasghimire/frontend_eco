from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import Address, EmailVerificationOTP

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name_display', 'phone_number', 'is_installer',
                    'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_installer', 'is_active', 'is_superuser')
    list_editable = ('is_active',)
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone_number')
    ordering = ('-date_joined',)
    date_hierarchy = 'date_joined'

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Solar Profile', {'fields': ('phone_number', 'is_installer')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Solar Profile', {'fields': ('email', 'phone_number', 'is_installer')}),
    )

    def full_name_display(self, obj):
        name = f'{obj.first_name} {obj.last_name}'.strip()
        return name or obj.username
    full_name_display.short_description = 'Name'


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'label', 'full_name', 'address_type', 'city', 'state', 'is_default')
    list_filter = ('address_type', 'is_default', 'country')
    search_fields = ('user__email', 'full_name', 'city', 'postal_code', 'phone')

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'


@admin.register(EmailVerificationOTP)
class EmailVerificationOTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'is_used', 'expires_at', 'created_at')
    list_filter = ('is_used',)
    search_fields = ('user__email',)
    readonly_fields = ('code', 'created_at', 'expires_at')
