from rest_framework import viewsets, parsers, filters, status as http_status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import StreamingHttpResponse

import csv
import io

from apps.permissions import IsAdminOrReadOnly

from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductImageSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET  /api/products/categories/          – list (public)
    POST /api/products/categories/          – create (admin)
    GET  /api/products/categories/<id>/     – detail (public)
    """
    queryset = Category.objects.filter(is_active=True, parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    search_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    """
    GET  /api/products/                     – list (public)
    POST /api/products/                     – create (admin)
    GET  /api/products/<slug>/              – detail (public)
    """
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_active', 'installation_available', 'is_featured', 'brand']
    search_fields = ['name', 'sku', 'description', 'capacity', 'brand', 'tags']
    ordering_fields = ['price', 'created_at', 'warranty_years', 'discount_percent']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related('images')
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer

    # ── Upload images for a product ───────
    @action(
        detail=True, methods=['post'],
        permission_classes=[IsAdminUser],
        parser_classes=[parsers.MultiPartParser],
        url_path='upload-image',
    )
    def upload_image(self, request, slug=None):
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=201)

    # ── Featured products ─────────────────
    @action(detail=False, methods=['get'], url_path='featured', permission_classes=[AllowAny])
    def featured(self, request):
        """GET /api/products/featured/ – curated featured products."""
        qs = Product.objects.filter(is_active=True, is_featured=True).select_related('category').prefetch_related('images')[:12]
        return Response(ProductListSerializer(qs, many=True, context={'request': request}).data)

    # ── Related products ──────────────────
    @action(detail=True, methods=['get'], url_path='related', permission_classes=[AllowAny])
    def related(self, request, slug=None):
        """GET /api/products/<slug>/related/ – same-category products."""
        product = self.get_object()
        qs = (
            Product.objects.filter(category=product.category, is_active=True)
            .exclude(pk=product.pk)
            .select_related('category')
            .prefetch_related('images')[:6]
        )
        return Response(ProductListSerializer(qs, many=True, context={'request': request}).data)

    # ── CSV export (admin) ────────────────
    @action(detail=False, methods=['get'], url_path='export-csv',
            permission_classes=[IsAdminUser])
    def export_csv(self, request):
        """GET /api/products/export-csv/ – streams a product catalogue CSV."""
        fieldnames = [
            'sku', 'name', 'slug', 'category_slug', 'brand', 'price',
            'discount_percent', 'stock', 'capacity', 'warranty_years',
            'installation_available', 'installation_fee', 'is_active',
            'is_featured', 'tags',
        ]

        def row_iter():
            buffer = io.StringIO()
            writer = csv.DictWriter(buffer, fieldnames=fieldnames)
            writer.writeheader()
            yield buffer.getvalue()
            buffer.seek(0); buffer.truncate(0)

            for p in Product.objects.select_related('category').iterator(chunk_size=500):
                writer.writerow({
                    'sku': p.sku,
                    'name': p.name,
                    'slug': p.slug,
                    'category_slug': p.category.slug if p.category_id else '',
                    'brand': p.brand,
                    'price': p.price,
                    'discount_percent': p.discount_percent,
                    'stock': p.stock,
                    'capacity': p.capacity,
                    'warranty_years': p.warranty_years,
                    'installation_available': p.installation_available,
                    'installation_fee': p.installation_fee,
                    'is_active': p.is_active,
                    'is_featured': p.is_featured,
                    'tags': p.tags,
                })
                yield buffer.getvalue()
                buffer.seek(0); buffer.truncate(0)

        response = StreamingHttpResponse(row_iter(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products.csv"'
        return response

    # ── CSV import (admin) ────────────────
    @action(detail=False, methods=['post'], url_path='import-csv',
            permission_classes=[IsAdminUser],
            parser_classes=[parsers.MultiPartParser])
    def import_csv(self, request):
        """
        POST /api/products/import-csv/  multipart `file=<csv>`

        Upserts by `sku`. Returns counts. Categories must already exist
        (looked up by `category_slug`). Booleans accept true/false/1/0.
        """
        upload = request.FILES.get('file')
        if not upload:
            return Response({'detail': 'CSV file required (field "file").'},
                            status=http_status.HTTP_400_BAD_REQUEST)

        try:
            text = upload.read().decode('utf-8-sig')
        except UnicodeDecodeError:
            return Response({'detail': 'File must be UTF-8 encoded.'},
                            status=http_status.HTTP_400_BAD_REQUEST)

        reader = csv.DictReader(io.StringIO(text))
        created = updated = skipped = 0
        errors: list[str] = []

        def _bool(v: str) -> bool:
            return str(v).strip().lower() in ('1', 'true', 'yes', 'y')

        for idx, row in enumerate(reader, start=2):
            sku = (row.get('sku') or '').strip()
            if not sku:
                skipped += 1
                errors.append(f'Row {idx}: missing sku')
                continue
            cat_slug = (row.get('category_slug') or '').strip()
            category = Category.objects.filter(slug=cat_slug).first() if cat_slug else None
            if cat_slug and not category:
                skipped += 1
                errors.append(f'Row {idx}: category "{cat_slug}" not found')
                continue

            defaults = {
                'name': (row.get('name') or '').strip(),
                'brand': (row.get('brand') or '').strip(),
                'price': row.get('price') or 0,
                'discount_percent': row.get('discount_percent') or 0,
                'stock': row.get('stock') or 0,
                'capacity': (row.get('capacity') or '').strip(),
                'warranty_years': row.get('warranty_years') or 0,
                'installation_available': _bool(row.get('installation_available')),
                'installation_fee': row.get('installation_fee') or 0,
                'is_active': _bool(row.get('is_active')) if row.get('is_active') is not None else True,
                'is_featured': _bool(row.get('is_featured')),
                'tags': (row.get('tags') or '').strip(),
            }
            if category:
                defaults['category'] = category

            try:
                _, was_created = Product.objects.update_or_create(
                    sku=sku, defaults=defaults,
                )
                created += int(was_created)
                updated += int(not was_created)
            except Exception as exc:  # noqa: BLE001
                skipped += 1
                errors.append(f'Row {idx} ({sku}): {exc}')

        return Response({
            'created': created,
            'updated': updated,
            'skipped': skipped,
            'errors': errors[:50],
        })
