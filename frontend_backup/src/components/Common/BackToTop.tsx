import React, { useState, useEffect } from 'react';

const BackToTop: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToTopStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: showBackToTop ? 1 : 0,
    visibility: showBackToTop ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
    zIndex: 1000,
  };

  return (
    <>
      <button
        onClick={scrollToTop}
        style={backToTopStyle}
        className="back-to-top"
        title="Back to Top"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <style>
        {`
          .back-to-top:hover {
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(255, 51, 102, 0.5);
          }
        `}
      </style>
    </>
  );
};

export default BackToTop;