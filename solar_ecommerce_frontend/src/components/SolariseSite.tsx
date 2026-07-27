'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import type {
  FeatureItem,
  FooterLink,
  ProcessStep,
  TestimonialItem,
} from '@/data/solariseContent';
import {
  footerCompanyLinks,
  footerServiceLinks,
  footerShopLinks,
  processSteps,
  testimonials,
} from '@/data/solariseContent';

// ── Nav dropdown data ─────────────────────────────────────────────────────────

const PRODUCTS_CATEGORIES = [
  {
    slug: 'solar-panels',
    label: 'Solar Panels',
    href: '/products?category=solar-panels',
    items: [
      { label: 'Rooftop Solar Panels', desc: 'High-efficiency mono panels for homes', href: '/products?category=solar-panels', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=320&q=80', badge: 'Bestseller' },
      { label: 'Commercial Arrays', desc: 'Large-scale bifacial panel systems', href: '/products?category=solar-panels', image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=320&q=80' },
    ],
  },
  {
    slug: 'battery-storage',
    label: 'Battery Storage',
    href: '/products?category=battery-storage',
    items: [
      { label: 'Home Battery Systems', desc: 'Whole-home backup power', href: '/products?category=battery-storage', image: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=320&q=80', badge: 'New' },
      { label: 'Portable Power Stations', desc: 'Take power anywhere you go', href: '/products?category=battery-storage', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=320&q=80' },
    ],
  },
  {
    slug: 'inverters',
    label: 'Inverters & Chargers',
    href: '/products?category=inverters',
    items: [
      { label: 'Hybrid Inverters', desc: 'Smart solar + grid + battery control', href: '/products?category=inverters', image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=320&q=80' },
      { label: 'String Inverters', desc: 'Reliable grid-connect inverters', href: '/products?category=inverters', image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=320&q=80' },
    ],
  },
  {
    slug: 'ev-chargers',
    label: 'EV Chargers',
    href: '/products?category=ev-chargers',
    items: [
      { label: 'Home EV Chargers', desc: 'Fast, solar-compatible home charging', href: '/products?category=ev-chargers', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=320&q=80', badge: 'Hot' },
      { label: 'Smart EV Chargers', desc: 'Auto-schedule with solar production', href: '/products?category=ev-chargers', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=80' },
    ],
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    href: '/products?category=accessories',
    items: [
      { label: 'Mounting Systems', desc: 'Roof & ground mount hardware', href: '/products?category=accessories', image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=320&q=80' },
      { label: 'Cables & Connectors', desc: 'MC4 and DC solar cabling kits', href: '/products?category=accessories', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=320&q=80' },
    ],
  },
];

const SOLUTIONS_SCENE = [
  { label: 'Home Solar', desc: 'Complete solar systems for your home', href: '/products', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80' },
  { label: 'Commercial Solar', desc: 'Scalable solutions for your business', href: '/products', image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80' },
  { label: 'Battery Backup', desc: 'Stay powered during any outage', href: '/products', image: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80' },
  { label: 'Off-Grid Energy', desc: 'Complete independence from the grid', href: '/products', image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&q=80' },
];

const DEALS_LINKS = [
  { href: '/products?sale=hot', label: 'Hot Sale', icon: '🔥', badge: 'Hot' },
  { href: '/products?deal=e10', label: 'E10 Deals', icon: '⚡', badge: 'New' },
  { href: '/products?outlet=true', label: 'Outlet Sale', icon: '🏷️', badge: 'Save' },
];

const EXPLORE_COLUMNS = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/news', label: 'Blog & News' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/shipping', label: 'Shipping Info' },
      { href: '/returns', label: 'Returns & Refunds' },
      { href: '/warranty', label: 'Warranty' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/dashboard', label: 'My Account' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/cart', label: 'Cart' },
      { href: '/login', label: 'Login / Register' },
    ],
  },
];
import { useAuthStatus, useAuthStore, useUser } from '@/store/auth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useGuestCartStore } from '@/store/guestCart';

function cx(...classNames: (string | boolean | undefined | null)[]): string {
  return classNames.filter(Boolean).join(' ');
}

// ─── Shell ───────────────────────────────────────────────────────────────────

interface SolariseShellProps {
  children: React.ReactNode;
  footerEmail?: string;
  footerPhone?: string;
}

export function SolariseShell({
  children,
  footerEmail = 'info@ecoplanet.com',
  footerPhone = '(+61) 1234 5678',
}: SolariseShellProps) {
  return (
    <div className="solar-app">
      <AnnouncementBar />
      <SiteHeader />
      <main className="solar-main">{children}</main>
      <SiteFooter email={footerEmail} phone={footerPhone} />
    </div>
  );
}

// ─── Announcement Bar ─────────────────────────────────────────────────────────

function AnnouncementBar() {
  return (
    <div className="solar-promo-strip" role="banner">
      <div className="solar-promo-strip__inner solar-container">
        <p className="solar-promo-strip__text">
          ⚡ Summer Sale — Up to 30% off solar panels &amp; power stations &nbsp;|&nbsp; 🚚 Free shipping on orders over $500
        </p>
        <Link href="/products" className="solar-promo-strip__cta">Shop Now →</Link>
      </div>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeMegaTab, setActiveMegaTab] = useState('solar-panels');
  const user = useUser();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const status = useAuthStatus();
  const cart = useCart();
  const wishlist = useWishlist();
  const guestCartCount = useGuestCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));

  const cartCount = status === 'authenticated' ? (cart.data?.total_items ?? 0) : guestCartCount;
  const wishCount = wishlist.data?.count ?? 0;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleMobile = (key: string) =>
    setMobileExpanded((e) => (e === key ? null : key));

  // Shared icon SVGs
  const HeartIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
  const BagIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
  const UserIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
  const SearchIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
  const ChevronIcon = () => (
    <svg className="solar-nav__chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );

  return (
    <header className="solar-header">
      <div className="solar-container solar-header__inner">
        {/* Logo */}
        <Link href="/" className="solar-header__logo" aria-label="Eco Planet Solar home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoonly.png" alt="Eco Planet Solar" className="solar-logo-img" />
        </Link>

        {/* Desktop nav */}
        <nav className="solar-nav solar-nav--desktop" aria-label="Primary">

          {/* Products — left-sidebar tab + right image-card mega menu */}
          <div className="solar-nav__item" onMouseLeave={() => setActiveMegaTab('solar-panels')}>
            <Link href="/products" className="solar-nav__trigger">
              Products <ChevronIcon />
            </Link>
            <div className="solar-nav__dropdown solar-nav__dropdown--products">
              <div className="solar-mega">
                {/* Left sidebar */}
                <div className="solar-mega__sidebar">
                  <p className="solar-mega__sidebar-label">Shop by Category</p>
                  {PRODUCTS_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      className={`solar-mega__tab${activeMegaTab === cat.slug ? ' solar-mega__tab--active' : ''}`}
                      onMouseEnter={() => setActiveMegaTab(cat.slug)}
                    >
                      {cat.label}
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  ))}
                  <Link href="/products" className="solar-mega__shop-all" onClick={() => setOpen(false)}>
                    Shop All Products →
                  </Link>
                </div>
                {/* Right content — image cards for active category */}
                <div className="solar-mega__content">
                  {PRODUCTS_CATEGORIES.map((cat) =>
                    activeMegaTab === cat.slug ? (
                      <div key={cat.slug} className="solar-mega__cards">
                        {cat.items.map((item) => (
                          <Link key={item.label} href={item.href} className="solar-mega__card">
                            <div className="solar-mega__card-img">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.label} loading="lazy" />
                              {item.badge && <span className="solar-mega__card-badge">{item.badge}</span>}
                            </div>
                            <div className="solar-mega__card-text">
                              <span className="solar-mega__card-label">{item.label}</span>
                              <span className="solar-mega__card-desc">{item.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Solutions — 2×2 scene-banner image cards */}
          <div className="solar-nav__item">
            <Link href="/products" className="solar-nav__trigger">
              Solutions <ChevronIcon />
            </Link>
            <div className="solar-nav__dropdown solar-nav__dropdown--solutions">
              <div className="solar-solutions-scene">
                {SOLUTIONS_SCENE.map((s) => (
                  <Link key={s.label} href={s.href} className="solar-solutions-scene__card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt={s.label} loading="lazy" className="solar-solutions-scene__img" />
                    <div className="solar-solutions-scene__overlay" />
                    <div className="solar-solutions-scene__text">
                      <span className="solar-solutions-scene__label">{s.label}</span>
                      <span className="solar-solutions-scene__desc">{s.desc}</span>
                      <span className="solar-solutions-scene__cta">Explore →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Deals — direct links in navbar */}
          {DEALS_LINKS.map((d) => (
            <Link key={d.href} href={d.href} className="solar-nav__link solar-nav__link--deal">
              {d.label}
              <span className="solar-nav__deal-badge">{d.badge}</span>
            </Link>
          ))}

          {/* Explore — 3-column plain-text links */}
          <div className="solar-nav__item">
            <button type="button" className="solar-nav__trigger">
              Explore <ChevronIcon />
            </button>
            <div className="solar-nav__dropdown solar-nav__dropdown--explore">
              <div className="solar-explore">
                {EXPLORE_COLUMNS.map((col) => (
                  <div key={col.title} className="solar-explore__col">
                    <p className="solar-explore__col-title">{col.title}</p>
                    {col.links.map((link) => (
                      <Link key={link.href} href={link.href} className="solar-explore__link">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop right: search + wishlist + cart + account */}
        <div className="solar-header__auth solar-header__icon-group">
          <Link href="/search" className="solar-header__icon-btn" aria-label="Search">
            <SearchIcon />
          </Link>

          <Link href="/wishlist" className="solar-header__icon-btn" aria-label={`Wishlist${wishCount > 0 ? ` (${wishCount})` : ''}`}>
            <HeartIcon />
            {wishCount > 0 && <span className="solar-header__icon-badge">{wishCount > 99 ? '99+' : wishCount}</span>}
          </Link>

          <Link href="/cart" className="solar-header__icon-btn" aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}>
            <BagIcon />
            {cartCount > 0 && <span className="solar-header__icon-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>

          {user ? (
            <>
              {user.is_staff && (
                <Link href="/admin-eco" className="solar-header__icon-btn" aria-label="Admin">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </Link>
              )}
              <Link href="/dashboard" className="solar-header__account-pill" aria-label="My Account">
                <UserIcon />
                <span>{user.first_name || 'Account'}</span>
              </Link>
            </>
          ) : (
            <Link href="/login" className="solar-header__account-pill" aria-label="Sign In">
              <UserIcon />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile: wishlist + cart + hamburger */}
        <div className="solar-header__mobile-right">
          <Link href="/wishlist" className="solar-header__icon-btn" aria-label={`Wishlist${wishCount > 0 ? ` (${wishCount})` : ''}`}>
            <HeartIcon />
            {wishCount > 0 && <span className="solar-header__icon-badge">{wishCount > 99 ? '99+' : wishCount}</span>}
          </Link>
          <Link href="/cart" className="solar-header__icon-btn" aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}>
            <BagIcon />
            {cartCount > 0 && <span className="solar-header__icon-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>
          <button
            className="solar-mobile-menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            <span className="solar-hamburger-icon">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="solar-mobile-nav" aria-label="Mobile navigation">

          {/* Products accordion */}
          <div className="solar-mobile-nav__group">
            <button
              type="button"
              className="solar-mobile-nav__toggle"
              onClick={() => toggleMobile('products')}
              aria-expanded={mobileExpanded === 'products'}
            >
              Products
              <span className={cx('solar-mobile-nav__toggle-icon', mobileExpanded === 'products' && 'solar-mobile-nav__toggle-icon--open')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            {mobileExpanded === 'products' && (
              <div className="solar-mobile-nav__sub">
                {PRODUCTS_CATEGORIES.map((cat) => (
                  <Link key={cat.slug} href={cat.href} className="solar-mobile-nav__sub-link" onClick={() => setOpen(false)}>
                    {cat.label}
                  </Link>
                ))}
                <Link href="/products" className="solar-mobile-nav__sub-link solar-mobile-nav__sub-link--all" onClick={() => setOpen(false)}>
                  Shop All Products →
                </Link>
              </div>
            )}
          </div>

          {/* Solutions accordion */}
          <div className="solar-mobile-nav__group">
            <button
              type="button"
              className="solar-mobile-nav__toggle"
              onClick={() => toggleMobile('solutions')}
              aria-expanded={mobileExpanded === 'solutions'}
            >
              Solutions
              <span className={cx('solar-mobile-nav__toggle-icon', mobileExpanded === 'solutions' && 'solar-mobile-nav__toggle-icon--open')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            {mobileExpanded === 'solutions' && (
              <div className="solar-mobile-nav__sub">
                {SOLUTIONS_SCENE.map((s) => (
                  <Link key={s.label} href={s.href} className="solar-mobile-nav__sub-link" onClick={() => setOpen(false)}>
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Deals — direct links in mobile drawer */}
          {DEALS_LINKS.map((d) => (
            <Link key={d.href} href={d.href} className="solar-mobile-nav__link solar-mobile-nav__link--deal" onClick={() => setOpen(false)}>
              {d.label}
            </Link>
          ))}

          {/* Explore accordion */}
          <div className="solar-mobile-nav__group">
            <button
              type="button"
              className="solar-mobile-nav__toggle"
              onClick={() => toggleMobile('explore')}
              aria-expanded={mobileExpanded === 'explore'}
            >
              Explore
              <span className={cx('solar-mobile-nav__toggle-icon', mobileExpanded === 'explore' && 'solar-mobile-nav__toggle-icon--open')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            {mobileExpanded === 'explore' && (
              <div className="solar-mobile-nav__sub">
                {EXPLORE_COLUMNS.flatMap((col) => col.links).map((link) => (
                  <Link key={link.href} href={link.href} className="solar-mobile-nav__sub-link" onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="solar-mobile-nav__divider" />

          {user ? (
            <>
              {user.is_staff && (
                <Link href="/admin-eco" className="solar-mobile-nav__link" onClick={() => setOpen(false)}>Admin Panel</Link>
              )}
              <Link href="/dashboard" className="solar-mobile-nav__link" onClick={() => setOpen(false)}>My Account</Link>
              <button type="button" onClick={() => { setOpen(false); void handleLogout(); }} className="solar-mobile-nav__link solar-mobile-nav__link--btn">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="solar-mobile-nav__link" onClick={() => setOpen(false)}>Login / Register</Link>
          )}
        </nav>
      )}
    </header>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

interface SiteFooterProps {
  email: string;
  phone: string;
}

export function SiteFooter({ email, phone }: SiteFooterProps) {
  const [nEmail, setNEmail] = useState('');
  const [nState, setNState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  const handleSubscribe = async () => {
    const val = nEmail.trim();
    if (!val || !/\S+@\S+\.\S+/.test(val)) return;
    setNState('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contacts/newsletter/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: val }),
      });
      setNState(res.ok ? 'ok' : 'err');
    } catch {
      setNState('err');
    }
  };

  return (
    <footer className="solar-footer">
      <div className="solar-container solar-footer__grid">
        <div className="solar-footer__brand">
          <Link href="/" aria-label="Eco Planet Solar home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logoonly.png" alt="Eco Planet Solar" className="solar-footer__logo" />
          </Link>
          <p>Your trusted partner in the world of renewable energy</p>
          <div className="solar-footer__socials">
            <Link href="/" aria-label="Facebook" className="solar-social-link">
              <SocialIcon name="facebook" />
            </Link>
            <Link href="/" aria-label="LinkedIn" className="solar-social-link">
              <SocialIcon name="linkedin" />
            </Link>
            <Link href="/" aria-label="X" className="solar-social-link">
              <SocialIcon name="x" />
            </Link>
          </div>
        </div>

        <FooterColumn title="Company" links={footerCompanyLinks} />

        <div className="solar-footer__column">
          <h3>Contact Us</h3>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
          <a href="/contact">1/30 Chancellor Village Blvd<br />Sippy Downs QLD 4556</a>
        </div>
      </div>

      {/* Trust & Payment Strip */}
      <div className="solar-container">
        <hr className="solar-footer__divider" />
        <div className="solar-footer__trust">
          <div className="solar-footer__trust-badges">
            <span className="solar-footer__trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              SSL Secured
            </span>
            <span className="solar-footer__trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Australian Owned &amp; Operated
            </span>
            <span className="solar-footer__trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              5-Year Installation Warranty
            </span>
            <span className="solar-footer__trust-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              CEC Approved
            </span>
          </div>
          <div className="solar-footer__payments">
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginRight: 6, fontWeight: 600 }}>WE ACCEPT</span>
            {['VISA', 'MC', 'AMEX', 'PAYPAL', 'AFTERPAY', 'EFT'].map((p) => (
              <span key={p} className="solar-footer__payment-chip">{p}</span>
            ))}
          </div>
        </div>

        {/* Legal bottom bar */}
        <div className="solar-footer__bottom">
          <p className="solar-footer__copyright">© {new Date().getFullYear()} Eco Planet Solar. All rights reserved. ABN 12 345 678 901</p>
          <div className="solar-footer__legal-links">
            <Link href="/privacy" className="solar-footer__legal-link">Privacy Policy</Link>
            <Link href="/terms" className="solar-footer__legal-link">Terms</Link>
            <Link href="/shipping" className="solar-footer__legal-link">Shipping</Link>
            <Link href="/returns" className="solar-footer__legal-link">Returns</Link>
            <Link href="/warranty" className="solar-footer__legal-link">Warranty</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="solar-footer__column">
      <h3>{title}</h3>
      {links.map((item) => (
        <Link key={item.label} href={item.href}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Page Hero ───────────────────────────────────────────────────────────────

interface SolarisePageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
  height?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
}

export function SolarisePageHero({
  eyebrow,
  title,
  subtitle,
  image,
  height = 'md',
  align = 'left',
}: SolarisePageHeroProps) {
  return (
    <section className={cx('solar-page-hero', `solar-page-hero--${height}`, align === 'center' && 'solar-page-hero--center')}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="solar-page-hero__img" aria-hidden="true" />
      <div className="solar-page-hero__overlay" />
      <div className="solar-container solar-page-hero__content">
        {eyebrow ? <p className="solar-eyebrow solar-eyebrow--light">{eyebrow}</p> : null}
        <h1 className="solar-page-hero__title">{title}</h1>
        {subtitle ? <p className="solar-page-hero__sub">{subtitle}</p> : null}
      </div>
    </section>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

interface SolariseButtonProps {
  href?: string;
  children: React.ReactNode;
  tone?: 'navy' | 'green';
  size?: 'sm' | 'md';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function SolariseButton({
  href,
  children,
  tone = 'navy',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
}: SolariseButtonProps) {
  const classes = cx('solar-btn', `solar-btn--${tone}`, size === 'sm' && 'solar-btn--sm', className);

  const content = (
    <>
      <span>{children}</span>
      <span className="solar-btn__icon">
        <ArrowIcon />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} style={disabled ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}>
      {content}
    </button>
  );
}

// ─── Search bar ──────────────────────────────────────────────────────────────

interface SolariseSearchBarProps {
  placeholder?: string;
  actionText?: string;
  filterLabel?: string;
}

export function SolariseSearchBar({
  placeholder = 'Search Project Title...',
  actionText = 'Find Project',
  filterLabel = 'Filter by',
}: SolariseSearchBarProps) {
  return (
    <div className="solar-search-row">
      <div className="solar-search-row__left">
        <input className="solar-search-input" placeholder={placeholder} aria-label={placeholder} />
        <button type="button" className="solar-search-button">
          {actionText}
        </button>
      </div>

      <button type="button" className="solar-filter-button">
        <span>{filterLabel}</span>
        <span className="solar-filter-button__caret">▼</span>
      </button>
    </div>
  );
}

// ─── Media placeholder ───────────────────────────────────────────────────────

interface SolariseMediaProps {
  className?: string;
  src?: string;
  alt?: string;
}

export function SolariseMedia({ className = '', src, alt = '' }: SolariseMediaProps) {
  return (
    <div className={cx('solar-media', className)} aria-hidden={!src}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

interface SolariseFeatureCardProps extends Pick<FeatureItem, 'icon' | 'title' | 'text'> {
  className?: string;
}

export function SolariseFeatureCard({ icon, title, text, className = '' }: SolariseFeatureCardProps) {
  return (
    <article className={cx('solar-feature-card', className)}>
      <div className="solar-feature-card__icon">
        <AppIcon name={icon} />
      </div>
      <div>
        <h3 className="solar-card-title">{title}</h3>
        <p className="solar-card-copy">{text}</p>
      </div>
    </article>
  );
}

// ─── Team card ───────────────────────────────────────────────────────────────

interface SolariseTeamCardProps {
  name: string;
  role: string;
  active?: boolean;
}

export function SolariseTeamCard({ name, role, active = false }: SolariseTeamCardProps) {
  return (
    <article className={cx('solar-team-card', active && 'solar-team-card--active')}>
      <h3 className="solar-card-title">{name}</h3>
      <p className="solar-card-copy solar-card-copy--light">{role}</p>
    </article>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

interface SolariseStatCardProps {
  value: string;
  label: string;
}

export function SolariseStatCard({ value, label }: SolariseStatCardProps) {
  return (
    <article className="solar-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface SolariseProjectCardProps {
  title: string;
  meta: string[];
  href?: string;
  filled?: boolean;
  accent?: boolean;
  ctaLabel?: string;
  className?: string;
  image?: string;
}

export function SolariseProjectCard({
  title,
  meta,
  href = '/projects/sunset-valley-solar-farm',
  filled = false,
  accent = false,
  ctaLabel = 'Check the Project',
  className = '',
  image,
}: SolariseProjectCardProps) {
  return (
    <article
      className={cx(
        'solar-project-card',
        filled ? 'solar-project-card--filled' : 'solar-project-card--outline',
        className,
      )}
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {image ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,20,40,0.45) 0%, rgba(15,20,40,0.72) 100%)', borderRadius: 'inherit' }} /> : null}
      <div className="solar-project-card__inner" style={{ position: 'relative', zIndex: 1 }}>
        <h3 className="solar-card-title" style={image ? { color: '#fff' } : undefined}>{title}</h3>
        <div className="solar-project-card__meta">
          {meta.map((line) => (
            <span key={line} className="solar-card-meta" style={image ? { color: 'rgba(255,255,255,0.82)' } : undefined}>
              {line}
            </span>
          ))}
        </div>
        <SolariseButton href={href} tone="green" size="sm">
          {ctaLabel}
        </SolariseButton>
      </div>

      {!image && (filled || accent) ? <SolariseStarburst className="solar-project-card__burst" tone="accent" /> : null}
    </article>
  );
}

// ─── News tile ───────────────────────────────────────────────────────────────

interface SolariseNewsTileProps {
  title: string;
  href?: string;
  featured?: boolean;
  className?: string;
  image?: string;
}

export function SolariseNewsTile({
  title,
  href = '/news/future-of-solar-energy',
  featured = false,
  className = '',
  image,
}: SolariseNewsTileProps) {
  return (
    <article
      className={cx('solar-news-tile', featured && 'solar-news-tile--featured', className)}
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {image ? <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,16,35,0.85) 0%, rgba(10,16,35,0.25) 100%)', borderRadius: 'inherit' }} /> : null}
      <div className="solar-news-tile__content" style={{ position: 'relative', zIndex: 1 }}>
        <h3 className="solar-card-title" style={image ? { color: '#fff' } : undefined}>{title}</h3>
        <SolariseButton href={href} tone="green" size="sm">
          Read More
        </SolariseButton>
      </div>
    </article>
  );
}

// ─── Process section ─────────────────────────────────────────────────────────

export function SolariseProcessSection() {
  return (
    <section className="solar-process">
      <div className="solar-process__shape solar-process__shape--left" />
      <div className="solar-process__shape solar-process__shape--right" />
      <div className="solar-process__cutout" />

      <div className="solar-container solar-process__inner">
        <p className="solar-eyebrow solar-eyebrow--light solar-eyebrow--center">HOW WE WORK</p>
        <h2 className="solar-process__title">Convert into Solar Energy</h2>

        <div className="solar-process__grid">
          {processSteps.map((item: ProcessStep) => (
            <article key={item.title} className="solar-process-card">
              <div className="solar-process-card__icon">
                <AppIcon name={item.icon} />
              </div>
              <h3 className="solar-card-title">{item.title}</h3>
              <p className="solar-card-copy">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Offer banner ─────────────────────────────────────────────────────────────

export function SolariseOfferBanner() {
  return (
    <section className="solar-offer">
      <SolariseStarburst className="solar-offer__burst" tone="accent" />
      <div className="solar-offer__shape" />
      <div className="solar-offer__content">
        <h2>
          Get 45% off
          <br />
          for Installation
        </h2>
        <p>THIS MONTH ONLY</p>
        <SolariseButton href="/contact" tone="green" size="sm">
          Contact Us
        </SolariseButton>
      </div>
    </section>
  );
}

// ─── Join banner ─────────────────────────────────────────────────────────────

export function SolariseJoinBanner() {
  return (
    <section className="solar-join">
      <SolariseStarburst className="solar-join__burst solar-join__burst--left" tone="accent" />
      <SolariseStarburst className="solar-join__burst solar-join__burst--right" tone="accent" />

      <div className="solar-join__content">
        <h2>Join us in our journey toward a cleaner, greener, and more sustainable future.</h2>
        <SolariseButton href="/contact" tone="green" size="sm">
          Contact Us
        </SolariseButton>
      </div>
    </section>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────────────

export function SolariseTestimonial() {
  const [active, setActive] = useState(0);
  const items: TestimonialItem[] = testimonials;

  const prev = () => setActive((i) => (i - 1 + items.length) % items.length);
  const next = () => setActive((i) => (i + 1) % items.length);

  const current = items[active];

  return (
    <section className="solar-testimonial">
      <p className="solar-eyebrow">TESTIMONIAL</p>
      <blockquote key={active}>{current.quote}</blockquote>
      <p className="solar-testimonial__name">{current.name}</p>
      <p className="solar-testimonial__role">{current.role}</p>

      {/* Slider controls — visible on mobile only */}
      <div className="solar-testimonial__controls">
        <button
          className="solar-testimonial__arrow"
          onClick={prev}
          aria-label="Previous testimonial"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="solar-testimonial__dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`solar-testimonial__dot${i === active ? ' solar-testimonial__dot--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button
          className="solar-testimonial__arrow"
          onClick={next}
          aria-label="Next testimonial"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <SolariseStarburst className="solar-testimonial__burst" tone="ghost" />
    </section>
  );
}

// ─── Starburst ───────────────────────────────────────────────────────────────

interface SolariseStarburstProps {
  className?: string;
  tone?: string;
}

export function SolariseStarburst({ className = '', tone = 'accent' }: SolariseStarburstProps) {
  return (
    <div className={cx('solar-starburst', `solar-starburst--${tone}`, className)} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

interface SolariseSectionHeaderProps {
  eyebrow: string;
  title: string;
  buttonHref?: string;
  buttonLabel?: string;
}

export function SolariseSectionHeader({
  eyebrow,
  title,
  buttonHref,
  buttonLabel,
}: SolariseSectionHeaderProps) {
  return (
    <div className="solar-center-header">
      <p className="solar-eyebrow solar-eyebrow--center">{eyebrow}</p>
      <h2 className="solar-title solar-title--section">{title}</h2>
      {buttonHref ? (
        <SolariseButton href={buttonHref} tone="navy" size="sm">
          {buttonLabel}
        </SolariseButton>
      ) : null}
    </div>
  );
}

// ─── Internal icons ──────────────────────────────────────────────────────────

interface IconProps {
  name: string;
}

function AppIcon({ name }: IconProps) {
  switch (name) {
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19.5 4.5c-7.7.2-12 4.3-12 10.4 0 2.5 1.7 4.6 4.2 4.6 5.8 0 8.8-4.9 7.8-15Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M9.3 17.8c1.9-2.9 4-5.3 6.8-7.9"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 10h5v4h-5a2 2 0 1 1 0-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="16.8" cy="12" r="0.9" fill="currentColor" />
        </svg>
      );
    case 'bulb':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4a6 6 0 0 0-3.6 10.8c.9.7 1.4 1.6 1.6 2.7h4c.2-1.1.7-2 1.6-2.7A6 6 0 0 0 12 4Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M9.6 20h4.8M10.2 17.5h3.6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m12 3 2.6 5.4 6 .9-4.3 4.1 1 5.8L12 16.6 6.7 19.2l1-5.8L3.4 9.3l6-.9L12 3Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case 'people':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="6.5" cy="10" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="10" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M8 18c.3-2.4 1.9-3.8 4-3.8s3.7 1.4 4 3.8M2.8 18c.3-1.8 1.5-2.8 3-2.8 1.1 0 1.9.4 2.5 1.2M18.7 16.4c.6-.8 1.4-1.2 2.5-1.2 1.5 0 2.7 1 3 2.8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case 'recycle':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10 5 7.5 8.5l2.6.4M14 19l2.5-3.5-2.6-.4M5.7 13.8A5.9 5.9 0 0 1 6 8.5M18.3 10.2A5.9 5.9 0 0 1 18 15.5M9.7 18.1A5.9 5.9 0 0 1 6 15.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="m14 5 4 1-.8-2.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case 'install':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="7.5" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M8.5 18.5c.3-2.3 1.7-3.7 3.5-3.7s3.2 1.4 3.5 3.7M17 5.3l1 .7 1.2-.5-.3 1.3.9.9-1.4.2-.6 1.1-.6-1.1-1.3-.2.9-.9-.3-1.3 1.1.5Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'gear':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19 12a7 7 0 0 0-.1-1.2l1.7-1.3-1.7-2.9-2 .7a7 7 0 0 0-2-1.2L14.6 3h-3.2l-.4 2.1a7 7 0 0 0-2 1.2l-2-.7-1.7 2.9 1.7 1.3a7 7 0 0 0 0 2.4l-1.7 1.3 1.7 2.9 2-.7a7 7 0 0 0 2 1.2l.4 2.1h3.2l.4-2.1a7 7 0 0 0 2-1.2l2 .7 1.7-2.9-1.7-1.3c.1-.4.1-.8.1-1.2Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="m12 5 7 7-7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function SocialIcon({ name }: IconProps) {
  switch (name) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M13.4 20v-6h2.2l.3-2.5h-2.5V9.9c0-.8.2-1.4 1.4-1.4H16V6.2c-.2 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.2v2.2H9v2.5h2.1v6h2.3Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6.4 8.4a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8ZM5.2 18.8V9.9h2.4v8.9H5.2ZM9.1 18.8V9.9h2.3v1.2h.1c.3-.6 1.1-1.5 2.6-1.5 2.7 0 3.2 1.8 3.2 4.1v5.1h-2.4v-4.5c0-1.1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.6H9.1Z"
            fill="currentColor"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 5h3.4l3.1 4.5L16.3 5H18l-4.6 5.3L18 19h-3.4l-3.3-4.8L7.3 19H5.6l4.8-5.6L6 5Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}
