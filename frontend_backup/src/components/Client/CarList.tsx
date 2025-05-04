import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';
import { Car } from '../../types';

const CarList: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch cars from API
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/cars');
        const carsData = response.data;

        console.log('Cars data:', carsData);

        // กรองข้อมูลที่ไม่สมบูรณ์
        const validCars = carsData.filter((car: any) => {
          const isValid =
            car &&
            car.brand_name &&
            typeof car.brand_name === 'string' &&
            car.model_name &&
            typeof car.model_name === 'string' &&
            car.year != null &&
            (typeof car.year === 'number' || typeof car.year === 'string');
          if (!isValid) {
            console.warn('Invalid car data:', car);
          }
          return isValid;
        });

        console.log('Valid cars after filtering:', validCars);

        setCars(validCars);
      } catch (error: any) {
        console.error('Error fetching cars:', error);
        setError('Failed to load cars. Please try again later or check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Navigate to car details page
  const handleViewDetails = (carId: number) => {
    navigate(`/client/home/car-details/${carId}`);
  };

  // Styles
  const sectionStyle: React.CSSProperties = {
    minHeight: '100vh',
    padding: '120px 5% 80px',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
  };

  const sectionContentStyle: React.CSSProperties = {
    maxWidth: '1400px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    margin: '0 auto',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    fontWeight: 800,
    marginBottom: '2rem',
    background: 'linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gradient 8s linear infinite',
    backgroundSize: '300%',
    lineHeight: '1.1',
    textTransform: 'uppercase',
    letterSpacing: '-2px',
    textAlign: 'center',
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

  const carGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
  };

  const carCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: 500,
    fontSize: '0.95rem',
    background: 'linear-gradient(to right, #ff3366, #4834d4)',
    color: 'white',
    transition: 'transform 0.3s ease',
    width: '100%',
    textAlign: 'center',
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans w-full text-white">
      <GlobalStyles />
      <Navbar />
      <BackToTop />
      <section id="car-list" style={sectionStyle}>
        <div className="bg-effect" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>Car List</h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
              <p className="text-white">Loading cars...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500 text-center bg-[rgba(255,0,0,0.1)] p-4 rounded-lg mb-4">{error}</p>
              <button
                onClick={() => navigate('/client/home/our-cars')}
                className="px-6 py-2 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform duration-300"
              >
                กลับไปหน้า Our Cars
              </button>
            </div>
          ) : cars.length === 0 ? (
            <p className="text-center text-gray-400">ไม่พบข้อมูลรถในระบบ</p>
          ) : (
            <div className="car-grid" style={carGridStyle}>
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="car-card"
                  style={carCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={car.image_url}
                    alt={`${car.brand_name} ${car.model_name}`}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-bold">
                      {car.brand_name} {car.model_name}
                    </h3>
                    <p className="text-gray-400">{car.year}</p>
                    <p className="text-lg font-semibold mt-2">
                      {car.price.toLocaleString()} บาท
                    </p>
                    <button
                      onClick={() => handleViewDetails(car.id)}
                      style={buttonStyle}
                      className="mt-4"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CarList;