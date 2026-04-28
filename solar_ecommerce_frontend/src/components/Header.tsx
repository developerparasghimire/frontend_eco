import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us', hasCaret: true },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/news', label: 'News' },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <nav className="main-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              <span>{item.label}</span>
              {item.hasCaret && <span className="caret">▼</span>}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="pill-btn pill-btn--green">
          <span>Contact Us</span>
          <span className="pill-btn__icon">→</span>
        </Link>
      </div>
    </header>
  );
}
