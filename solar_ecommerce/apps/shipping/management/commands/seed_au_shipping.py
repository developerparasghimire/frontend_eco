"""
Replace the legacy Indian shipping zones with Australian ones.

The store shipped with six Indian zones (North India, South India, ...) priced
in Rupees. No Australian address matched any of them, so every order silently
fell through to DEFAULT_SHIPPING_RATE = 0 and got free shipping — even though
the storefront advertises "Free shipping over $500", which implies shipping is
charged below that threshold.

Each zone lists both the abbreviation and the full state name, because the
checkout form lets customers type either. Re-running is safe.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.shipping.models import ShippingZone

FREE_ABOVE = Decimal('500.00')

AU_ZONES = [
    {
        'name': 'East Coast Metro',
        'states': 'NSW,New South Wales,VIC,Victoria,QLD,Queensland,ACT,Australian Capital Territory',
        'rate': Decimal('19.95'),
        'estimated_days_min': 2,
        'estimated_days_max': 5,
    },
    {
        'name': 'South Australia',
        'states': 'SA,South Australia',
        'rate': Decimal('24.95'),
        'estimated_days_min': 3,
        'estimated_days_max': 6,
    },
    {
        'name': 'Tasmania',
        'states': 'TAS,Tasmania',
        'rate': Decimal('34.95'),
        'estimated_days_min': 5,
        'estimated_days_max': 9,
    },
    {
        'name': 'Western Australia',
        'states': 'WA,Western Australia',
        'rate': Decimal('39.95'),
        'estimated_days_min': 5,
        'estimated_days_max': 10,
    },
    {
        'name': 'Northern Territory & Remote',
        'states': 'NT,Northern Territory',
        'rate': Decimal('49.95'),
        'estimated_days_min': 7,
        'estimated_days_max': 14,
    },
]


class Command(BaseCommand):
    help = 'Replace legacy Indian shipping zones with Australian state-based zones.'

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

        stale = ShippingZone.objects.exclude(country__iexact='Australia')
        if stale.exists():
            self.stdout.write(self.style.MIGRATE_HEADING('Removing non-Australian zones'))
            for zone in stale:
                self.stdout.write(f'  - {zone.name} ({zone.country}, rate {zone.rate})')
            if not dry:
                stale.delete()
            self.stdout.write('')

        self.stdout.write(self.style.MIGRATE_HEADING('Australian zones'))
        for spec in AU_ZONES:
            defaults = {
                **spec,
                'country': 'Australia',
                'free_above': FREE_ABOVE,
                'is_active': True,
            }
            name = defaults.pop('name')
            if dry:
                exists = ShippingZone.objects.filter(name=name).exists()
                action = 'update' if exists else 'create'
            else:
                _, created = ShippingZone.objects.update_or_create(
                    name=name, defaults=defaults,
                )
                action = 'created' if created else 'updated'
            self.stdout.write(
                f'  {action:8} {name:30} ${defaults["rate"]:>6} '
                f'free>${FREE_ABOVE}  {defaults["estimated_days_min"]}-'
                f'{defaults["estimated_days_max"]}d'
            )

        if dry:
            transaction.set_rollback(True)
            self.stdout.write(self.style.WARNING('\nDry run complete — rolled back.'))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'\n{len(AU_ZONES)} Australian shipping zones configured.'
            ))
