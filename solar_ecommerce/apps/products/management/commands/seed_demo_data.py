"""
Seed demo data for client presentation:
- Shipping zones (India regions)
- Coupons (SOLAR10, WELCOME20, FLAT500, BUNDLE15, NEWCLIENT)
- Demo customer users
- Product reviews
- Contact messages
- Newsletter subscribers
"""
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


DEMO_CUSTOMERS = [
    {'email': 'rahul.sharma@gmail.com', 'first_name': 'Rahul', 'last_name': 'Sharma', 'username': 'rahulsharma'},
    {'email': 'priya.patel@gmail.com', 'first_name': 'Priya', 'last_name': 'Patel', 'username': 'priyapatel'},
    {'email': 'amit.kumar@yahoo.com', 'first_name': 'Amit', 'last_name': 'Kumar', 'username': 'amitkumar'},
    {'email': 'sunita.mehta@outlook.com', 'first_name': 'Sunita', 'last_name': 'Mehta', 'username': 'sunitamehta'},
    {'email': 'deepak.singh@gmail.com', 'first_name': 'Deepak', 'last_name': 'Singh', 'username': 'deepaksingh'},
    {'email': 'anjali.verma@gmail.com', 'first_name': 'Anjali', 'last_name': 'Verma', 'username': 'anjaliverma'},
    {'email': 'vikram.nair@gmail.com', 'first_name': 'Vikram', 'last_name': 'Nair', 'username': 'vikramnair'},
    {'email': 'kavita.reddy@gmail.com', 'first_name': 'Kavita', 'last_name': 'Reddy', 'username': 'kavitareddy'},
]

REVIEWS_DATA = [
    # Solar Panels
    {
        'product_sku': 'ESP-400M-001',
        'customer': 'rahul.sharma@gmail.com',
        'rating': 5,
        'title': 'Excellent performance, highly recommended!',
        'comment': (
            'I installed 6 of these panels on my rooftop 3 months ago and the results have been '
            'outstanding. My electricity bill has dropped by 80%. The panel quality is top-notch '
            'and installation team from EcoPlanet was very professional. Worth every rupee!'
        ),
    },
    {
        'product_sku': 'ESP-400M-001',
        'customer': 'priya.patel@gmail.com',
        'rating': 4,
        'title': 'Great panel, delivery was slightly delayed',
        'comment': (
            'The panel performance is exactly as described. Generating about 1.8-2.0 units per day '
            'per panel on a clear day. My only complaint is the delivery took 8 days instead of 5. '
            'Customer support was helpful when I called. Would still recommend.'
        ),
    },
    {
        'product_sku': 'ESP-540B-002',
        'customer': 'amit.kumar@yahoo.com',
        'rating': 5,
        'title': 'Best investment for a large home',
        'comment': (
            'Installed 8 bifacial panels for my 4BHK bungalow. The bifacial gain is real — my '
            'production is noticeably higher than my neighbour\'s standard panels. The technical '
            'team explained everything clearly. Already seeing ₹4,000+ monthly savings.'
        ),
    },
    {
        'product_sku': 'ESP-330P-003',
        'customer': 'sunita.mehta@outlook.com',
        'rating': 4,
        'title': 'Good budget option for small homes',
        'comment': (
            'We have a 2BHK and wanted to reduce our ₹2,500/month electricity bill. These '
            'polycrystalline panels are doing the job at a reasonable price. Good quality, '
            'straightforward installation. Bill is now around ₹400-500/month. Happy with purchase.'
        ),
    },
    # Solar Batteries
    {
        'product_sku': 'PSB-5K-LFP-001',
        'customer': 'deepak.singh@gmail.com',
        'rating': 5,
        'title': 'Game changer for power cuts!',
        'comment': (
            'We live in an area with 4-6 hour daily power cuts. This battery paired with our '
            '3kW solar system keeps our essential appliances running all night. The BMS is '
            'excellent — no overcharging, no swelling. 6 months old and working perfectly. '
            'The mobile app monitoring is a great feature.'
        ),
    },
    {
        'product_sku': 'PSB-10K-LFP-002',
        'customer': 'vikram.nair@gmail.com',
        'rating': 5,
        'title': 'Excellent for off-grid living',
        'comment': (
            'Running a farmhouse mostly off-grid with this 10kWh battery + 6kW solar. '
            'We can run through 2-3 cloudy days without grid power. The cycle life claim '
            'seems legitimate based on how the battery performs. EcoPlanet\'s support '
            'team was brilliant at helping us size our system correctly.'
        ),
    },
    {
        'product_sku': 'PSB-2K5-WALL-003',
        'customer': 'anjali.verma@gmail.com',
        'rating': 4,
        'title': 'Perfect for our 2BHK apartment',
        'comment': (
            'The compact wall-mount design fits perfectly in our utility room. Keeps our '
            'WiFi, lights, and fans running during power cuts. Took some time to understand '
            'the app but once set up it\'s very easy to monitor. Good quality product.'
        ),
    },
    # EV Chargers
    {
        'product_sku': 'EVC-7K2-AC-001',
        'customer': 'kavita.reddy@gmail.com',
        'rating': 5,
        'title': 'Charges my Tata Nexon EV so fast!',
        'comment': (
            'Before this charger, I was using the portable 3-pin charger that came with my car '
            '— took 12+ hours for a full charge. With EcoCharge 7.2kW, it\'s done in under 3 hours. '
            'The mobile app works seamlessly. I can schedule charging during off-peak hours. '
            'Installation team was professional and cleaned up perfectly after themselves. 10/10!'
        ),
    },
    {
        'product_sku': 'EVC-7K2-AC-001',
        'customer': 'rahul.sharma@gmail.com',
        'rating': 4,
        'title': 'Good charger, app needs improvement',
        'comment': (
            'Charger performance is excellent. Charges my MG ZS EV in about 2.5 hours from 20%. '
            'The hardware is solid and well-built. My only feedback is the mobile app UI could '
            'be improved — it\'s functional but not the most intuitive. Overall a good product.'
        ),
    },
    # Inverter Batteries
    {
        'product_sku': 'EPIB-150TT-001',
        'customer': 'priya.patel@gmail.com',
        'rating': 5,
        'title': 'Much better than my old battery',
        'comment': (
            'Replaced a 3-year-old flat plate battery with this tall tubular. The difference '
            'is incredible — backup time went from 2 hours to 5+ hours for our load. Water '
            'top-up frequency is very low (once in 3-4 months). Great value for money.'
        ),
    },
    {
        'product_sku': 'EPIB-200TT-002',
        'customer': 'amit.kumar@yahoo.com',
        'rating': 5,
        'title': 'Superb backup for heavy load home',
        'comment': (
            'Our home has 2 ACs, 5 fans, and multiple lights. This 200Ah battery with our '
            '1500VA inverter gives us about 6-7 hours backup during power cuts. Delivery was '
            'quick and the installation team knew exactly what they were doing. Highly satisfied!'
        ),
    },
    {
        'product_sku': 'EPIB-100VRLA-003',
        'customer': 'sunita.mehta@outlook.com',
        'rating': 4,
        'title': 'Great for small apartments — zero maintenance',
        'comment': (
            'Living in a flat, I was hesitant about a regular battery due to fumes and maintenance. '
            'This VRLA battery is perfect — completely sealed, no smell, no water topping. '
            'Gives us about 3 hours backup for lights and fans. Compact and easy to handle.'
        ),
    },
]

COUPONS_DATA = [
    {
        'code': 'SOLAR10',
        'description': '10% off on all solar products',
        'discount_type': 'percentage',
        'discount_value': '10.00',
        'max_discount_amount': '5000.00',
        'min_order_amount': '10000.00',
        'usage_limit': 500,
        'per_user_limit': 2,
        'valid_days': 365,
    },
    {
        'code': 'WELCOME20',
        'description': '20% off for new customers — first order',
        'discount_type': 'percentage',
        'discount_value': '20.00',
        'max_discount_amount': '8000.00',
        'min_order_amount': '15000.00',
        'usage_limit': 1000,
        'per_user_limit': 1,
        'valid_days': 180,
    },
    {
        'code': 'FLAT500',
        'description': 'Flat ₹500 off on orders above ₹5,000',
        'discount_type': 'fixed',
        'discount_value': '500.00',
        'max_discount_amount': None,
        'min_order_amount': '5000.00',
        'usage_limit': 0,  # unlimited
        'per_user_limit': 3,
        'valid_days': 365,
    },
    {
        'code': 'BUNDLE15',
        'description': '15% off when you buy panels + battery together',
        'discount_type': 'percentage',
        'discount_value': '15.00',
        'max_discount_amount': '12000.00',
        'min_order_amount': '50000.00',
        'usage_limit': 200,
        'per_user_limit': 1,
        'valid_days': 90,
    },
    {
        'code': 'EVCLIENT',
        'description': '₹2,000 off on EV charger purchase',
        'discount_type': 'fixed',
        'discount_value': '2000.00',
        'max_discount_amount': None,
        'min_order_amount': '20000.00',
        'usage_limit': 100,
        'per_user_limit': 1,
        'valid_days': 120,
    },
]

SHIPPING_ZONES = [
    {
        'name': 'Metro Cities — Express',
        'states': 'Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad',
        'country': 'India',
        'rate': '0.00',
        'free_above': '10000.00',
        'estimated_days_min': 2,
        'estimated_days_max': 4,
    },
    {
        'name': 'North India',
        'states': 'Uttar Pradesh, Haryana, Punjab, Rajasthan, Himachal Pradesh, Uttarakhand, Jammu and Kashmir',
        'country': 'India',
        'rate': '500.00',
        'free_above': '25000.00',
        'estimated_days_min': 4,
        'estimated_days_max': 7,
    },
    {
        'name': 'South India',
        'states': 'Tamil Nadu, Kerala, Andhra Pradesh, Telangana, Karnataka',
        'country': 'India',
        'rate': '500.00',
        'free_above': '25000.00',
        'estimated_days_min': 3,
        'estimated_days_max': 6,
    },
    {
        'name': 'West India',
        'states': 'Maharashtra, Gujarat, Goa, Madhya Pradesh, Chhattisgarh',
        'country': 'India',
        'rate': '500.00',
        'free_above': '25000.00',
        'estimated_days_min': 3,
        'estimated_days_max': 6,
    },
    {
        'name': 'East India',
        'states': 'West Bengal, Bihar, Jharkhand, Odisha, Assam',
        'country': 'India',
        'rate': '750.00',
        'free_above': '30000.00',
        'estimated_days_min': 5,
        'estimated_days_max': 8,
    },
    {
        'name': 'Northeast & Remote',
        'states': 'Manipur, Meghalaya, Mizoram, Nagaland, Tripura, Sikkim, Arunachal Pradesh',
        'country': 'India',
        'rate': '1200.00',
        'free_above': '50000.00',
        'estimated_days_min': 7,
        'estimated_days_max': 14,
    },
]

CONTACT_MESSAGES = [
    {
        'name': 'Ramesh Gupta',
        'email': 'ramesh.gupta@gmail.com',
        'phone': '+91 98765 43210',
        'subject': 'Solar panel installation query for 3BHK home',
        'message': (
            'Hello, I am interested in installing solar panels for my 3BHK home in Jaipur. '
            'My current electricity bill is around ₹4,500 per month. I would like to know '
            'how many panels I need and what would be the total cost including installation. '
            'Also, please let me know about government subsidies available in Rajasthan.'
        ),
        'status': 'new',
    },
    {
        'name': 'Meena Krishnan',
        'email': 'meena.k@yahoo.com',
        'phone': '+91 87654 32109',
        'subject': 'EV charger compatibility with Hyundai Ioniq 5',
        'message': (
            'I recently purchased a Hyundai Ioniq 5 and want to install a home EV charger. '
            'I noticed you have the 7.2kW AC charger. Can you confirm it is compatible with '
            'the Ioniq 5? Also, what is the installation timeline and do you cover Chennai?'
        ),
        'status': 'in_progress',
        'admin_notes': 'Confirmed compatibility. Installation team to contact within 2 days.',
    },
    {
        'name': 'Suresh Agarwal',
        'email': 'suresh.agarwal@business.com',
        'phone': '+91 99887 76655',
        'subject': 'Bulk order enquiry — 50 panels for commercial complex',
        'message': (
            'We are setting up a 20kW rooftop solar system for our commercial complex in Pune. '
            'We need approximately 50 panels of 400W capacity. Can you provide a bulk pricing '
            'quote? We would also need installation support. Please send us a detailed proposal '
            'with warranty terms and service SLA.'
        ),
        'status': 'in_progress',
        'admin_notes': 'High value lead. Sent preliminary quote. Follow up scheduled for Friday.',
    },
    {
        'name': 'Lakshmi Devi',
        'email': 'lakshmi.d@hotmail.com',
        'phone': '+91 77665 54433',
        'subject': 'Battery backup not working after power cut',
        'message': (
            'I purchased the PowerStore 5kWh battery 6 months ago. After last week\'s extended '
            '8-hour power cut, the battery is showing a red light and not charging. The inverter '
            'is showing error code E-03. Please help urgently as we have no backup power.'
        ),
        'status': 'resolved',
        'admin_notes': 'Battery BMS reset resolved the issue. Tech visited on-site. Customer satisfied.',
    },
    {
        'name': 'Harish Choudhary',
        'email': 'harish.c@gmail.com',
        'phone': '+91 88776 55443',
        'subject': 'Request for solar system for farmhouse',
        'message': (
            'I have a farmhouse that is not connected to the grid. I need a completely off-grid '
            'solar solution. The farmhouse has basic loads — 4 fans, 8 LED lights, 1 TV, and '
            '1 water pump. Please suggest the right system size and battery capacity for '
            '3 days of autonomy.'
        ),
        'status': 'new',
    },
    {
        'name': 'Pooja Sharma',
        'email': 'pooja.sharma@gmail.com',
        'phone': '+91 99988 77766',
        'subject': 'Delivery delay complaint — Order EP2024-0523',
        'message': (
            'I placed an order for 4 solar panels 2 weeks ago. The expected delivery was 7 days '
            'but I have not received anything yet. I have tried calling the courier but they '
            'are not giving clear information. Please help track my order and provide an updated '
            'delivery date.'
        ),
        'status': 'resolved',
        'admin_notes': 'Courier delay due to heavy rain. New delivery scheduled. Customer notified.',
    },
    {
        'name': 'Arjun Malhotra',
        'email': 'arjun.m@startup.io',
        'phone': '+91 91234 56789',
        'subject': 'Partnership inquiry — solar installation company',
        'message': (
            'We are a solar installation company based in Gujarat with 50+ installations per month. '
            'We are looking for a reliable product supplier for solar panels and batteries. '
            'Would you be interested in a dealer/distributor partnership? We can commit to '
            'minimum monthly volumes of ₹20-25 lakhs.'
        ),
        'status': 'new',
    },
    {
        'name': 'Neeta Joshi',
        'email': 'neeta.joshi@gmail.com',
        'phone': '+91 77788 99900',
        'subject': 'Invoice request for GST claim',
        'message': (
            'I purchased 2 solar batteries last month (Order EP2024-0489). I need a proper GST '
            'invoice for claiming input tax credit for my business. The invoice I received does '
            'not have my GSTIN. Please send a revised invoice with GSTIN: 08AABCS1234A1Z5.'
        ),
        'status': 'resolved',
        'admin_notes': 'Revised GST invoice issued and emailed to customer.',
    },
]

NEWSLETTER_EMAILS = [
    'solar.enthusiast@gmail.com',
    'green.energy.india@gmail.com',
    'rooftop.solar@outlook.com',
    'ev.lover.india@gmail.com',
    'clean.energy.fan@yahoo.com',
    'sunpower.home@gmail.com',
    'eco.friendly.life@gmail.com',
    'solar.family@gmail.com',
    'battery.backup.fan@gmail.com',
    'renewable.india@hotmail.com',
    'save.electricity@gmail.com',
    'solartech.india@gmail.com',
    'evcharger.home@gmail.com',
    'greenpower.india@gmail.com',
    'zero.electricity.bill@gmail.com',
    'solar.inverter.user@yahoo.com',
    'home.solar.system@gmail.com',
    'solarenergy.pune@gmail.com',
    'rooftop.bangalore@gmail.com',
    'delhi.solar.home@gmail.com',
]


class Command(BaseCommand):
    help = 'Seed comprehensive demo data for client presentation'

    def handle(self, *args, **options):
        self.seed_shipping_zones()
        self.seed_coupons()
        self.seed_customers()
        self.seed_reviews()
        self.seed_contact_messages()
        self.seed_newsletter_subscribers()
        self.stdout.write(self.style.SUCCESS('\n✓ All demo data seeded successfully!'))

    def seed_shipping_zones(self):
        from apps.shipping.models import ShippingZone
        self.stdout.write('\nSeeding shipping zones...')
        for z in SHIPPING_ZONES:
            obj, created = ShippingZone.objects.get_or_create(
                name=z['name'],
                defaults={
                    'states': z['states'],
                    'country': z['country'],
                    'rate': Decimal(z['rate']),
                    'free_above': Decimal(z['free_above']) if z.get('free_above') else None,
                    'estimated_days_min': z['estimated_days_min'],
                    'estimated_days_max': z['estimated_days_max'],
                    'is_active': True,
                },
            )
            self.stdout.write(f'  {"Created" if created else "Exists"}: {obj.name}')

    def seed_coupons(self):
        from apps.coupons.models import Coupon
        self.stdout.write('\nSeeding coupons...')
        now = timezone.now()
        for c in COUPONS_DATA:
            obj, created = Coupon.objects.get_or_create(
                code=c['code'],
                defaults={
                    'description': c['description'],
                    'discount_type': c['discount_type'],
                    'discount_value': Decimal(c['discount_value']),
                    'max_discount_amount': Decimal(c['max_discount_amount']) if c['max_discount_amount'] else None,
                    'min_order_amount': Decimal(c['min_order_amount']),
                    'usage_limit': c['usage_limit'],
                    'per_user_limit': c['per_user_limit'],
                    'valid_from': now,
                    'valid_until': now + timedelta(days=c['valid_days']),
                    'is_active': True,
                },
            )
            self.stdout.write(f'  {"Created" if created else "Exists"}: {obj.code}')

    def seed_customers(self):
        self.stdout.write('\nSeeding demo customers...')
        self._customers = {}
        for c in DEMO_CUSTOMERS:
            user, created = User.objects.get_or_create(
                email=c['email'],
                defaults={
                    'username': c['username'],
                    'first_name': c['first_name'],
                    'last_name': c['last_name'],
                    'is_active': True,
                },
            )
            if created:
                user.set_password('Demo@1234')
                user.save()
            self._customers[c['email']] = user
            self.stdout.write(f'  {"Created" if created else "Exists"}: {user.email}')

    def seed_reviews(self):
        from apps.products.models import Product
        from apps.reviews.models import Review
        self.stdout.write('\nSeeding product reviews...')
        for r in REVIEWS_DATA:
            try:
                product = Product.objects.get(sku=r['product_sku'])
                user = self._customers.get(r['customer'])
                if not user:
                    continue
                obj, created = Review.objects.get_or_create(
                    product=product,
                    user=user,
                    defaults={
                        'rating': r['rating'],
                        'title': r['title'],
                        'comment': r['comment'],
                    },
                )
                self.stdout.write(
                    f'  {"Created" if created else "Exists"}: {r["rating"]}★ review for {product.name[:40]}'
                )
            except Product.DoesNotExist:
                self.stdout.write(f'  Skipped: product {r["product_sku"]} not found (run seed_products first)')

    def seed_contact_messages(self):
        from apps.contacts.models import ContactMessage
        self.stdout.write('\nSeeding contact messages...')
        for m in CONTACT_MESSAGES:
            obj, created = ContactMessage.objects.get_or_create(
                email=m['email'],
                subject=m['subject'],
                defaults={
                    'name': m['name'],
                    'phone': m.get('phone', ''),
                    'message': m['message'],
                    'status': m['status'],
                    'admin_notes': m.get('admin_notes', ''),
                },
            )
            self.stdout.write(f'  {"Created" if created else "Exists"}: {m["subject"][:50]}')

    def seed_newsletter_subscribers(self):
        from apps.contacts.models import NewsletterSubscriber
        self.stdout.write('\nSeeding newsletter subscribers...')
        created_count = 0
        for email in NEWSLETTER_EMAILS:
            _, created = NewsletterSubscriber.objects.get_or_create(
                email=email,
                defaults={'is_active': True},
            )
            if created:
                created_count += 1
        self.stdout.write(f'  Created {created_count} new, {len(NEWSLETTER_EMAILS) - created_count} already exist')
