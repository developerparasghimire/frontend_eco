import os
import urllib.request
from decimal import Decimal

from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.products.models import Category, Product, ProductImage

# Copyright-free images from Unsplash (free for commercial use)
IMAGES = {
    'solar-panels': [
        ('https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', 'solar-panel-array.jpg'),
        ('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80', 'solar-panel-rooftop.jpg'),
        ('https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80', 'solar-panel-field.jpg'),
        ('https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&q=80', 'solar-panel-close.jpg'),
    ],
    'solar-batteries': [
        ('https://images.unsplash.com/photo-1619033609897-7d2e01a34f91?w=800&q=80', 'battery-home.jpg'),
        ('https://images.unsplash.com/photo-1605980776566-0486c3b4c0f0?w=800&q=80', 'battery-pack.jpg'),
        ('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'battery-storage.jpg'),
    ],
    'inverter-batteries': [
        ('https://images.unsplash.com/photo-1620714223084-8fcacc2dbe4d?w=800&q=80', 'inverter-unit.jpg'),
        ('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80', 'inverter-setup.jpg'),
        ('https://images.unsplash.com/photo-1544365558-35aa4afcf11f?w=800&q=80', 'inverter-battery.jpg'),
    ],
    'ev-chargers': [
        ('https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80', 'ev-charger-home.jpg'),
        ('https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=800&q=80', 'ev-charging-station.jpg'),
        ('https://images.unsplash.com/photo-1647166545149-8ccdacc65a5b?w=800&q=80', 'ev-fast-charger.jpg'),
    ],
}

PRODUCTS = [
    # ── Solar Panels ──────────────────────────────────────────────────────────
    {
        'category': 'Solar Panels',
        'name': 'EcoSun 400W Monocrystalline Solar Panel',
        'sku': 'ESP-400M-001',
        'price': '11999.00',
        'discount_percent': '5',
        'capacity': '400W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 80,
        'brand': 'EcoSun',
        'delivery_days': 5,
        'installation_available': True,
        'installation_fee': '2500.00',
        'is_featured': True,
        'tags': 'solar panel,monocrystalline,400w,rooftop',
        'description': (
            'The EcoSun 400W Monocrystalline Solar Panel delivers industry-leading efficiency '
            'of up to 21.3% with premium half-cut cell technology. Ideal for residential '
            'rooftop installations, this panel performs exceptionally even in low-light conditions. '
            'Backed by a 25-year linear power output warranty and a 12-year product warranty.'
        ),
        'technical_description': (
            'Peak Power (Pmax): 400W | Efficiency: 21.3% | Voc: 49.5V | Isc: 10.4A | '
            'Vmpp: 41.8V | Impp: 9.57A | Panel Type: Monocrystalline PERC | '
            'Dimensions: 1722 × 1134 × 30mm | Weight: 20.5kg | '
            'Operating Temperature: -40°C to +85°C | IP Rating: IP68'
        ),
        'image_key': 'solar-panels',
        'image_index': 0,
    },
    {
        'category': 'Solar Panels',
        'name': 'EcoSun 540W Bifacial Solar Panel',
        'sku': 'ESP-540B-002',
        'price': '18500.00',
        'discount_percent': '8',
        'capacity': '540W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 50,
        'brand': 'EcoSun',
        'delivery_days': 7,
        'installation_available': True,
        'installation_fee': '3000.00',
        'is_featured': True,
        'tags': 'solar panel,bifacial,540w,high efficiency',
        'description': (
            'The EcoSun 540W Bifacial panel captures sunlight from both sides, '
            'generating up to 30% more energy than standard panels. Perfect for '
            'ground-mount and commercial installations. Features anti-reflective '
            'tempered glass on both sides for maximum energy harvest.'
        ),
        'technical_description': (
            'Peak Power (Pmax): 540W | Bifacial Gain: Up to 30% | Efficiency: 21.5% | '
            'Voc: 52.2V | Isc: 13.88A | Panel Type: Bifacial Monocrystalline | '
            'Dimensions: 2278 × 1134 × 35mm | Weight: 28.5kg | '
            'Wind Load: 2400 Pa | Snow Load: 5400 Pa | IP Rating: IP68'
        ),
        'image_key': 'solar-panels',
        'image_index': 1,
    },
    {
        'category': 'Solar Panels',
        'name': 'EcoSun 330W Polycrystalline Solar Panel',
        'sku': 'ESP-330P-003',
        'price': '8999.00',
        'discount_percent': '10',
        'capacity': '330W',
        'warranty_years': 20,
        'lifespan_years': 25,
        'stock': 120,
        'brand': 'EcoSun',
        'delivery_days': 3,
        'installation_available': True,
        'installation_fee': '2000.00',
        'is_featured': False,
        'tags': 'solar panel,polycrystalline,330w,budget',
        'description': (
            'The EcoSun 330W Polycrystalline panel is the ideal budget-friendly option '
            'for homeowners entering solar. Offers reliable performance with proven '
            'polycrystalline technology at an affordable price point. Great for '
            'small to medium residential systems.'
        ),
        'technical_description': (
            'Peak Power (Pmax): 330W | Efficiency: 17.0% | Voc: 45.8V | Isc: 9.04A | '
            'Panel Type: Polycrystalline | Dimensions: 1960 × 990 × 40mm | '
            'Weight: 22.5kg | Operating Temperature: -40°C to +85°C | IP Rating: IP67'
        ),
        'image_key': 'solar-panels',
        'image_index': 2,
    },
    {
        'category': 'Solar Panels',
        'name': 'EcoSun 550W Half-Cut PERC Solar Panel',
        'sku': 'ESP-550HC-004',
        'price': '22000.00',
        'discount_percent': '5',
        'capacity': '550W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 35,
        'brand': 'EcoSun',
        'delivery_days': 7,
        'installation_available': True,
        'installation_fee': '3500.00',
        'is_featured': True,
        'tags': 'solar panel,half-cut,perc,550w,premium',
        'description': (
            'The top-of-the-line EcoSun 550W Half-Cut PERC panel features 144 '
            'half-cut cells for reduced resistive losses and improved shade tolerance. '
            'Delivers the highest power output in our residential range. Ideal for '
            'maximising energy production from limited roof space.'
        ),
        'technical_description': (
            'Peak Power (Pmax): 550W | Efficiency: 21.8% | Cell Type: 144 Half-Cut PERC | '
            'Voc: 53.6V | Isc: 13.99A | Dimensions: 2279 × 1134 × 35mm | '
            'Weight: 29.0kg | Hail Resistance: 35mm @ 97 km/h | IP Rating: IP68'
        ),
        'image_key': 'solar-panels',
        'image_index': 3,
    },

    # ── Solar Batteries ───────────────────────────────────────────────────────
    {
        'category': 'Solar Batteries',
        'name': 'PowerStore 5kWh Lithium Solar Battery',
        'sku': 'PSB-5K-LFP-001',
        'price': '49999.00',
        'discount_percent': '5',
        'capacity': '5kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 25,
        'brand': 'PowerStore',
        'delivery_days': 7,
        'installation_available': True,
        'installation_fee': '4000.00',
        'is_featured': True,
        'tags': 'solar battery,lithium,5kwh,lifepo4,home storage',
        'description': (
            'The PowerStore 5kWh LiFePO4 battery is the most popular home energy '
            'storage solution. Stores excess solar energy for use at night or during '
            'power cuts. Features built-in BMS (Battery Management System) for '
            'safe and efficient operation. Stackable to 20kWh.'
        ),
        'technical_description': (
            'Capacity: 5kWh | Chemistry: LiFePO4 (Lithium Iron Phosphate) | '
            'Usable Capacity: 95% (4.75kWh) | Cycle Life: 6000+ cycles | '
            'Voltage: 48V | Max Charge/Discharge: 100A | '
            'Dimensions: 442 × 410 × 132mm | Weight: 48kg | '
            'IP Rating: IP55 | Operating Temp: -10°C to 50°C'
        ),
        'image_key': 'solar-batteries',
        'image_index': 0,
    },
    {
        'category': 'Solar Batteries',
        'name': 'PowerStore 10kWh Lithium Solar Battery',
        'sku': 'PSB-10K-LFP-002',
        'price': '89999.00',
        'discount_percent': '8',
        'capacity': '10kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 15,
        'brand': 'PowerStore',
        'delivery_days': 10,
        'installation_available': True,
        'installation_fee': '5000.00',
        'is_featured': True,
        'tags': 'solar battery,lithium,10kwh,lifepo4,large storage',
        'description': (
            'The PowerStore 10kWh is our premium home battery for larger households '
            'and small businesses. Provides up to 9.5kWh of usable storage to power '
            'your home through the night and beyond. Compatible with all major solar '
            'inverters. Remote monitoring via app included.'
        ),
        'technical_description': (
            'Capacity: 10kWh | Chemistry: LiFePO4 | Usable Capacity: 95% (9.5kWh) | '
            'Cycle Life: 6000+ cycles @ 80% DoD | Voltage: 48V | '
            'Peak Discharge: 200A | Communication: CAN / RS485 / Wi-Fi | '
            'Dimensions: 442 × 410 × 264mm | Weight: 95kg | IP Rating: IP55'
        ),
        'image_key': 'solar-batteries',
        'image_index': 1,
    },
    {
        'category': 'Solar Batteries',
        'name': 'PowerStore 2.5kWh Wall-Mount Battery',
        'sku': 'PSB-2K5-WALL-003',
        'price': '29999.00',
        'discount_percent': '10',
        'capacity': '2.5kWh',
        'warranty_years': 8,
        'lifespan_years': 12,
        'stock': 40,
        'brand': 'PowerStore',
        'delivery_days': 5,
        'installation_available': True,
        'installation_fee': '2500.00',
        'is_featured': False,
        'tags': 'solar battery,wall mount,compact,2.5kwh',
        'description': (
            'The PowerStore 2.5kWh Wall-Mount battery is perfect for apartments and '
            'smaller homes. Compact wall-mounted design saves floor space. Provides '
            'backup power during outages and stores solar energy generated during the day. '
            'Expandable to 7.5kWh with two additional modules.'
        ),
        'technical_description': (
            'Capacity: 2.5kWh | Usable Capacity: 90% (2.25kWh) | '
            'Cycle Life: 4000+ cycles | Voltage: 24V | '
            'Max Continuous Discharge: 50A | Wall-Mount Design | '
            'Dimensions: 520 × 440 × 150mm | Weight: 25kg | IP Rating: IP54'
        ),
        'image_key': 'solar-batteries',
        'image_index': 2,
    },

    # ── Solar Inverter Batteries ───────────────────────────────────────────────
    {
        'category': 'Solar Inverter Batteries',
        'name': 'EcoPower 150Ah Tall Tubular Inverter Battery',
        'sku': 'EPIB-150TT-001',
        'price': '12500.00',
        'discount_percent': '5',
        'capacity': '150Ah',
        'warranty_years': 5,
        'lifespan_years': 8,
        'stock': 60,
        'brand': 'EcoPower',
        'delivery_days': 3,
        'installation_available': True,
        'installation_fee': '500.00',
        'is_featured': True,
        'tags': 'inverter battery,tubular,150ah,tall tubular',
        'description': (
            'The EcoPower 150Ah Tall Tubular battery is engineered for Indian power '
            'conditions with frequent outages. Features thick positive tubular plates '
            'for longer life and better performance under heavy discharge. Suitable '
            'for 850VA to 1100VA inverters. Low maintenance design.'
        ),
        'technical_description': (
            'Capacity: 150Ah (C20) | Voltage: 12V | Type: Tall Tubular | '
            'Charging Voltage: 14.4 – 14.8V | Self-Discharge: <3% per month | '
            'Electrolyte: Dilute Sulphuric Acid | '
            'Dimensions: 502 × 188 × 410mm | Weight: 57kg | '
            'Terminal: Bolt Type | BIS Certified'
        ),
        'image_key': 'inverter-batteries',
        'image_index': 0,
    },
    {
        'category': 'Solar Inverter Batteries',
        'name': 'EcoPower 200Ah Tall Tubular Inverter Battery',
        'sku': 'EPIB-200TT-002',
        'price': '16500.00',
        'discount_percent': '8',
        'capacity': '200Ah',
        'warranty_years': 5,
        'lifespan_years': 8,
        'stock': 40,
        'brand': 'EcoPower',
        'delivery_days': 5,
        'installation_available': True,
        'installation_fee': '500.00',
        'is_featured': True,
        'tags': 'inverter battery,tubular,200ah,heavy duty',
        'description': (
            'The EcoPower 200Ah Tall Tubular battery delivers extended backup for '
            'homes with high power needs. Ideal for 1500VA to 2000VA inverters. '
            'Special low-antimony alloy spine ensures minimal water loss and '
            'reduced maintenance intervals. Heat-sealed polypropylene container.'
        ),
        'technical_description': (
            'Capacity: 200Ah (C20) | Voltage: 12V | Type: Tall Tubular | '
            'Backup (approx): 8–10 hours for 3–4 fan + LED load | '
            'Dimensions: 502 × 188 × 450mm | Weight: 72kg | '
            'Warranty: 5 Years (36M full + 24M prorated) | BIS Certified'
        ),
        'image_key': 'inverter-batteries',
        'image_index': 1,
    },
    {
        'category': 'Solar Inverter Batteries',
        'name': 'EcoPower 100Ah VRLA Maintenance-Free Battery',
        'sku': 'EPIB-100VRLA-003',
        'price': '7999.00',
        'discount_percent': '12',
        'capacity': '100Ah',
        'warranty_years': 3,
        'lifespan_years': 5,
        'stock': 80,
        'brand': 'EcoPower',
        'delivery_days': 2,
        'installation_available': False,
        'installation_fee': '0.00',
        'is_featured': False,
        'tags': 'inverter battery,vrla,sealed,maintenance-free,100ah',
        'description': (
            'The EcoPower 100Ah VRLA (Valve Regulated Lead Acid) battery is completely '
            'sealed and maintenance-free — no need to add water ever. Safe for indoor '
            'use with zero acid spillage risk. Compact size fits most home inverter '
            'cabinets. Compatible with all brands of home inverters.'
        ),
        'technical_description': (
            'Capacity: 100Ah | Voltage: 12V | Type: VRLA / AGM Sealed | '
            'Self-Discharge: <2% per month | Float Voltage: 13.5–13.8V | '
            'Max Charge Current: 25A | Dimensions: 410 × 176 × 230mm | '
            'Weight: 30kg | Operating Temp: 0°C to 45°C'
        ),
        'image_key': 'inverter-batteries',
        'image_index': 2,
    },

    # ── EV Chargers ───────────────────────────────────────────────────────────
    {
        'category': 'EV Chargers',
        'name': 'EcoCharge 7.2kW AC Home EV Charger',
        'sku': 'EVC-7K2-AC-001',
        'price': '34999.00',
        'discount_percent': '5',
        'capacity': '7.2kW',
        'warranty_years': 3,
        'lifespan_years': 10,
        'stock': 30,
        'brand': 'EcoCharge',
        'delivery_days': 5,
        'installation_available': True,
        'installation_fee': '3500.00',
        'is_featured': True,
        'tags': 'ev charger,home charger,7.2kw,ac charger,type2',
        'description': (
            'The EcoCharge 7.2kW is the best-selling home EV charger in India. '
            'Charges most electric cars 5–6× faster than a standard 3-pin socket. '
            'Smart features include scheduled charging, energy monitoring, and '
            'remote control via mobile app. Compatible with all EVs and plug-in hybrids. '
            'Works seamlessly with your solar system.'
        ),
        'technical_description': (
            'Output Power: 7.2kW (single phase) | Output Current: 32A | '
            'Input: 230V AC 50Hz | Connector: Type 2 (IEC 62196) | '
            'Cable Length: 5m | Protection: IP55, IK10 | '
            'Certifications: CE, BIS | Smart Features: Wi-Fi, App Control, '
            'OCPP 1.6 Compatible | Dimensions: 300 × 210 × 100mm'
        ),
        'image_key': 'ev-chargers',
        'image_index': 0,
    },
    {
        'category': 'EV Chargers',
        'name': 'EcoCharge 22kW AC Commercial EV Charger',
        'sku': 'EVC-22K-AC-002',
        'price': '84999.00',
        'discount_percent': '8',
        'capacity': '22kW',
        'warranty_years': 3,
        'lifespan_years': 10,
        'stock': 15,
        'brand': 'EcoCharge',
        'delivery_days': 10,
        'installation_available': True,
        'installation_fee': '8000.00',
        'is_featured': True,
        'tags': 'ev charger,commercial,22kw,three phase,fast charger',
        'description': (
            'The EcoCharge 22kW three-phase charger is ideal for offices, malls, '
            'hotels, and apartment complexes. Charges most EVs in 1–3 hours. '
            'Dual connector allows simultaneous charging of two vehicles. '
            'OCPP 2.0 compatible for fleet management and billing integration. '
            'Built-in energy metering and load balancing.'
        ),
        'technical_description': (
            'Output Power: 22kW (3-phase) | Output Current: 32A per phase | '
            'Input: 400V AC 3-phase 50Hz | Connectors: 2× Type 2 | '
            'Cable Length: 5m each | Protection: IP54 | '
            'Certifications: CE, BIS | OCPP 1.6 / 2.0 | '
            'Display: 7" TFT touchscreen | RFID Access Control'
        ),
        'image_key': 'ev-chargers',
        'image_index': 1,
    },
    {
        'category': 'EV Chargers',
        'name': 'EcoCharge 50kW DC Fast Charger',
        'sku': 'EVC-50K-DC-003',
        'price': '249999.00',
        'discount_percent': '5',
        'capacity': '50kW',
        'warranty_years': 2,
        'lifespan_years': 8,
        'stock': 5,
        'brand': 'EcoCharge',
        'delivery_days': 14,
        'installation_available': True,
        'installation_fee': '25000.00',
        'is_featured': False,
        'tags': 'ev charger,dc fast charger,50kw,ccs,chademo,highway',
        'description': (
            'The EcoCharge 50kW DC Fast Charger delivers a rapid charge in 20–30 minutes '
            'for most EVs. Designed for highway rest stops, petrol stations, and large '
            'commercial facilities. Supports CCS2, CHAdeMO, and AC Type 2 simultaneously. '
            'Solar-compatible with optional solar priority charging mode.'
        ),
        'technical_description': (
            'Output Power: 50kW DC | Output Voltage: 150–500V DC | '
            'Max Output Current: 120A DC | AC Input: 415V 3-phase | '
            'Connectors: CCS2 + CHAdeMO + AC Type 2 | '
            'Charging Time: ~25 min (20%→80% for 40kWh battery) | '
            'Protection: IP54 | Operating Temp: -20°C to +55°C | '
            'Certifications: CE, IEC 61851, BIS'
        ),
        'image_key': 'ev-chargers',
        'image_index': 2,
    },
    {
        'category': 'EV Chargers',
        'name': 'EcoCharge 3.3kW Portable EV Charger',
        'sku': 'EVC-3K3-PORT-004',
        'price': '12999.00',
        'discount_percent': '10',
        'capacity': '3.3kW',
        'warranty_years': 2,
        'lifespan_years': 7,
        'stock': 50,
        'brand': 'EcoCharge',
        'delivery_days': 3,
        'installation_available': False,
        'installation_fee': '0.00',
        'is_featured': False,
        'tags': 'ev charger,portable,3.3kw,travel charger,plug in',
        'description': (
            'The EcoCharge 3.3kW Portable Charger is the must-have travel companion '
            'for every EV owner. Plugs into any standard 15A socket. Charges overnight '
            'for most EVs. Adjustable current (8A / 10A / 16A) to suit different '
            'power outlets. Compact carry case included. No installation required.'
        ),
        'technical_description': (
            'Output Power: 3.3kW | Adjustable Current: 8A / 10A / 16A | '
            'Input: 230V AC single phase | Connector: Type 2 gun | '
            'Cable Length: 5m | Protection: IP55 | '
            'Safety: Over-current, over-voltage, over-temperature, earth fault | '
            'Weight: 1.2kg | Certifications: CE, BIS'
        ),
        'image_key': 'ev-chargers',
        'image_index': 3,
    },
]


def download_image(url, filename, tmp_dir='/tmp/seed_images'):
    os.makedirs(tmp_dir, exist_ok=True)
    filepath = os.path.join(tmp_dir, filename)
    if not os.path.exists(filepath):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp, open(filepath, 'wb') as f:
                f.write(resp.read())
        except Exception as exc:
            return None
    return filepath


class Command(BaseCommand):
    help = 'Seed demo products: Solar Panels, Solar Batteries, Inverter Batteries, EV Chargers'

    def handle(self, *args, **options):
        self.stdout.write('Creating categories...')
        category_names = ['Solar Panels', 'Solar Batteries', 'Solar Inverter Batteries', 'EV Chargers']
        cat_objs = {}
        for name in category_names:
            obj, created = Category.objects.get_or_create(
                slug=slugify(name), defaults={'name': name, 'is_active': True}
            )
            cat_objs[name] = obj
            self.stdout.write(f'  {"Created" if created else "Exists"}: {name}')

        self.stdout.write('\nCreating products...')
        for p in PRODUCTS:
            slug = slugify(p['name'])
            # ensure unique slug
            base_slug, n = slug, 1
            while Product.objects.filter(slug=slug).exclude(sku=p['sku']).exists():
                slug = f'{base_slug}-{n}'; n += 1

            product, created = Product.objects.update_or_create(
                sku=p['sku'],
                defaults={
                    'category': cat_objs[p['category']],
                    'name': p['name'],
                    'slug': slug,
                    'description': p['description'],
                    'technical_description': p['technical_description'],
                    'price': Decimal(p['price']),
                    'discount_percent': Decimal(p['discount_percent']),
                    'capacity': p['capacity'],
                    'warranty_years': p['warranty_years'],
                    'lifespan_years': p['lifespan_years'],
                    'stock': p['stock'],
                    'brand': p['brand'],
                    'delivery_days': p['delivery_days'],
                    'installation_available': p['installation_available'],
                    'installation_fee': Decimal(p['installation_fee']),
                    'is_featured': p['is_featured'],
                    'is_active': True,
                    'tags': p['tags'],
                },
            )
            self.stdout.write(f'  {"Created" if created else "Updated"}: {product.name}')

            # Add primary image if none exists
            if not product.images.exists():
                key = p['image_key']
                idx = p['image_index']
                if key in IMAGES and idx < len(IMAGES[key]):
                    url, fname = IMAGES[key][idx]
                    self.stdout.write(f'    Downloading image: {fname}')
                    filepath = download_image(url, fname)
                    if filepath and os.path.exists(filepath):
                        with open(filepath, 'rb') as img_f:
                            pi = ProductImage(product=product, is_primary=True, sort_order=0,
                                              alt_text=product.name)
                            pi.image.save(fname, File(img_f), save=True)
                        self.stdout.write(f'    Image saved: {fname}')
                    else:
                        self.stdout.write(f'    Image download failed (skipped)')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! {len(PRODUCTS)} products across {len(category_names)} categories seeded.'
        ))
