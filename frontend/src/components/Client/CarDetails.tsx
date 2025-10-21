import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';
import { useAuth } from '../../context/AuthContext';

// Define the Car interface (same as in OurCars)
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

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch car details by ID
  useEffect(() => {
    const fetchCarDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/cars/${id}`);
        setCar(response.data);
      } catch (error: any) {
        const errorMessage = error.response
          ? `Failed to load car details: ${error.response.data.error || error.response.statusText}`
          : 'Failed to load car details. Please check if the backend server is running.';
        setError(errorMessage);
        console.error('Error fetching car details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  // Handle booking (same logic as in OurCars)
  const handleBookCar = async (bookingType: 'test_drive' | 'inquiry') => {
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
          carId: id,
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

  const carDetailCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.3s ease',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'transform 0.3s ease, background 0.3s ease',
    flex: 1,
  };

  const specItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans w-full text-white">
      <GlobalStyles />
      <Navbar />
      <BackToTop />
      <section id="car-details" style={sectionStyle}>
        <div className="bg-effect" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>Car Details</h1>

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
              <p className="text-white">Loading car details...</p>
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
          ) : !car ? (
            <div className="text-center">
              <p className="text-white text-center bg-[rgba(255,255,255,0.05)] p-4 rounded-lg mb-4">ขออภัย ไม่พบข้อมูลรถคันนี้</p>
              <button
                onClick={() => navigate('/client/home/our-cars')}
                className="px-6 py-2 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform duration-300"
              >
                กลับไปหน้า Our Cars
              </button>
            </div>
          ) : (
            <div className="car-details mt-8">
              {/* Hero Section */}
              <div className="car-hero grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="car-image">
                  <img
                    src={car.image_url}
                    alt={`${car.brand_name} ${car.model_name}`}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                    }}
                  />
                </div>
                <div className="car-model-3d bg-[rgba(255,255,255,0.05)] rounded-lg p-4 flex items-center justify-center">
                  {car.model_3d_url ? (
                    <p className="text-gray-400">3D Model Viewer (To be implemented): {car.model_3d_url}</p>
                  ) : (
                    <p className="text-gray-400">3D Model Not Available</p>
                  )}
                </div>
              </div>

              {/* Car Details Card */}
              <div className="car-detail-card" style={carDetailCardStyle}>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {car.brand_name} {car.model_name} ({car.year})
                </h2>
                <p className="text-2xl text-gray-300 mb-4">{car.price.toLocaleString()} บาท</p>
                <p className="text-gray-400 mb-6">{car.description}</p>

                {/* Specifications */}
                <div className="specifications mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Specifications</h3>
                  <div className="spec-list">
                    <div style={specItemStyle}>
                      <span className="text-gray-400">Color:</span>
                      <span className="text-white">{car.color}</span>
                    </div>
                    <div style={specItemStyle}>
                      <span className="text-gray-400">Mileage:</span>
                      <span className="text-white">{car.mileage.toLocaleString()} km</span>
                    </div>
                    <div style={specItemStyle}>
                      <span className="text-gray-400">Fuel Type:</span>
                      <span className="text-white">{car.fuel_type}</span>
                    </div>
                    <div style={specItemStyle}>
                      <span className="text-gray-400">Status:</span>
                      <span className={`text-white ${car.status === 'available' ? 'text-green-400' : 'text-red-400'}`}>
                        {car.status}
                      </span>
                    </div>
                    <div style={specItemStyle}>
                      <span className="text-gray-400">Year:</span>
                      <span className="text-white">{car.year}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleBookCar('test_drive')}
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
                    onClick={() => handleBookCar('inquiry')}
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

              {/* Image Gallery (Mocked) */}
              <div className="image-gallery mt-8">
                <h3 className="text-xl font-semibold text-white mb-3">Image Gallery</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((_, index) => (
                    <img
                      key={index}
                      src={car.image_url}
                      alt={`${car.brand_name} ${car.model_name} gallery ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CarDetails;