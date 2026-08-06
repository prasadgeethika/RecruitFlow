import './LandingPage.css';
import { Link } from 'react-router-dom';
import { FiSearch, FiBriefcase, FiUsers, FiCalendar, FiArrowRight } from 'react-icons/fi';
import heroImg from '../assets/hero-image.png';

const heroSrc = heroImg;

export default function LandingPage() {
  return (
    <div className="landing-root">
      <header className="landing-navbar">
        <div className="brand">RecruitFlow</div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary-outline">Register</Link>
        </div>
      </header>

      <main className="hero">
        <section className="hero-left">
          <h1 className="hero-title">
            Find the
            <br />
            right talent.
            <br />
            Build the future.
          </h1>
          <p className="hero-desc">
            RecruitFlow is a smart recruitment and interview management platform that connects great
            companies with exceptional people.
          </p>

          <div className="cta-row">
            <button className="cta-primary">
              <FiSearch size={18} style={{ marginRight: 8 }} /> Find Jobs
            </button>
            <button className="cta-secondary">
              <FiBriefcase size={18} style={{ marginRight: 8 }} /> Post a Job
            </button>
          </div>
        </section>

        <section className="hero-right">
          <div className="hero-image-wrap">
            <img
              src={heroSrc}
              alt="Hero"
              className="hero-image"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520"><rect width="100%" height="100%" fill="%23f6f6f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23bbb" font-family="Arial, Helvetica, sans-serif" font-size="16">Place hero-image.png in frontend/public/assets/</text></svg>';
              }}
            />

            <div className="floating-card card-candidates">
              <div className="card-icon"><FiBriefcase /></div>
              <div className="card-body">
                <div className="card-title">For Candidates</div>
                <div className="card-sub">Find your dream job today</div>
              </div>
              <div className="card-arrow"><FiArrowRight /></div>
            </div>

            <div className="floating-card card-employers">
              <div className="card-icon"><FiUsers /></div>
              <div className="card-body">
                <div className="card-title">For Employers</div>
                <div className="card-sub">Find and hire top talent</div>
              </div>
              <div className="card-arrow"><FiArrowRight /></div>
            </div>

            <div className="floating-card card-interviews">
              <div className="card-icon"><FiCalendar /></div>
              <div className="card-body">
                <div className="card-title">Smart Interviews</div>
                <div className="card-sub">Schedule, evaluate and decide</div>
              </div>
              <div className="card-arrow"><FiArrowRight /></div>
            </div>
          </div>
        </section>
      </main>

      <section className="features">
        <h2 className="features-title">Everything you need to hire and get hired</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon-box"><FiBriefcase /></div>
            <div className="feature-content">
              <h3 className="feature-title">Post Jobs Easily</h3>
              <p className="feature-desc">Create and manage job postings in minutes. Reach the right candidates faster.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon-box"><FiUsers /></div>
            <div className="feature-content">
              <h3 className="feature-title">Manage Applications</h3>
              <p className="feature-desc">Track applications, shortlist candidates and move them through the hiring pipeline.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon-box"><FiCalendar /></div>
            <div className="feature-content">
              <h3 className="feature-title">Schedule Interviews</h3>
              <p className="feature-desc">Schedule interviews, invite interviewers and keep everyone in the loop.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon-box"><FiSearch /></div>
            <div className="feature-content">
              <h3 className="feature-title">Make Better Decisions</h3>
              <p className="feature-desc">Collect structured feedback and make confident hiring decisions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

