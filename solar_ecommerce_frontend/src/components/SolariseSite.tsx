'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import type {
  FeatureItem,
  FooterLink,
  ProcessStep,
} from '@/data/solariseContent';
import {
  footerCompanyLinks,
  footerServiceLinks,
  primaryNavLinks,
  processSteps,
} from '@/data/solariseContent';

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
      <SiteHeader />
      <main className="solar-main">{children}</main>
      <SiteFooter email={footerEmail} phone={footerPhone} />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="solar-header">
      <div className="solar-container solar-header__inner">
        {/* Desktop nav */}
        <nav className="solar-nav solar-nav--desktop" aria-label="Primary">
          {primaryNavLinks.map((item) => (
            <Link key={item.label} href={item.href} className="solar-nav__link">
              <span>{item.label}</span>
              {item.caret ? <span className="solar-nav__caret">▼</span> : null}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
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

        <SolariseButton href="/contact" tone="green" size="sm" className="solar-header__cta solar-header__cta--desktop">
          Contact Us
        </SolariseButton>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="solar-mobile-nav" aria-label="Mobile navigation">
          {primaryNavLinks.map((item) => (
            <Link key={item.label} href={item.href} className="solar-mobile-nav__link" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <SolariseButton href="/contact" tone="green" size="sm" className="solar-mobile-nav__cta">
            Contact Us
          </SolariseButton>
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
  return (
    <footer className="solar-footer">
      <div className="solar-container solar-footer__grid">
        <div className="solar-footer__brand">
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
        <FooterColumn title="Services" links={footerServiceLinks} />

        <div className="solar-footer__column">
          <h3>Contact Us</h3>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
        </div>

        <div className="solar-footer__column">
          <h3>Subscribe for any updates</h3>
          <div className="solar-subscribe-row" role="group" aria-label="Subscribe for updates">
            <input type="email" placeholder="Your Email" aria-label="Email address" />
            <button type="button">Subscribe</button>
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

// ─── Button ──────────────────────────────────────────────────────────────────

interface SolariseButtonProps {
  href?: string;
  children: React.ReactNode;
  tone?: 'navy' | 'green';
  size?: 'sm' | 'md';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function SolariseButton({
  href,
  children,
  tone = 'navy',
  size = 'md',
  className = '',
  type = 'button',
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
    <button type={type} className={classes}>
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
}

export function SolariseMedia({ className = '' }: SolariseMediaProps) {
  return <div className={cx('solar-media', className)} aria-hidden="true" />;
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
}

export function SolariseProjectCard({
  title,
  meta,
  href = '/projects/sunset-valley-solar-farm',
  filled = false,
  accent = false,
  ctaLabel = 'Check the Project',
  className = '',
}: SolariseProjectCardProps) {
  return (
    <article
      className={cx(
        'solar-project-card',
        filled ? 'solar-project-card--filled' : 'solar-project-card--outline',
        className,
      )}
    >
      <div className="solar-project-card__inner">
        <h3 className="solar-card-title">{title}</h3>
        <div className="solar-project-card__meta">
          {meta.map((line) => (
            <span key={line} className="solar-card-meta">
              {line}
            </span>
          ))}
        </div>
        <SolariseButton href={href} tone={filled ? 'green' : 'navy'} size="sm">
          {ctaLabel}
        </SolariseButton>
      </div>

      {filled || accent ? <SolariseStarburst className="solar-project-card__burst" tone="accent" /> : null}
    </article>
  );
}

// ─── News tile ───────────────────────────────────────────────────────────────

interface SolariseNewsTileProps {
  title: string;
  href?: string;
  featured?: boolean;
  className?: string;
}

export function SolariseNewsTile({
  title,
  href = '/news/future-of-solar-energy',
  featured = false,
  className = '',
}: SolariseNewsTileProps) {
  return (
    <article className={cx('solar-news-tile', featured && 'solar-news-tile--featured', className)}>
      <div className="solar-news-tile__content">
        <h3 className="solar-card-title">{title}</h3>
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
  return (
    <section className="solar-testimonial">
      <p className="solar-eyebrow">TESTIMONIAL</p>
      <blockquote>
        The quality of their work and their commitment to a sustainable future truly impressed us. We
        couldn&apos;t be happier with our solar installation.
      </blockquote>
      <p className="solar-testimonial__name">Sarah M.</p>
      <p className="solar-testimonial__role">Owner Sunset Valley Solar Farm</p>
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
