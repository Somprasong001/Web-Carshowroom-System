import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState<string>(location.pathname);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    console.log('isMenuOpen:', isMenuOpen, 'Nav-links class:', isMenuOpen ? '!translate-x-[10%] opacity-100' : 'md:!translate-x-0 md:opacity-100 !translate-x-full opacity-0');
    console.log('Nav-links element:', navLinksRef.current);
    console.log('Nav-links computed style:', window.getComputedStyle(navLinksRef.current || new Element()).transform);
  }, [isMenuOpen]);

  useEffect(() => {
    console.log('Navbar rerendered, isMenuOpen:', isMenuOpen);
  });

  const toggleMenu = () => {
    console.log('Toggling menu, current state:', isMenuOpen);
    setIsMenuOpen((prev) => {
      const newState = !prev;
      document.body.style.overflow = newState ? 'hidden' : 'auto';
      console.log('New menu state:', newState, 'Translate:', newState ? '!translate-x-[10%]' : '!translate-x-full');
      return newState;
    });
    if (!isMenuOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    console.log('Toggling dropdown, current state:', isDropdownOpen);
    setIsDropdownOpen((prev) => !prev);
    if (isMenuOpen) toggleMenu();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMenuOpen) toggleMenu();
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const handleLinkClick = (href: string, e: React.MouseEvent<HTMLElement>) => {
    console.log('Link clicked:', href, 'Current path:', location.pathname);
    e.preventDefault();
    e.stopPropagation();
    setActiveLink(href);
    if (href !== location.pathname) {
      console.log('Navigating to:', href);
      setTimeout(() => navigate(href), 0);
      if (isMenuOpen) toggleMenu();
      if (isDropdownOpen) setIsDropdownOpen(false);
    } else {
      console.log('Same page, no navigation');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('Clicked outside dropdown, closing');
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) toggleMenu();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const navbarStyle: React.CSSProperties = {
    backdropFilter: 'blur(12px)',
    background: 'rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    ...(isScrolled && { padding: '0.8rem 0', background: 'rgba(10, 10, 10, 0.95)' }),
  };

  const logoStyle: React.CSSProperties = {
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradient 8s linear infinite',
    backgroundSize: '300%',
    letterSpacing: '-0.5px',
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    color: 'white',
    background: isActive ? 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)' : 'none',
    backgroundSize: '300%',
    animation: isActive ? 'gradient 8s linear infinite' : 'none',
    borderRadius: '8px',
    textShadow: isActive ? '0 0 8px rgba(255, 51, 102, 0.5)' : 'none',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    transition: 'all 0.3s ease',
    fontSize: '0.95rem',
    letterSpacing: '0.2px',
    position: 'relative' as const,
    whiteSpace: 'nowrap' as const,
    lineHeight: '1.5',
    display: 'inline-flex',
    alignItems: 'center',
  });

  const navLinkBeforeAfterStyle = {
    content: "''",
    position: 'absolute',
    height: '2px',
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    backgroundSize: '300%',
    transition: 'width 0.3s ease',
  };

  const allLinks = [
    { path: '/client/home', label: 'Home' },
    { path: '/client/home/our-cars', label: 'Our Cars' },
    { path: '/client/home/filter-cars', label: 'Cars Filter' },
    { path: '/client/home/car-list', label: 'Car List' },
    { path: '/client/home/reviews', label: 'Reviews' },
    { path: '/client/home/contact-us', label: 'Contact Us' },
    { path: '/client/home/my-bookings', label: 'My Bookings' },
  ];

  const mainLinks = allLinks.slice(0, 4);
  const dropdownLinks = allLinks.slice(4);

  return (
    <>
      <nav className="navbar fixed top-0 left-0 w-full py-3 z-[1010] overflow-visible" style={navbarStyle}>
        <div className="navbar-container w-full flex justify-between items-center relative">
          <div className="flex items-center gap-4 px-5">
            <div className="logo text-2xl font-bold" style={logoStyle}>
              Super Car Showroom
            </div>
            {user ? (
              <button
                onClick={handleLogout}
                style={navLinkStyle(activeLink === '/logout')}
                className="logout-button"
              >
                Logout
              </button>
            ) : (
              <a
                href="/login"
                style={navLinkStyle(activeLink === '/login')}
                className="text-white hover:text-gray-300 transition-transform duration-300 hover:scale-105"
                onClick={(e) => handleLinkClick('/login', e as any)}
              >
                Login
              </a>
            )}
          </div>
          <div className="nav-wrapper flex md:flex items-center">
            <ul
              className={`nav-links flex gap-1 list-none md:flex md:static md:h-auto md:w-auto md:bg-transparent md:shadow-none md:p-0 md:gap-4 md:!translate-x-0 md:opacity-100 md:visible md:flex-row md:mr-8 md:z-auto ${
                isMenuOpen
                  ? '!translate-x-[10%] opacity-100 bg-gradient-to-r from-[rgba(255,51,102,0.1)] via-[rgba(255,107,107,0.1)] to-[rgba(72,52,212,0.1)] shadow-[-5px_0_15px_rgba(0,0,0,0.3)]'
                  : 'md:!translate-x-0 md:opacity-100 !translate-x-full opacity-0'
              } absolute top-20 right-0 bottom-0 !w-[50%] flex-col justify-start items-end gap-8 p-4 transition-transform duration-300 ease-in-out transition-opacity duration-300 ease-in-out z-[1020] will-change-[transform,opacity] transform-gpu`}
              ref={navLinksRef}
              onClick={(e) => e.stopPropagation()}
            >
              {console.log('Rendering nav-links, isMenuOpen:', isMenuOpen)}
              {(isMenuOpen ? allLinks : mainLinks).map((link, index) => (
                <li
                  key={index}
                  onClick={(e) => {
                    console.log('Menu item clicked:', link.label);
                    handleLinkClick(link.path, e);
                  }}
                  className="relative"
                >
                  <span
                    className="pointer-events-none text-white hover:text-gray-300 transition-transform duration-300 hover:scale-105"
                    style={navLinkStyle(activeLink === link.path)}
                  >
                    {link.label}
                  </span>
                  <style>
                    {`
                      .nav-links li:nth-child(${index + 1}) {
                        opacity: 1;
                        transform: translateX(0);
                        transition: all 0.3s ease ${index * 0.1}s;
                      }
                      .nav-links.translate-x-0 li:nth-child(${index + 1}) {
                        opacity: 1;
                        transform: translateX(0);
                      }
                      .nav-links li:nth-child(${index + 1})::before {
                        ${navLinkBeforeAfterStyle}
                        top: -4px;
                        left: 0;
                        width: 0;
                      }
                      .nav-links li:nth-child(${index + 1})::after {
                        ${navLinkBeforeAfterStyle}
                        bottom: -4px;
                        right: 0;
                        width: 0;
                      }
                      .nav-links li:nth-child(${index + 1}):hover::before,
                      .nav-links li:nth-child(${index + 1})::after {
                        width: 100%;
                        animation: gradient 8s linear infinite;
                      }
                    `}
                  </style>
                </li>
              ))}
              {!isMenuOpen && (
                <li className="relative hidden md:block">
                  <div ref={dropdownRef}>
                    <button
                      style={navLinkStyle(isDropdownOpen)}
                      className="text-white hover:text-gray-300 transition-transform duration-300 hover:scale-105"
                      onClick={() => {
                        console.log('More button clicked');
                        toggleDropdown();
                      }}
                    >
                      More
                    </button>
                    <ul
                      className={`dropdown-menu absolute flex-col bg-[rgba(10,10,10,0.95)] shadow-lg rounded-lg mt-2 p-2 w-48 right-0 z-[1003] transition-opacity duration-200 ${
                        isDropdownOpen ? 'flex opacity-100 visible' : 'hidden opacity-0 invisible'
                      }`}
                    >
                      {dropdownLinks.map((link, index) => (
                        <li
                          key={index}
                          onClick={(e) => {
                            console.log('Dropdown item clicked:', link.label);
                            handleLinkClick(link.path, e);
                          }}
                        >
                          <span
                            className="pointer-events-none block text-white hover:text-gray-300 transition-transform duration-300 hover:scale-105 px-4 py-2"
                            style={navLinkStyle(activeLink === link.path)}
                          >
                            {link.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <button
            className="mobile-nav-toggle md:hidden bg-transparent border-none cursor-pointer w-10 h-10 relative z-[1020] rounded-full transition-colors hover:bg-[rgba(255,255,255,0.1)] mr-5"
            onClick={() => {
              console.log('Hamburger button clicked');
              toggleMenu();
            }}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span
              className="bar absolute left-1/2 transform -translate-x-1/2 w-5 h-[2px] bg-white transition-all duration-200"
              style={{ top: '14px', ...(isMenuOpen && { transform: 'translate(-50%, 5px) rotate(45deg)', width: '24px' }) }}
            />
            <span
              className="bar absolute left-1/2 transform -translate-x-1/2 w-5 h-[2px] bg-white transition-opacity duration-200"
              style={{ top: '19px', ...(isMenuOpen && { opacity: 0 }) }}
            />
            <span
              className="bar absolute left-1/2 transform -translate-x-1/2 w-5 h-[2px] bg-white transition-all duration-200"
              style={{ top: '24px', ...(isMenuOpen && { transform: 'translate(-50%, -5px) rotate(-45deg)', width: '24px' }) }}
            />
          </button>
        </div>
        <div
          className={`overlay fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.2)] transition-opacity duration-200 z-[1000] ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Overlay clicked');
            toggleMenu();
          }}
        />
      </nav>
    </>
  );
};

export default Navbar;