import React from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import Link from 'next/link';

interface PlaceholderBlockProps {
  className?: string;
}

export function PlaceholderBlock({ className = '' }: PlaceholderBlockProps) {
  return <div className={`placeholder-block ${className}`.trim()} />;
}

interface ValueCardProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
}

export function ValueCard({ title, text, icon = '✦' }: ValueCardProps) {
  return (
    <div className="value-card fade-up">
      <div className="value-card__icon">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}

interface BigCTAProps {
  title?: string;
  compact?: boolean;
}

export function BigCTA({
  title = 'Join us in our journey toward a cleaner, greener, and more sustainable future.',
  compact = false,
}: BigCTAProps) {
  return (
    <section className={`container cta-banner ${compact ? 'cta-banner--compact' : ''}`}>
      <div className="cta-star cta-star--left" />
      <div className="cta-star cta-star--right" />
      <div className="cta-shape" />
      <div className="cta-inner">
        <h2>{title}</h2>
        <PrimaryButton href="/contact" green>Contact Us</PrimaryButton>
      </div>
    </section>
  );
}

export function ProcessStrip() {
  const items = [
    {
      title: 'Discussion',
      text: 'Our team will schedule a pre-site inspection to understand your needs and identify solutions helping you save on your energy expenses while reducing your carbon footprint.',
    },
    {
      title: 'Installation',
      text: 'We will professionally install all the necessary equipment such as physical installation of the solar panels and related components for setting your home or commercial business up with solar energy access.',
    },
    {
      title: 'Activation',
      text: 'Activation is the final step in the installation process and is crucial to ensuring that the solar power system is not only physically in place but also fully functional, safe, and legally connected to the grid.',
    },
  ];

  return (
    <section className="process-strip">
      <div className="container">
        <p className="eyebrow light">HOW WE WORK</p>
        <h2 className="process-title">Convert into Solar Energy</h2>
        <div className="process-grid">
          {items.map((item) => (
            <div key={item.title} className="process-card fade-up">
              <div className="process-icon">✦</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface SearchFilterBarProps {
  placeholder?: string;
  actionText?: string;
}

export function SearchFilterBar({
  placeholder = 'Search Project Title...',
  actionText = 'Find Project',
}: SearchFilterBarProps) {
  return (
    <div className="container search-filter-row">
      <div className="search-group">
        <input className="search-field" placeholder={placeholder} />
        <button className="search-btn">{actionText}</button>
      </div>
      <button className="filter-btn">
        Filter by <span>▼</span>
      </button>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  meta: string[];
  href?: string;
}

export function ProjectCard({ title, meta, href = '/projects/sunset-valley-solar-farm' }: ProjectCardProps) {
  return (
    <div className="project-card fade-up">
      <h3>{title}</h3>
      <div className="project-meta">
        {meta.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <SecondaryButton href={href}>Check the Project</SecondaryButton>
    </div>
  );
}

interface NewsCardProps {
  title: string;
  large?: boolean;
  href?: string;
}

export function NewsCard({ title, large = false, href = '/news/future-of-solar-energy' }: NewsCardProps) {
  return (
    <div className={`news-card ${large ? 'news-card--large' : ''} fade-up`}>
      <div>
        <h3>{title}</h3>
        <Link href={href} className="pill-btn pill-btn--green pill-btn--small">
          <span>Read More</span>
          <span className="pill-btn__icon">→</span>
        </Link>
      </div>
    </div>
  );
}

interface PersonCardProps {
  name: string;
  role: string;
  active?: boolean;
}

export function PersonCard({ name, role, active = false }: PersonCardProps) {
  return (
    <div className={`person-card ${active ? 'person-card--active' : ''} fade-up`}>
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}
