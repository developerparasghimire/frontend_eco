"""
Shipping zones, rates and quote calculation.

A `ShippingZone` maps a list of states/regions to a flat shipping rate,
estimated delivery window, and an optional free-shipping threshold. The
`quote_for_address(...)` helper returns the best matching zone for a given
state, falling back to project-wide defaults.
"""
from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import models

from apps.base import TimeStampedModel


class ShippingZone(TimeStampedModel):
    """A geographical zone with its own shipping rate + ETA."""

    name = models.CharField(max_length=120, unique=True)
    states = models.TextField(
        help_text='Comma-separated state names this zone covers (case-insensitive).',
    )
    country = models.CharField(max_length=100, default='India')
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    free_above = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Subtotal threshold above which shipping is free.',
    )
    estimated_days_min = models.PositiveSmallIntegerField(default=3)
    estimated_days_max = models.PositiveSmallIntegerField(default=7)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimeStampedModel.Meta):
        ordering = ['name']

    def __str__(self):
        return f'{self.name} (₹{self.rate})'

    def covers(self, state: str) -> bool:
        target = (state or '').strip().lower()
        if not target:
            return False
        return any(s.strip().lower() == target for s in self.states.split(','))


def quote_for_address(*, state: str, country: str, subtotal: Decimal) -> dict:
    """
    Return shipping quote for an address: {cost, zone, eta_min, eta_max}.

    Falls back to settings.DEFAULT_SHIPPING_RATE / FREE_SHIPPING_ABOVE
    if no matching zone is configured.
    """
    subtotal = Decimal(subtotal or 0)
    zone = next(
        (z for z in ShippingZone.objects.filter(is_active=True, country__iexact=country)
         if z.covers(state)),
        None,
    )

    if zone:
        cost = Decimal('0') if (zone.free_above and subtotal >= zone.free_above) else zone.rate
        return {
            'cost': cost,
            'zone': zone.name,
            'eta_min': zone.estimated_days_min,
            'eta_max': zone.estimated_days_max,
        }

    default_rate = Decimal(settings.DEFAULT_SHIPPING_RATE)
    free_above = Decimal(settings.FREE_SHIPPING_ABOVE)
    cost = Decimal('0') if (free_above and subtotal >= free_above) else default_rate
    return {'cost': cost, 'zone': 'standard', 'eta_min': 3, 'eta_max': 7}
