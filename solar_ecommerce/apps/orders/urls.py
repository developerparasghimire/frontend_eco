from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('list', views.OrderViewSet, basename='order')
router.register('warranties', views.WarrantyDocumentViewSet, basename='warranty')

urlpatterns = [
    # Cart
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/', views.AddToCartView.as_view(), name='cart_add'),
    path('cart/clear/', views.ClearCartView.as_view(), name='cart_clear'),
    path('cart/items/<uuid:item_id>/', views.UpdateCartItemView.as_view(), name='cart_item'),

    # Checkout
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('checkout/quote/', views.CheckoutQuoteView.as_view(), name='checkout_quote'),
    path('checkout/guest/', views.GuestCheckoutView.as_view(), name='checkout_guest'),

    # Guest order detail (token-protected)
    path('guest/<str:order_number>/', views.GuestOrderDetailView.as_view(),
         name='guest_order_detail'),
    path('guest/<str:order_number>/stripe/create/', views.GuestStripeCreateView.as_view(),
         name='guest_stripe_create'),
    path('guest/<str:order_number>/stripe/confirm/', views.GuestStripeConfirmView.as_view(),
         name='guest_stripe_confirm'),

    # Invoice PDF download (works for both authenticated and guest orders)
    path('<str:order_number>/invoice.pdf', views.OrderInvoicePDFView.as_view(),
         name='order_invoice_pdf'),

    # Orders & warranties via router
    path('', include(router.urls)),
]
