"""
Seed real product catalog: Solar Panels, Batteries, Inverters.
Run: python manage.py seed_catalog
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.products.models import Category, Product

CATALOG = [
    # ── Solar Panels ─────────────────────────────────────────────────────────
    {
        'category': 'Solar Panels',
        'name': 'LONGi Hi-MO X10 Explorer LR7-54HVH 490W',
        'sku': 'LON-LR7-54HVH-490',
        'brand': 'LONGi',
        'price': '460.00',
        'capacity': '490W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 50,
        'is_featured': True,
        'tags': 'solar panel,monocrystalline,BC cell,longi,490w',
        'description': (
            'LONGi Hi-MO X10 Explorer — the most advanced residential solar panel '
            'from LONGi, featuring cutting-edge BC (Back Contact) Cell Technology for '
            'maximum efficiency and aesthetic appeal. Available in 475W, 480W, 485W and 490W.'
        ),
        'technical_description': (
            'Brand: LONGi | Series: Hi-MO X10 Explorer | Model: LR7-54HVH | '
            'Product Type: Monocrystalline Solar Panel | Cell Technology: BC Cell Technology | '
            'Available Wattage: 475W, 480W, 485W, 490W | '
            'Product Warranty: 25 Years | Performance Warranty: 30 Years'
        ),
    },
    {
        'category': 'Solar Panels',
        'name': 'Trina Vertex S+ TSM-XXXNEG9RH.28 475W',
        'sku': 'TRI-TSM-NEG9RH-475',
        'brand': 'Trina Solar',
        'price': '430.00',
        'capacity': '475W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 60,
        'is_featured': True,
        'tags': 'solar panel,monocrystalline,trina,vertex s+,475w',
        'description': (
            'Trina Solar Vertex S+ — a premium N-type monocrystalline module from the '
            'Vertex S+ series offering excellent performance in real-world conditions. '
            'Available in 440W, 445W, 450W, 455W, 460W, 465W, 470W and 475W.'
        ),
        'technical_description': (
            'Brand: Trina Solar | Series: Vertex S+ | Model: TSM-XXXNEG9RH.28 | '
            'Product Type: Monocrystalline Module | '
            'Available Wattages: 440W, 445W, 450W, 455W, 460W, 465W, 470W, 475W | '
            'Product Warranty: 25 Years | Power Warranty: 30 Years'
        ),
    },
    {
        'category': 'Solar Panels',
        'name': 'JA Solar DeepBlue 4.0 Pro JAM54D40 LR 475W',
        'sku': 'JAS-JAM54D40LR-475',
        'brand': 'JA Solar',
        'price': '415.00',
        'capacity': '475W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 70,
        'is_featured': False,
        'tags': 'solar panel,n-type,double glass,ja solar,deepblue,475w',
        'description': (
            'JA Solar DeepBlue 4.0 Pro — an N-type Double Glass Monofacial Module '
            'engineered for superior energy yield and long-term durability. '
            'Available in 450W, 455W, 460W, 465W, 470W and 475W.'
        ),
        'technical_description': (
            'Brand: JA Solar | Series: DeepBlue 4.0 Pro | Model: JAM54D40 LR | '
            'Product Type: N-type Double Glass Monofacial Module | '
            'Available Wattages: 450W, 455W, 460W, 465W, 470W, 475W | '
            'Warranty: 25 Years'
        ),
    },
    {
        'category': 'Solar Panels',
        'name': 'Suntech Ultra V Pro Mini STPXXXS-H48-Nth+ 455W',
        'sku': 'SUN-STPXXXS-H48-455',
        'brand': 'Suntech',
        'price': '395.00',
        'capacity': '455W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 40,
        'is_featured': False,
        'tags': 'solar panel,n-type,topcon,bifacial,suntech,455w',
        'description': (
            'Suntech Ultra V Pro Mini — a Half-Cell N-Type TOPCon Transparent Black '
            'Glass-Glass Bifacial Module offering exceptional power output in a compact size. '
            'Available in 435W, 440W, 445W, 450W and 455W.'
        ),
        'technical_description': (
            'Brand: Suntech | Series: Ultra V Pro Mini | Model: STPXXXS-H48-Nth+ | '
            'Product Type: Half-Cell N-Type TOPCon Transparent Black Glass-Glass Bifacial Module | '
            'Available Wattages: 435W, 440W, 445W, 450W, 455W | '
            'Warranty: 25 Years'
        ),
    },
    {
        'category': 'Solar Panels',
        'name': 'Jinko Solar Tiger Neo JKM515N-60HL4-V 515W',
        'sku': 'JIN-JKM515N-60HL4V',
        'brand': 'Jinko Solar',
        'price': '490.00',
        'capacity': '515W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 45,
        'is_featured': True,
        'tags': 'solar panel,n-type,topcon,jinko,tiger neo,515w',
        'description': (
            'Jinko Solar Tiger Neo — a high-performance N-Type TOPCon Monofacial Module '
            'delivering industry-leading power output of up to 515W. '
            'Available in 490W, 495W, 500W, 505W, 510W and 515W.'
        ),
        'technical_description': (
            'Brand: Jinko Solar | Series: Tiger Neo | Model: JKM490-515N-60HL4-V-Z1-OC | '
            'Product Type: N-Type TOPCon Monofacial Module | '
            'Available Wattages: 490W, 495W, 500W, 505W, 510W, 515W | '
            'Warranty: 25 Years'
        ),
    },
    {
        'category': 'Solar Panels',
        'name': 'Canadian Solar TOPHiKu6 CS6.2-48TD 470W',
        'sku': 'CAN-CS62-48TD-470',
        'brand': 'Canadian Solar',
        'price': '445.00',
        'capacity': '470W',
        'warranty_years': 25,
        'lifespan_years': 30,
        'stock': 55,
        'is_featured': False,
        'tags': 'solar panel,n-type,topcon,canadian solar,470w',
        'description': (
            'Canadian Solar TOPHiKu6 — an N-Type TOPCon Monofacial Module combining '
            'Canadian Solar reliability with next-generation cell technology for superior '
            'efficiency. Available in 440W, 445W, 450W, 455W, 460W, 465W and 470W.'
        ),
        'technical_description': (
            'Brand: Canadian Solar | Series: TOPHiKu6 | Model: CS6.2-48TD | '
            'Product Type: N-Type TOPCon Monofacial Module | Cell Technology: N-Type TOPCon | '
            'Available Wattages: 440W, 445W, 450W, 455W, 460W, 465W, 470W | '
            'Warranty: 25 Years'
        ),
    },

    # ── Batteries ─────────────────────────────────────────────────────────────
    {
        'category': 'Batteries',
        'name': 'FoxESS CQ7 High Voltage Battery 6.96kWh',
        'sku': 'FOX-CQ7-696',
        'brand': 'Fox ESS',
        'price': '5990.00',
        'capacity': '6.96 kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 20,
        'is_featured': True,
        'tags': 'battery,lifepo4,high voltage,foxess,cq7,6.96kwh',
        'description': (
            'FoxESS CQ7 — a High Voltage Energy Storage Battery using proven Lithium Iron '
            'Phosphate (LiFePO₄) chemistry. Single module capacity of 6.96 kWh, scalable '
            'up to 97.44 kWh for larger storage needs. 100% Depth of Discharge.'
        ),
        'technical_description': (
            'Brand: Fox ESS | Series: CQ7 | Product Type: High Voltage Energy Storage Battery | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | '
            'Battery Capacity (Single Module): 6.96 kWh | '
            'Maximum System Capacity: 97.44 kWh | Depth of Discharge (DoD): 100% | '
            'Warranty: 10 Years'
        ),
    },
    {
        'category': 'Batteries',
        'name': 'FoxESS CQ6 High Voltage Battery 5.99kWh',
        'sku': 'FOX-CQ6-599',
        'brand': 'Fox ESS',
        'price': '5290.00',
        'capacity': '5.99 kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 20,
        'is_featured': False,
        'tags': 'battery,lifepo4,high voltage,foxess,cq6,5.99kwh',
        'description': (
            'FoxESS CQ6 — a High Voltage Energy Storage Battery with Lithium Iron Phosphate '
            'chemistry. Single module capacity of 5.99 kWh, scalable from 11.98 kWh up to '
            '83.86 kWh. Designed for residential and light commercial use.'
        ),
        'technical_description': (
            'Brand: Fox ESS | Series: CQ6 | Product Type: High Voltage Energy Storage Battery | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | '
            'Single Module Capacity: 5.99 kWh | '
            'Minimum System Capacity: 11.98 kWh | Maximum System Capacity: 83.86 kWh | '
            'Warranty: 10 Years'
        ),
    },
    {
        'category': 'Batteries',
        'name': 'FoxESS EQ4800 High Voltage Battery 4.66kWh',
        'sku': 'FOX-EQ4800-466',
        'brand': 'Fox ESS',
        'price': '4490.00',
        'capacity': '4.66 kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 25,
        'is_featured': False,
        'tags': 'battery,lifepo4,high voltage,foxess,eq4800,4.66kwh',
        'description': (
            'FoxESS EQ4800 — a compact High Voltage Energy Storage Battery with LiFePO₄ '
            'chemistry. 4.66 kWh per module, stackable from 9.32 kWh up to 41.93 kWh. '
            '100% Depth of Discharge for maximum usable capacity.'
        ),
        'technical_description': (
            'Brand: Fox ESS | Series: EQ4800 | Product Type: High Voltage Energy Storage Battery | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | '
            'Single Module Capacity: 4.66 kWh | '
            'Minimum System Capacity: 9.32 kWh | Maximum System Capacity: 41.93 kWh | '
            'Depth of Discharge (DoD): 100% | Warranty: 10 Years'
        ),
    },
    {
        'category': 'Batteries',
        'name': 'AlphaESS SMILE-M-BAT-13.9P Residential Battery 13.99kWh',
        'sku': 'ALP-SMILE-M-BAT-139',
        'brand': 'AlphaESS',
        'price': '9990.00',
        'capacity': '13.99 kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 15,
        'is_featured': True,
        'tags': 'battery,lifepo4,alphaess,smile,13.99kwh,residential',
        'description': (
            'AlphaESS SMILE-M-BAT-13.9P — a Modular Residential Energy Storage Battery '
            'with a large 13.99 kWh per module capacity. Scale up to 55.99 kWh with '
            '4 modules. 100% Depth of Discharge and LiFePO₄ chemistry for safe, '
            'long-lasting storage.'
        ),
        'technical_description': (
            'Brand: AlphaESS | Series: SMILE-M-BAT Residential Series | '
            'Model: SMILE-M-BAT-13.9P | '
            'Product Type: Modular Residential Energy Storage Battery | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | '
            'Single Module Capacity: 13.99 kWh | '
            'Maximum System Capacity: 55.99 kWh (4 modules) | '
            'Depth of Discharge (DoD): 100% | Warranty: 10 Years'
        ),
    },
    {
        'category': 'Batteries',
        'name': 'KSTAR BlueSpark BP48100 Low Voltage Battery 5.12kWh',
        'sku': 'KST-BP48100-512',
        'brand': 'KSTAR',
        'price': '4990.00',
        'capacity': '5.12 kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 18,
        'is_featured': False,
        'tags': 'battery,lifepo4,kstar,bluespark,5.12kwh,low voltage',
        'description': (
            'KSTAR BlueSpark BP48100 — a Modular Low Voltage Battery Pack with EVE LiFePO₄ '
            'cells. 5.12 kWh per module, expandable up to 40.96 kWh. Up to 98% Depth of '
            'Discharge for exceptional capacity utilisation.'
        ),
        'technical_description': (
            'Brand: KSTAR | Series: BlueSpark Series Battery PACK | Model: BP48100 | '
            'Product Type: Modular Low Voltage Battery Pack | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | Cell Brand: EVE | '
            'Single Module Capacity: 5.12 kWh | Maximum System Capacity: 40.96 kWh | '
            'Maximum Depth of Discharge (DoD): 98% | Warranty: 10 Years'
        ),
    },
    {
        'category': 'Batteries',
        'name': 'GoodWe ESA Series All-in-One 5kW / 10.24kWh',
        'sku': 'GOD-GW5K-EHA-1024',
        'brand': 'GoodWe',
        'price': '8490.00',
        'capacity': '10.24 kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 12,
        'is_featured': True,
        'tags': 'battery,inverter,all-in-one,goodwe,esa,10.24kwh,5kw',
        'description': (
            'GoodWe ESA Series — a Single-Phase All-in-One Home Storage System combining '
            'a 5 kW inverter (GW5K-EHA-G20) with 10.24 kWh of LiFePO₄ battery storage '
            '(2 × GW5.1-BAT-D-G20). The perfect plug-and-play energy storage solution.'
        ),
        'technical_description': (
            'Brand: GoodWe | Series: ESA Series | Inverter Model: GW5K-EHA-G20 | '
            'Battery Configuration: 2 × GW5.1-BAT-D-G20 | '
            'Product Type: Single-Phase All-in-One Home Storage System | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | '
            'System Capacity: 10.24 kWh | Rated Output Power: 5 kW | '
            'Warranty: 10 Years'
        ),
    },
    {
        'category': 'Batteries',
        'name': 'Sungrow SBH100 High Voltage Battery 5.0kWh',
        'sku': 'SUN-SBH100-500',
        'brand': 'Sungrow',
        'price': '5490.00',
        'capacity': '5.0 kWh',
        'warranty_years': 10,
        'lifespan_years': 15,
        'stock': 20,
        'is_featured': False,
        'tags': 'battery,lifepo4,sungrow,sbh100,high voltage,5kwh',
        'description': (
            'Sungrow SBH100 — a High Voltage Energy Storage Battery with 5.0 kWh per module '
            'and 563.2 V nominal voltage. Scale up to 40.0 kWh (8 modules). 100% Depth of '
            'Discharge for maximum energy utilisation. Built by the world\'s largest inverter manufacturer.'
        ),
        'technical_description': (
            'Brand: Sungrow | Series: SBH Series | Model: SBH100 | '
            'Product Type: High Voltage Energy Storage Battery | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | '
            'Battery Module Capacity: 5.0 kWh | System Capacity: 40.0 kWh (8 Modules) | '
            'Nominal Voltage: 563.2 V | Depth of Discharge (DoD): 100% | '
            'Warranty: 10 Years'
        ),
    },

    # ── Inverters ─────────────────────────────────────────────────────────────
    {
        'category': 'Inverters',
        'name': 'Fox ESS H1(G2) Single-Phase Hybrid Inverter 5kW',
        'sku': 'FOX-H1G2-5KW',
        'brand': 'Fox ESS',
        'price': '2990.00',
        'capacity': '5 kW',
        'warranty_years': 10,
        'lifespan_years': 20,
        'stock': 20,
        'is_featured': True,
        'tags': 'inverter,hybrid,single-phase,foxess,h1,5kw',
        'description': (
            'Fox ESS H1(G2) — a Single-Phase Hybrid & AC Inverter delivering 5.0 kW output. '
            'Compatible with LiFePO₄ batteries (80–480 V range). Warranty extendable to '
            '20 years for complete peace of mind.'
        ),
        'technical_description': (
            'Brand: Fox ESS | Series: H1(G2) / AC1(G2) | '
            'Product Type: Single-Phase Hybrid & AC Inverter | Available Models: 5.0 kW | '
            'Maximum Output Power: 5.0 kW | Battery Type: Lithium Iron Phosphate (LiFePO₄) | '
            'Battery Voltage Range: 80–480 V | '
            'Warranty: 10-Year (Extendable to 20 Years)'
        ),
    },
    {
        'category': 'Inverters',
        'name': 'Fox ESS KH Single-Phase Hybrid Inverter 10kW',
        'sku': 'FOX-KH-10KW',
        'brand': 'Fox ESS',
        'price': '3490.00',
        'capacity': '10 kW',
        'warranty_years': 10,
        'lifespan_years': 20,
        'stock': 15,
        'is_featured': True,
        'tags': 'inverter,hybrid,single-phase,foxess,kh,10kw',
        'description': (
            'Fox ESS KH — a high-power Single-Phase Hybrid & AC Inverter available in '
            '8 kW, 9.9 kW and 10 kW models. Compatible with lithium-ion batteries '
            '(85–480 V range). Warranty extendable to 20 years.'
        ),
        'technical_description': (
            'Brand: Fox ESS | Series: KH / KA | '
            'Product Type: Single-Phase Hybrid & AC Inverter | '
            'Available Models: 8 kW, 9.9 kW, 10 kW | Maximum Output Power: 10 kW | '
            'Battery Type: Lithium-Ion | Battery Voltage Range: 85–480 V | '
            'Warranty: 10-Year (Extendable to 20 Years)'
        ),
    },
    {
        'category': 'Inverters',
        'name': 'Sungrow SH10RS Residential Hybrid Inverter 10kW',
        'sku': 'SUN-SH10RS-10KW',
        'brand': 'Sungrow',
        'price': '3290.00',
        'capacity': '10 kW',
        'warranty_years': 10,
        'lifespan_years': 20,
        'stock': 15,
        'is_featured': True,
        'tags': 'inverter,hybrid,single-phase,sungrow,sh10rs,10kw',
        'description': (
            'Sungrow SH10RS — a Residential Hybrid Single Phase Inverter rated at 10 kW. '
            'Supports up to 20,000 Wp PV input and lithium-ion batteries (80–460 V). '
            'From the world\'s largest inverter manufacturer.'
        ),
        'technical_description': (
            'Brand: Sungrow | Series: SH RS Series | Model: SH10RS | '
            'Product Type: Residential Hybrid Single Phase Inverter | '
            'Rated Output Power: 10 kW | Battery Type: Lithium-Ion | '
            'Battery Voltage Range: 80–460 V | '
            'Maximum PV Input Power: 20,000 Wp | Warranty: 10 Years'
        ),
    },
    {
        'category': 'Inverters',
        'name': 'KSTAR BlueSpark E5KS-D22 All-in-One Hybrid ESS 5kW',
        'sku': 'KST-E5KS-D22-5KW',
        'brand': 'KSTAR',
        'price': '2790.00',
        'capacity': '5 kW',
        'warranty_years': 10,
        'lifespan_years': 20,
        'stock': 18,
        'is_featured': False,
        'tags': 'inverter,hybrid,single-phase,kstar,bluespark,5kw,all-in-one',
        'description': (
            'KSTAR BlueSpark E5KS-D22 — a Single-Phase All-in-One Hybrid Energy Storage '
            'System rated at 5 kW. Compatible with LiFePO₄ batteries at 48 V nominal '
            'voltage, supporting 100–400 Ah battery capacity range.'
        ),
        'technical_description': (
            'Brand: KSTAR | Series: BlueSpark Series Residential ESS | Model: E5KS-D22 | '
            'Product Type: Single-Phase All-in-One Hybrid Energy Storage System | '
            'Rated Output Power: 5 kW | Battery Type: Lithium Iron Phosphate (LiFePO₄) | '
            'Battery Voltage: 48 V | Battery Capacity Range: 100–400 Ah | '
            'Warranty: 10 Years'
        ),
    },
    {
        'category': 'Inverters',
        'name': 'GoodWe ESA GW9.999K-EHA-G20 Hybrid Inverter 10kW',
        'sku': 'GOD-GW9999K-EHA-10KW',
        'brand': 'GoodWe',
        'price': '3190.00',
        'capacity': '10 kW',
        'warranty_years': 10,
        'lifespan_years': 20,
        'stock': 12,
        'is_featured': False,
        'tags': 'inverter,hybrid,single-phase,goodwe,esa,10kw',
        'description': (
            'GoodWe ESA GW9.999K-EHA-G20 — a Single-Phase Hybrid Inverter rated at 10 kW '
            'with up to 20 kW PV input. Compatible with LiFePO₄ batteries in the '
            '350–550 V high voltage range. Part of the GoodWe ESA all-in-one ecosystem.'
        ),
        'technical_description': (
            'Brand: GoodWe | Series: ESA Series | Model: GW9.999K-EHA-G20 | '
            'Product Type: Single-Phase Hybrid Inverter | Rated Output Power: 10 kW | '
            'Battery Type: Lithium Iron Phosphate (LiFePO₄) | '
            'Battery Voltage Range: 350–550 V | Maximum PV Input Power: 20 kW | '
            'Warranty: 10 Years'
        ),
    },
    {
        'category': 'Inverters',
        'name': 'AlphaESS SMILE-M5-S All-in-One Hybrid System 5kW',
        'sku': 'ALP-SMILE-M5S-5KW',
        'brand': 'AlphaESS',
        'price': '2990.00',
        'capacity': '5 kW',
        'warranty_years': 10,
        'lifespan_years': 20,
        'stock': 15,
        'is_featured': False,
        'tags': 'inverter,hybrid,single-phase,alphaess,smile,5kw,all-in-one',
        'description': (
            'AlphaESS SMILE-M5-S — a Single-Phase All-in-One Hybrid Energy Storage System '
            'rated at 5 kW. Works with 5 kWh modules (up to 30 kWh) or 13.99 kWh modules '
            '(up to 27.98 kWh). 100% DoD on all battery configurations.'
        ),
        'technical_description': (
            'Brand: AlphaESS | Series: SMILE-M5-S Residential Series | Model: SMILE-M5-S | '
            'Product Type: Single-Phase All-in-One Hybrid Energy Storage System | '
            'Rated Output Power: 5 kW | '
            'Battery Chemistry: Lithium Iron Phosphate (LiFePO₄) | '
            'Battery Capacity Range: 5–30 kWh (5 kWh Modules) / 13.99–27.98 kWh (13.99 kWh Modules) | '
            'Maximum Battery Capacity: 30 kWh (100% DoD) | Warranty: 10 Years'
        ),
    },
]

CATEGORY_DESCRIPTIONS = {
    'Solar Panels': 'High-efficiency monocrystalline and bifacial solar panels from leading global manufacturers.',
    'Batteries': 'Residential and commercial energy storage batteries using proven LiFePO₄ chemistry.',
    'Inverters': 'Single-phase hybrid and all-in-one inverters for residential solar and battery systems.',
}


class Command(BaseCommand):
    help = 'Seed real product catalog (Solar Panels, Batteries, Inverters)'

    def handle(self, *args, **options):
        created_count = 0
        skipped_count = 0

        for item in CATALOG:
            cat_name = item['category']
            cat_desc = CATEGORY_DESCRIPTIONS.get(cat_name, '')
            category, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={'slug': slugify(cat_name), 'description': cat_desc},
            )

            base_slug = slugify(item['name'])
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(sku=item['sku']).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1

            _, created = Product.objects.update_or_create(
                sku=item['sku'],
                defaults={
                    'category': category,
                    'name': item['name'],
                    'slug': slug,
                    'brand': item.get('brand', ''),
                    'price': Decimal(item['price']),
                    'capacity': item.get('capacity', ''),
                    'warranty_years': item.get('warranty_years', 0),
                    'lifespan_years': item.get('lifespan_years', 0),
                    'stock': item.get('stock', 0),
                    'is_featured': item.get('is_featured', False),
                    'is_active': True,
                    'tags': item.get('tags', ''),
                    'description': item.get('description', ''),
                    'technical_description': item.get('technical_description', ''),
                    'delivery_days': 7,
                    'installation_available': True,
                    'installation_fee': Decimal('0.00'),
                },
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  Created: {item["name"]}'))
            else:
                skipped_count += 1
                self.stdout.write(f'  Updated: {item["name"]}')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone — {created_count} created, {skipped_count} updated.'
        ))
