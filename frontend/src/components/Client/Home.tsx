import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('User state in Home:', user);
    // Simulate loading complete
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
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
  };

  const sectionDescriptionStyle: React.CSSProperties = {
    fontSize: 'clamp(1.2rem, 1.5vw, 1.8rem)',
    maxWidth: '800px',
    margin: '0 auto 2rem',
    lineHeight: 1.6,
    opacity: 0.8,
    color: 'white',
    animation: 'slideUp 1s ease-out forwards',
    animationDelay: '0.2s',
  };

  const bgEffectStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 50% 50%, rgba(255, 51, 102, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
    zIndex: 0,
  };

  const ctaButtonStyle: React.CSSProperties = {
    margin: '0.5rem',
    padding: '1rem 2.5rem',
    fontSize: '1.2rem',
    fontWeight: 600,
    borderRadius: '50px',
    background: 'linear-gradient(135deg, #ff3366, #ff6b6b)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 51, 102, 0.3)',
  };

  if (isLoading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

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
                style={{ ...ctaButtonStyle, animationDelay: '0.4s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 51, 102, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 51, 102, 0.3)';
                }}
              >
                Explore Our Cars
              </button>
            </Link>
            
            <Link to="/client/home/contact-us">
              <button
                className="cta-button animate-fade-in"
                style={{ 
                  ...ctaButtonStyle, 
                  animationDelay: '0.6s',
                  background: 'linear-gradient(135deg, #4834d4, #686de0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(72, 52, 212, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(72, 52, 212, 0.3)';
                }}
              >
                Book a Test Drive
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 0.8;
              transform: translateY(0);
            }
          }
          
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .cta-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-top: 2.5rem;
          }
          
          @media (max-width: 768px) {
            .section-title { 
              font-size: 2rem; 
              letter-spacing: -1px;
            }
            .section-description { 
              font-size: 1rem; 
              padding: 0 1rem;
            }
            .cta-buttons {
              flex-direction: column;
              align-items: center;
              gap: 1rem;
            }
            .cta-button {
              width: 80%;
              max-width: 300px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;