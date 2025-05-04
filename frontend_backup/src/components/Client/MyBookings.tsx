import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';

interface Booking {
  id: number;
  user_id: number;
  car_id: number;
  brand_name: string;
  model_name: string;
  year: number;
  booking_date: string;
  type: 'test_drive' | 'inquiry';
  message: string;
  status: 'pending' | 'approved' | 'rejected'; // ลบ 'cancelled'
  created_at: string;
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // ฟังก์ชันดึงข้อมูลการจอง
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('API Response:', response.data);

      if (response.status === 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        const validBookings = data.filter((booking: any) => {
          const isValid =
            booking &&
            booking.id &&
            booking.user_id &&
            booking.car_id &&
            booking.brand_name &&
            booking.model_name &&
            booking.year &&
            booking.booking_date &&
            booking.type &&
            ['pending', 'approved', 'rejected'].includes(booking.status?.trim().toLowerCase());
          if (!isValid) {
            console.warn('Invalid booking data:', booking);
          }
          return isValid;
        });

        console.log('Valid bookings after filtering:', validBookings);
        setBookings(validBookings);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      const errorMessage = error.response
        ? `Failed to load bookings: ${error.response.data.error || error.response.statusText}`
        : 'Failed to load bookings. Please ensure the backend server is running and the endpoint is correct.';
      setError(errorMessage);
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อโหลดหน้า
  useEffect(() => {
    if (!user) {
      setError('Please log in to view your bookings');
      setLoading(false);
      navigate('/client/auth/login');
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  // Handle deleting a booking
  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Delete API Response:', response.data);

      if (response.status === 200) {
        // ลบการจองออกจาก state
        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking.id !== bookingId)
        );

        alert('ยกเลิกการจองสำเร็จ!');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete booking';
      alert(errorMessage);
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
    background: '#0a0a0a',
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
    marginBottom: '2.5rem',
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

  const bookingCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '2rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
  };

  const statusStyle = (status: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '0.5rem 1.5rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginTop: '0.5rem',
    color: '#fff',
    background:
      status === 'pending'
        ? 'linear-gradient(45deg, #f39c12, #e67e22)'
        : status === 'approved'
        ? 'linear-gradient(45deg, #27ae60, #2ecc71)'
        : 'linear-gradient(45deg, #7f8c8d, #95a5a6)', // rejected
    cursor: status === 'pending' ? 'pointer' : 'default',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  });

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  };

  const labelStyle: React.CSSProperties = {
    color: '#a0a0a0',
    fontSize: '0.9rem',
    fontWeight: 500,
  };

  const valueStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: 400,
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans w-full text-white">
      <GlobalStyles />
      <Navbar />
      <BackToTop />
      <section id="my-bookings" style={sectionStyle}>
        <div className="bg-effect" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>My Bookings</h1>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
              <p className="text-lg">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center bg-[rgba(255,0,0,0.1)] p-6 rounded-lg max-w-lg mx-auto">
              <p className="text-lg font-semibold">{error}</p>
              <p className="text-sm mt-2 text-gray-300">
                Please ensure you are logged in and the backend server is running at{' '}
                <a href="http://localhost:5000" className="underline hover:text-red-400">
                  http://localhost:5000
                </a>
                .
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-white text-center bg-[rgba(255,255,255,0.05)] p-6 rounded-lg max-w-lg mx-auto">
              <p className="text-lg font-semibold">No bookings found.</p>
              <p className="text-sm mt-2 text-gray-300">
                Start by booking a test drive or inquiry from the car list!
              </p>
            </div>
          ) : (
            <div className="bookings-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="booking-card"
                  style={bookingCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {booking.brand_name} {booking.model_name} ({booking.year})
                  </h3>
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>Booking ID:</span>
                    <span style={valueStyle}>{booking.id}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>Date:</span>
                    <span style={valueStyle}>
                      {new Date(booking.booking_date).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>Type:</span>
                    <span style={valueStyle}>{booking.type.replace('_', ' ')}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>Message:</span>
                    <span style={valueStyle}>{booking.message}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>Created:</span>
                    <span style={valueStyle}>
                      {new Date(booking.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      style={statusStyle(booking.status)}
                      onClick={() => {
                        if (booking.status.trim().toLowerCase() === 'pending') {
                          handleDeleteBooking(booking.id);
                        }
                      }}
                      disabled={booking.status.trim().toLowerCase() !== 'pending'}
                      onMouseEnter={(e) => {
                        if (booking.status.trim().toLowerCase() === 'pending') {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (booking.status.trim().toLowerCase() === 'pending') {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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

export default MyBookings;