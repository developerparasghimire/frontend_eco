export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-tagline">Your trusted partner in the world of renewable energy</p>
          <div className="social-row">
            <span>f</span>
            <span>in</span>
            <span>𝕏</span>
          </div>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li>About Us</li>
            <li>Team</li>
            <li>Testimonial</li>
            <li>Projects</li>
            <li>News</li>
          </ul>
        </div>

        <div>
          <h4>Services</h4>
          <ul>
            <li>Consulting</li>
            <li>Design &amp; Engineering</li>
            <li>Construction</li>
            <li>Maintenance</li>
          </ul>
        </div>

        <div>
          <h4>Contact Us</h4>
          <ul>
            <li>info@ecoplanet.com</li>
            <li>(+61) 1234 5678</li>
          </ul>
        </div>

        <div>
          <h4>Subscribe for any updates</h4>
          <div className="subscribe-row">
            <input placeholder="Your Email" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
