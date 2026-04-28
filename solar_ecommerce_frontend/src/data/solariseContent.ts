// ─── Shared types ────────────────────────────────────────────────────────────

export interface NavLink {
  href: string;
  label: string;
  caret?: boolean;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface ProcessStep {
  icon: string;
  title: string;
  text: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  text: string;
}

export interface ServiceOverview {
  title: string;
  text: string;
  href: string;
  reverse?: boolean;
}

export interface ProjectCardData {
  title: string;
  href: string;
  meta: string[];
}

export interface NewsCardData {
  title: string;
  href: string;
}

export interface ProductCardData {
  slug: string;
  title: string;
  href: string;
  meta: string[];
  metaLine: string;
}

export interface ProductDetail {
  title: string;
  metaLine: string;
  sections: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const primaryNavLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us', caret: true },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Shop' },
  { href: '/projects', label: 'Projects' },
  { href: '/news', label: 'News' },
];

export const footerCompanyLinks: FooterLink[] = [
  { href: '/about', label: 'About Us' },
  { href: '/team', label: 'Team' },
  { href: '/', label: 'Testimonial' },
  { href: '/projects', label: 'Projects' },
  { href: '/news', label: 'News' },
];

export const footerServiceLinks: FooterLink[] = [
  { href: '/services/consultation-assessment', label: 'Consulting' },
  { href: '/services', label: 'Design & Engineering' },
  { href: '/services', label: 'Construction' },
  { href: '/services', label: 'Maintenance' },
];

export const processSteps: ProcessStep[] = [
  {
    icon: 'people',
    title: 'Discussion',
    text: 'Our team will schedule a pre-site inspection to understand your needs and identify solutions helping you save on your energy expenses while reducing your carbon footprint.',
  },
  {
    icon: 'install',
    title: 'Installation',
    text: 'We will professionally install all the necessary equipment such as physical installation of the solar panels and related components for setting your home or commercial business up with solar energy access.',
  },
  {
    icon: 'gear',
    title: 'Activation',
    text: 'Activation is the final step in the installation process and is crucial to ensuring that the solar power system is not only physically in place but also fully functional, safe, and legally connected to the grid.',
  },
];

export const homeStats: StatItem[] = [
  { value: '1000+', label: 'Successful Installations' },
  { value: '10 Megawatts', label: 'Clean Energy Generated' },
  { value: '15 Awards', label: 'for Environmental Excellence' },
];

export const homeBenefits: FeatureItem[] = [
  {
    icon: 'leaf',
    title: 'Sustainability',
    text: "We're committed to the environment. Our solar solutions are eco-friendly, helping you reduce your carbon footprint and contribute to a greener planet.",
  },
  {
    icon: 'wallet',
    title: 'Affordability',
    text: "Solar energy shouldn't be out of reach. We offer competitive pricing and flexible financing options, making it easier for you to switch to renewable energy.",
  },
  {
    icon: 'bulb',
    title: 'Innovation',
    text: "We're not just following trends; we're setting them. Solarise is driven by innovation, consistently introducing new solar products and designs to meet your evolving needs.",
  },
];

export const homeServiceLinks: FooterLink[] = [
  { href: '/services/consultation-assessment', label: 'Consulting' },
  { href: '/services', label: 'Engineering' },
  { href: '/services', label: 'Construction' },
  { href: '/services', label: 'Maintenance' },
];

export const aboutValueCards: FeatureItem[] = [
  {
    icon: 'star',
    title: 'Quality',
    text: 'We stand behind the quality and reliability of our solar systems, ensuring they meet the highest standards.',
  },
  {
    icon: 'people',
    title: 'Community',
    text: "We're deeply embedded in our communities and strive to make a positive impact locally and globally.",
  },
  {
    icon: 'recycle',
    title: 'Sustainability',
    text: 'We prioritize environmentally responsible practices in all aspects of our business.',
  },
];

/** [name, role, active?] */
export type TeamMemberTuple = [string, string, boolean?];

export const teamMembers: TeamMemberTuple[] = [
  ['Jose Ziemann', 'CEO (Chief Executive Officer)'],
  ['Harvey Franey', 'COO (Chief Operating Officer)', true],
  ['Louise Jacobson', 'CFO (Chief Financial Officer)'],
  ['Marshall Mante', 'Chief Sustainability Officer'],
  ['Amelia Rutherford', 'Solar Energy Project Manager'],
  ['Darrin Conn', 'Solar Installation Technician'],
  ['Jason VonRueden', 'Solar Design Engineer'],
  ['Shelly Hoppe', 'Solar Research Scientist'],
];

export const servicesOverview: ServiceOverview[] = [
  {
    title: 'Consultation & Assessment',
    text: 'We begin by assessing your property to determine its solar potential. We analyze factors such as roof orientation, shading, and energy consumption to design a system that meets your specific needs.',
    href: '/services/consultation-assessment',
  },
  {
    title: 'Design & Engineering',
    text: 'We provide a comprehensive solution for the planning, design, and technical aspects of a solar power system installation.',
    href: '/services',
    reverse: true,
  },
  {
    title: 'Construction & Installation',
    text: 'This service involves mounting the panels on your roof or installing them on the ground, connecting the electrical components, and integrating the system into your home or business.',
    href: '/services',
  },
  {
    title: 'Monitoring & Maintenance',
    text: 'We offer monitoring services to track the performance of your solar system. We can remotely identify and address any issues that may arise. Routine maintenance services, such as cleaning and equipment checks, are also provided to keep the system in top condition.',
    href: '/services',
    reverse: true,
  },
];

export const serviceDetailValueCards: FeatureItem[] = [
  {
    icon: 'star',
    title: 'Site Evaluation',
    text: "We conduct a comprehensive evaluation of your property to determine its solar potential such as the property's geographic location and available sunlight hours.",
  },
  {
    icon: 'people',
    title: 'Energy Need Analysis',
    text: 'We review your historical energy usage, examining utility bills and consumption patterns to understand your specific energy needs and consumption trends.',
  },
  {
    icon: 'recycle',
    title: 'Permitting and Regulations',
    text: 'We assist with the permitting process, ensuring that all necessary permits and approvals are obtained from local authorities and utility companies.',
  },
];

export const projectCards: ProjectCardData[] = [
  {
    title: 'Sunset Valley Solar Farm',
    href: '/projects/sunset-valley-solar-farm',
    meta: ['Completion Date: May 2023', 'Capacity: 2 Megawatts', 'Location: Sunset Valley'],
  },
  {
    title: 'GreenTech Elementary Sch...',
    href: '/projects',
    meta: [
      'Completion Date: September 2022',
      'Capacity: 50 Kilowatts',
      'Location: GreenTech Elementary School, Urbanville',
    ],
  },
  {
    title: 'Solar Oasis Community Ce...',
    href: '/projects',
    meta: ['Completion Date: July 2022', 'Capacity: 1.2 Megawatts', 'Location: Oasisville'],
  },
];

export const newsCards: NewsCardData[] = [
  { title: 'The Future of Solar Energy: Innovations and Trends', href: '/news/future-of-solar-energy' },
  {
    title: 'Solar Power and Sustainability: Reducing Your Carbon Footprint',
    href: '/news/future-of-solar-energy',
  },
  { title: 'A Step by Step Guide to Installation', href: '/news/future-of-solar-energy' },
  { title: 'The Solar Power Revolution: Impactful Success Stories', href: '/news/future-of-solar-energy' },
  { title: 'Green Energy Legislation: A Bright Future for Solar', href: '/news/future-of-solar-energy' },
  { title: 'Cutting-Edge Solar Tech: Innovations That Matter', href: '/news/future-of-solar-energy' },
  { title: 'Environmental Benefits of Solar: A Closer Look', href: '/news/future-of-solar-energy' },
];

export const sunsetValleyProject = {
  title: 'Sunset Valley Solar Farm',
  metaLine: 'Completion Date: May 2023 • Capacity: 2 MW • Location: Sunset Valley',
};

export const sunsetValleyProjectSections: string[] = [
  "The Sunset Valley Solar Farm stands as a landmark achievement for Eco Planet Solar - a large-scale renewable energy project designed to harness the sun's power and deliver clean, sustainable electricity to the Sunset Valley community.",
  'Spanning over 10 acres, this advanced solar installation generates up to 2.5 megawatts of energy, significantly reducing carbon emissions while helping residents transition toward greener, more cost-effective energy solutions.',
  "Green Energy for a Greener Community\nLocated in the scenic landscape of Sunset Valley, this solar farm is more than just an energy facility - it's a commitment to sustainability. By supplying reliable renewable energy to the local community, the project plays a vital role in lowering energy costs and minimizing environmental impact.",
  "Cutting-Edge Solar Technology\nAt Eco Planet Solar, innovation drives everything we do. The Sunset Valley Solar Farm is equipped with state-of-the-art solar panels and advanced technology, strategically positioned to capture maximum sunlight throughout the day. This ensures optimal efficiency and consistent energy production, making it a benchmark in modern solar design.",
  "Eco-Friendly from Start to Finish\nSustainability is at the core of our approach. From using eco-friendly materials to optimizing construction processes, every aspect of the project was carefully planned to minimize environmental impact. The solar farm reflects Eco Planet Solar's dedication to responsible development and long-term environmental stewardship.",
  "Empowering the Local Community\nThis project goes beyond energy generation - it's a community-driven initiative. Eco Planet Solar has actively collaborated with local schools, businesses, and residents to promote environmental awareness and education. The result is a stronger, more informed community moving together toward a sustainable future.",
  'Powering Progress Since 2022\nSince its completion in May 2022, the Sunset Valley Solar Farm has become a cornerstone of the community. It stands as a powerful example of how renewable energy and innovation can enhance everyday living while protecting the environment.',
  "A Brighter Future with Eco Planet Solar\nThe Sunset Valley Solar Farm reflects Eco Planet Solar's unwavering commitment to transforming the energy landscape. As we continue to expand our renewable energy initiatives, our mission remains clear - to build a cleaner, greener, and more sustainable world for generations to come.",
];

export const productCards: ProductCardData[] = [
  {
    slug: 'solaris-max-450-panel',
    title: 'Solaris Max 450 Panel',
    href: '/products/solaris-max-450-panel',
    meta: ['Power Output: 450W', 'Efficiency: 22.3%', 'Best For: Residential Roofs'],
    metaLine: 'Power Output: 450W • Efficiency: 22.3% • Best For: Residential Roofs',
  },
  {
    slug: 'ecovault-home-battery',
    title: 'EcoVault Home Battery',
    href: '/products/ecovault-home-battery',
    meta: ['Storage Capacity: 10 kWh', 'Backup Time: Up to 14 Hours', 'Best For: Home Backup Power'],
    metaLine: 'Storage Capacity: 10 kWh • Backup Time: Up to 14 Hours • Best For: Home Backup Power',
  },
  {
    slug: 'smartflow-hybrid-inverter',
    title: 'SmartFlow Hybrid Inverter',
    href: '/products/smartflow-hybrid-inverter',
    meta: ['Rated Output: 8 kW', 'Monitoring: Real-Time App Control', 'Best For: Solar + Battery Systems'],
    metaLine: 'Rated Output: 8 kW • Monitoring: Real-Time App Control • Best For: Solar + Battery Systems',
  },
];

const productDetails: Record<string, ProductDetail> = {
  'solaris-max-450-panel': {
    title: 'Solaris Max 450 Panel',
    metaLine: 'Power Output: 450W • Efficiency: 22.3% • Best For: Residential Roofs',
    sections: [
      'High-Efficiency Solar Performance\nThe Solaris Max 450 Panel is built for customers who want strong daily output from a compact roof footprint. Its high-conversion cell architecture helps you generate more clean energy from limited installation space.',
      'Built for Everyday Reliability\nThe panel frame is engineered for long-term outdoor durability, with reinforced glass, corrosion-resistant materials, and dependable weather tolerance for demanding rooftop environments.',
      'Faster Payback, Smarter Energy Savings\nBy delivering stronger performance per panel, the Solaris Max 450 helps reduce system size requirements while improving long-term savings for homeowners looking to offset rising energy costs.',
      'Ideal for Modern Residential Systems\nThis panel works especially well in premium residential systems where appearance, performance, and efficient roof utilization all matter. It integrates cleanly into contemporary solar layouts.',
    ],
  },
  'ecovault-home-battery': {
    title: 'EcoVault Home Battery',
    metaLine: 'Storage Capacity: 10 kWh • Backup Time: Up to 14 Hours • Best For: Home Backup Power',
    sections: [
      'Reliable Energy Storage for Day and Night\nThe EcoVault Home Battery stores excess solar production so your home can keep running after sunset or during utility interruptions. It is designed to improve energy independence without complicating your system.',
      'Seamless Backup Support\nWhen paired with the right inverter setup, EcoVault helps maintain power for key home circuits such as lighting, internet, refrigeration, and work-from-home essentials during outages.',
      'Smart Energy Management\nThe battery supports more intelligent use of solar generation by shifting stored energy into high-cost usage periods. That gives homeowners greater control over peak-time consumption and billing exposure.',
      'Clean Integration with Solar Systems\nIts compact form and clean installation profile make EcoVault a strong fit for homes that want dependable backup capability without sacrificing design simplicity.',
    ],
  },
  'smartflow-hybrid-inverter': {
    title: 'SmartFlow Hybrid Inverter',
    metaLine: 'Rated Output: 8 kW • Monitoring: Real-Time App Control • Best For: Solar + Battery Systems',
    sections: [
      'Advanced Hybrid System Control\nThe SmartFlow Hybrid Inverter coordinates solar production, battery charging, and household energy use through one central control point. It is designed for flexible modern energy systems.',
      'Live Visibility and Monitoring\nWith real-time app monitoring, users can track generation, storage status, and consumption behavior more clearly. That improves system transparency and helps customers make informed energy decisions.',
      'Optimized for Solar and Storage Pairing\nThis inverter is ideal for installations that combine rooftop solar with battery backup. It helps balance efficiency, stability, and responsive switching between energy sources.',
      'Future-Ready Installation Choice\nSmartFlow gives residential and light commercial systems a stronger foundation for expansion, making it a practical option for customers planning phased energy upgrades over time.',
    ],
  },
};

export function getProductBySlug(slug: string): ProductDetail | null {
  return productDetails[slug] ?? null;
}
