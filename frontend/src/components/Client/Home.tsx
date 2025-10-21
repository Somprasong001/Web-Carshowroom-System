import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';

const Home: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('User state in Home:', user);
  }, [user]);

  // Styles
  const sectionStyle: React.CSSProperties = {
    padding: '120px 5% 80px',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const sectionContentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    margin: '0 auto',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
    fontWeight: 800,
    marginBottom: '1rem',
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradient 8s linear infinite',
    backgroundSize: '300%',
    lineHeight: 1.1,
    letterSpacing: '-2px',
    whiteSpace: 'nowrap',
  };

  const sectionDescriptionStyle: React.CSSProperties = {
    fontSize: 'clamp(1.2rem, 1.5vw, 1.8rem)',
    maxWidth: '800px',
    margin: '0 auto 2rem',
    lineHeight: 1.6,
    opacity: 0.8,
    color: 'white',
    animation: 'slideUp 1s ease-out forwards',
    animationDelay: '2s',
  };

  const bgEffectStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
    zIndex: 0,
  };

  const ctaButtonStyle: React.CSSProperties = {
    margin: '0 1rem',
    padding: '0.8rem 2rem',
    fontSize: '1.2rem',
    fontWeight: 600,
    borderRadius: '9999px',
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
  };

  return (
    <div className="bg-[#0a0a0a] font-sans w-full">
      <GlobalStyles />
      <Navbar />
      <BackToTop />
      <section id="home" style={sectionStyle}>
        <div className="bg-effect" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>
            Welcome to Super Car Showroom
          </h1>
          <p className="section-description" style={sectionDescriptionStyle}>
            Discover the best cars with premium quality and style
          </p>
          <div className="cta-buttons">
            <Link to="/client/home/our-cars">
              <button
                className="cta-button animate-fade-in"
                style={{ ...ctaButtonStyle, animationDelay: '0.6s' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Explore Our Cars
              </button>
            </Link>
            <Link to="/client/home/contact-us">
              <button
                className="cta-button animate-fade-in"
                style={{ ...ctaButtonStyle, animationDelay: '0.8s' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Book a Test Drive
              </button>
            </Link>
          </div>
        </div>
      </section>
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          .cta-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
          }
          @media (max-width: 768px) {
            .section-title { font-size: 8vw; }
            .section-description { font-size: 1rem; }
            .cta-buttons {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;