"""
One-off catalogue clean-up for the Australian storefront.

Three things went wrong as the store moved from its Indian demo origins to a
real Australian shop:

1. House-brand products (EcoSun / EcoPower / EcoCharge / PowerStore) kept their
   Indian Rupee amounts, which now render as AUD — a 550W panel priced at
   $22,000 sat next to a real Jinko 515W at $490.
2. Categories accumulated duplicates ("Panels" vs "Solar Panels", three
   different battery categories) plus a leftover "test" category holding a junk
   product.
3. 37 of 52 products had no image at all.

Re-running this command is safe: every step is idempotent.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.products.models import Category, Product, ProductImage

# ── 1. Repricing ────────────────────────────────────────────────────────────
# Keyed by SKU-independent product name. Values are realistic Australian retail
# prices; the owner should review these against supplier cost.
PRICE_FIXES = {
    # Solar panels — real 400–550W panels retail around $190–450 in AU.
    'EcoSun 550W Half-Cut PERC Solar Panel': '399.00',
    'EcoSun 540W Bifacial Solar Panel': '379.00',
    'EcoSun 400W Monocrystalline Solar Panel': '259.00',
    'EcoSun 330W Polycrystalline Solar Panel': '189.00',
    # EV chargers — DC fast chargers are the big-ticket item here.
    'EcoCharge 50kW DC Fast Charger': '18500.00',
    'EcoCharge 22kW AC Commercial EV Charger': '2290.00',
    'EcoCharge 7.2kW AC Home EV Charger': '1190.00',
    'EcoCharge 3.3kW Portable EV Charger': '449.00',
    # Home batteries — benchmarked against the Pylontech/Tesla entries.
    'PowerStore 10kWh Lithium Solar Battery': '7900.00',
    'PowerStore 5kWh Lithium Solar Battery': '4290.00',
    'PowerStore 2.5kWh Wall-Mount Battery': '2390.00',
    # Lead-acid / tubular inverter batteries.
    'EcoPower 200Ah Tall Tubular Inverter Battery': '649.00',
    'EcoPower 150Ah Tall Tubular Inverter Battery': '529.00',
    'EcoPower 100Ah VRLA Maintenance-Free Battery': '349.00',
}

# ── 2. Category consolidation ───────────────────────────────────────────────
# {duplicate slug: canonical slug}
CATEGORY_MERGES = {
    'panels': 'solar-panels',
    'solar-batteries': 'batteries',
    'solar-inverter-batteries': 'batteries',
}
# Categories to drop entirely, along with any products left in them.
CATEGORY_PURGE = ['test']

# ── 3. Image assignment ─────────────────────────────────────────────────────
# Files already present in MEDIA_ROOT/products/. Products cycle through the
# list for their category so a grid doesn't show the same photo repeatedly.
CATEGORY_IMAGES = {
    'solar-panels': [
        'products/solar-panel-array.jpg',
        'products/solar-panel-close.jpg',
        'products/solar-panel-field.jpg',
        'products/solar-panel-rooftop.jpg',
    ],
    'batteries': [
        'products/battery-li.jpg',
        'products/battery-pack2.jpg',
        'products/battery-storage.jpg',
    ],
    'inverters': [
        'products/inverter-setup.jpg',
        'products/inverter-unit2.jpg',
        'products/inverter-battery.jpg',
    ],
    'ev-chargers': [
        'products/ev-charger-home.jpg',
        'products/ev-charging-station.jpg',
        'products/ev-fast-b499b8.jpg',
        'products/ev-portable.jpg',
    ],
    'controllers': ['products/inverter-unit2.jpg'],
    'monitoring': ['products/inverter-setup.jpg'],
    'mounting': ['products/solar-panel-rooftop.jpg'],
    'accessories': ['products/solar-panel-close.jpg'],
    'heating': ['products/solar-panel-field.jpg'],
}
FALLBACK_IMAGES = ['products/solar-panel-array.jpg']


class Command(BaseCommand):
    help = 'Reprice INR-era products, consolidate duplicate categories, and backfill product images.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Report what would change without writing anything.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        dry = options['dry_run']
        if dry:
            self.stdout.write(self.style.WARNING('DRY RUN — no changes will be saved.\n'))

        self._reprice(dry)
        self._merge_categories(dry)
        self._purge_categories(dry)
        self._backfill_images(dry)

        if dry:
            transaction.set_rollback(True)
            self.stdout.write(self.style.WARNING('\nDry run complete — rolled back.'))
        else:
            self.stdout.write(self.style.SUCCESS('\nCatalogue clean-up complete.'))

    # ── steps ───────────────────────────────────────────────────────────────

    def _reprice(self, dry):
        self.stdout.write(self.style.MIGRATE_HEADING('Repricing INR-era products'))
        changed = 0
        for name, new_price in PRICE_FIXES.items():
            product = Product.objects.filter(name=name).first()
            if not product:
                self.stdout.write(f'  skip (not found): {name}')
                continue
            target = Decimal(new_price)
            if product.price == target:
                continue
            self.stdout.write(
                f'  {name[:48]:48} {float(product.price):>10,.2f} -> {float(target):>9,.2f}'
            )
            if not dry:
                product.price = target
                product.save(update_fields=['price'])
            changed += 1
        self.stdout.write(f'  {changed} product(s) repriced.\n')

    def _merge_categories(self, dry):
        self.stdout.write(self.style.MIGRATE_HEADING('Consolidating duplicate categories'))
        for dup_slug, canonical_slug in CATEGORY_MERGES.items():
            dup = Category.objects.filter(slug=dup_slug).first()
            canonical = Category.objects.filter(slug=canonical_slug).first()
            if not dup:
                continue
            if not canonical:
                self.stdout.write(self.style.ERROR(
                    f'  canonical category "{canonical_slug}" missing; leaving "{dup_slug}" alone'
                ))
                continue
            moved = dup.products.count()
            self.stdout.write(f'  {dup.name} -> {canonical.name} ({moved} product(s))')
            if not dry:
                dup.products.update(category=canonical)
                dup.delete()
        self.stdout.write('')

    def _purge_categories(self, dry):
        self.stdout.write(self.style.MIGRATE_HEADING('Removing test/junk categories'))
        for slug in CATEGORY_PURGE:
            cat = Category.objects.filter(slug=slug).first()
            if not cat:
                continue
            for product in cat.products.all():
                self.stdout.write(f'  deleting product: {product.name}')
                if not dry:
                    product.delete()
            self.stdout.write(f'  deleting category: {cat.name}')
            if not dry:
                cat.delete()
        self.stdout.write('')

    def _backfill_images(self, dry):
        self.stdout.write(self.style.MIGRATE_HEADING('Backfilling missing product images'))
        missing = (
            Product.objects.filter(images__isnull=True)
            .select_related('category')
            .distinct()
            .order_by('category__slug', 'name')
        )
        counters: dict[str, int] = {}
        added = 0
        for product in missing:
            slug = product.category.slug if product.category else ''
            pool = CATEGORY_IMAGES.get(slug, FALLBACK_IMAGES)
            idx = counters.get(slug, 0)
            counters[slug] = idx + 1
            path = pool[idx % len(pool)]

            self.stdout.write(f'  {product.name[:50]:50} <- {path}')
            if not dry:
                ProductImage.objects.create(
                    product=product,
                    image=path,
                    alt_text=f'{product.name} — Eco Planet Solar',
                    is_primary=True,
                    sort_order=0,
                )
            added += 1
        self.stdout.write(f'  {added} image(s) attached.\n')
