import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';

// กำหนด Type สำหรับข้อมูลรถยนต์
interface Car {
  id: number;
  model_id: number;
  brand_name: string;
  model_name: string;
  year: number;
  price: number;
  description: string;
  image_url: string;
  model_3d_url: string;
  color: string;
  mileage: number;
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  status: 'available' | 'sold' | 'reserved';
}

const OurCars: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // ดึงข้อมูลรถยนต์จาก API
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/cars');
        setCars(response.data);
      } catch (error: any) {
        const errorMessage = error.response
          ? `Failed to load cars: ${error.response.data.message || error.response.statusText}`
          : 'Failed to load cars. Please check if the backend server is running.';
        setError(errorMessage);
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // ฟังก์ชันจองรถ
  const handleBookCar = async (carId: number, bookingType: 'test_drive' | 'inquiry') => {
    if (!user) {
      setMessage('Please log in to book a car');
      setTimeout(() => {
        setMessage(null);
        navigate('/login');
      }, 2000);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Session expired. Please log in again.');
      setTimeout(() => {
        setMessage(null);
        navigate('/login');
      }, 2000);
      return;
    }

    const bookingDate = new Date().toISOString();
    const messageText = bookingType === 'test_drive' ? 'I would like to test drive this car.' : 'I have some questions about this car.';

    try {
      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          carId,
          bookingDate,
          type: bookingType,
          message: messageText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(`Car booked successfully! Booking ID: ${response.data.id}`);
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setMessage('Session expired. Please log in again.');
        setTimeout(() => {
          setMessage(null);
          navigate('/login');
        }, 2000);
      } else {
        console.error('Error booking car:', error);
        setMessage('Failed to book the car. Please try again.');
        setTimeout(() => setMessage(null), 2000);
      }
    }
  };

  // ฟังก์ชันไปหน้า Car Details
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
    textAlign: 'center',
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

  const carCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'transform 0.3s ease, background 0.3s ease',
    flex: 1,
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans w-full text-white">
      <GlobalStyles />
      <Navbar />
      <BackToTop />
      <section id="our-cars" style={sectionStyle}>
        <div className="bg-effect" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>Our Cars</h1>
          {message && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.1)] backdrop-blur-md text-white p-6 rounded-lg shadow-lg z-50 border border-[rgba(255,255,255,0.2)]">
              <p className="text-center">{message}</p>
              <button
                onClick={() => setMessage(null)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform duration-300"
              >
                OK
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
              <p className="text-white">Loading cars...</p>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center bg-[rgba(255,0,0,0.1)] p-4 rounded-lg">{error}</p>
          ) : cars.length === 0 ? (
            <p className="text-white text-center bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">No cars available.</p>
          ) : (
            <div className="car-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="car-card"
                  style={carCardStyle}
                  onClick={() => handleViewDetails(car.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
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
                    className="w-full h-48 object-cover rounded-md mb-4"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                    }}
                  />
                  <h3 className="text-xl font-bold text-white">{car.brand_name} {car.model_name}</h3>
                  <p className="text-gray-300 text-lg">{car.price.toLocaleString()} บาท</p>
                  <p className="text-sm text-gray-400 mt-2">Color: {car.color}</p>
                  <p className="text-sm text-gray-400">Mileage: {car.mileage.toLocaleString()} km</p>
                  <p className="text-sm text-gray-400">Fuel Type: {car.fuel_type}</p>
                  <p className="text-sm text-gray-400">Status: {car.status}</p>
                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleBookCar(car.id, 'test_drive')}
                      style={{
                        ...buttonStyle,
                        background: car.status === 'available' ? 'linear-gradient(to right, #ff3366, #4834d4)' : '#4B5563',
                      }}
                      className="test-drive-button"
                      disabled={car.status !== 'available'}
                      onMouseEnter={(e) => {
                        if (car.status === 'available') e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      Test Drive
                    </button>
                    <button
                      onClick={() => handleBookCar(car.id, 'inquiry')}
                      style={{
                        ...buttonStyle,
                        background: car.status === 'available' ? 'linear-gradient(to right, #4834d4, #ff3366)' : '#4B5563',
                      }}
                      className="inquiry-button"
                      disabled={car.status !== 'available'}
                      onMouseEnter={(e) => {
                        if (car.status === 'available') e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      Inquiry
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

export default OurCars;