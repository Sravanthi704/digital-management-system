import React from 'react';
import { Link } from 'react-router-dom';
// import './LandingPage.css'; // Import the new, separate CSS file

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* --- Hero Section --- */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover Your Next <span className="highlight">Amazing Event</span>
          </h1>
          <p className="hero-subtitle">
            From local meetups and workshops to major concerts and conferences,
            find it all on EventHub.
          </p>
          <Link to="/events" className="btn-primary btn-large hero-cta">
            Explore All Events
          </Link>
        </div>
      </header>

      {/* --- Features Section --- */}
      <section className="features-section">
        <h2 className="section-title">Why Choose EventHub?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎟️</div>
            <h3>Easy Booking</h3>
            <p>Secure your spot in just a few clicks. Simple and fast.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Wide Selection</h3>
            <p>Explore a vast range of events, from tech to music.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Verified Organizers</h3>
            <p>We partner with trusted organizers to ensure quality events.</p>
          </div>
        </div>
      </section>

      {/* --- Call to Action Section --- */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="section-title">Ready to Join?</h2>
          <p>Sign up today to start registering for events or create your own!</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/login" className="btn-secondary btn-large">
              Login
            </Link>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default LandingPage;