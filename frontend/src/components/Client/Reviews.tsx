import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: number;
  user_id: number;
  car_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_email: string;
  brand_name: string;
  model_name: string;
  year: number;
}

interface Car {
  id: number;
  brand_name: string;
  model_name: string;
  year: number;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ car_id: '', rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch reviews and cars from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [reviewsResponse, carsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/reviews'),
          axios.get('http://localhost:5000/api/cars'),
        ]);

        const reviewsData = reviewsResponse.data;
        const carsData = carsResponse.data;

        console.log('Reviews data:', reviewsData);
        console.log('Cars data:', carsData);

        // กรองข้อมูลที่ไม่สมบูรณ์
        const validReviews = reviewsData.filter((review: any) => {
          const isValid =
            review &&
            review.rating != null &&
            review.comment &&
            typeof review.comment === 'string' &&
            review.created_at &&
            review.user_email &&
            review.brand_name &&
            review.model_name;
          if (!isValid) {
            console.warn('Invalid review data:', review);
          }
          return isValid;
        });

        const validCars = carsData.filter((car: any) => {
          const isValid =
            car &&
            car.id &&
            car.brand_name &&
            car.model_name &&
            car.year;
          if (!isValid) {
            console.warn('Invalid car data:', car);
          }
          return isValid;
        });

        console.log('Valid reviews after filtering:', validReviews);
        console.log('Valid cars after filtering:', validCars);

        setReviews(validReviews);
        setCars(validCars);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later or check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle adding a new review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('กรุณาล็อกอินเพื่อเพิ่มรีวิว');
      navigate('/client/auth/login');
      return;
    }

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!newReview.car_id || isNaN(parseInt(newReview.car_id))) {
      alert('กรุณาเลือกหมวดหมู่รถ');
      return;
    }
    if (!newReview.comment.trim()) {
      alert('กรุณาเขียนรีวิว');
      return;
    }
    if (newReview.rating < 1 || newReview.rating > 5) {
      alert('คะแนนต้องอยู่ระหว่าง 1 ถึง 5');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const carId = parseInt(newReview.car_id); // แปลงเป็นตัวเลข
      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        {
          car_id: carId,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newReviewData = {
        ...response.data,
        user_email: user.email,
        brand_name: cars.find((car) => car.id === carId)?.brand_name,
        model_name: cars.find((car) => car.id === carId)?.model_name,
        year: cars.find((car) => car.id === carId)?.year,
      };

      setReviews([newReviewData, ...reviews]);
      setNewReview({ car_id: '', rating: 5, comment: '' });
    } catch (error: any) {
      console.error('Error adding review:', error);
      alert(error.response?.data?.error || 'Failed to add review');
    }
  };

  // Handle editing a review
  const handleEditReview = async (review: Review) => {
    if (!user) {
      alert('กรุณาล็อกอินเพื่อแก้ไขรีวิว');
      navigate('/client/auth/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/reviews/${review.id}`,
        {
          rating: review.rating,
          comment: review.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReviews(
        reviews.map((r) =>
          r.id === review.id ? { ...r, rating: response.data.rating, comment: response.data.comment } : r
        )
      );
      setEditingReview(null);
    } catch (error: any) {
      console.error('Error updating review:', error);
      alert(error.response?.data?.error || 'Failed to update review');
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId: number) => {
    if (!user) {
      alert('กรุณาล็อกอินเพื่อลบรีวิว');
      navigate('/client/auth/login');
      return;
    }

    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error: any) {
      console.error('Error deleting review:', error);
      alert(error.response?.data?.error || 'Failed to delete review');
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

  const reviewGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
  };

  const reviewCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
  };

  const ratingStyle: React.CSSProperties = {
    color: '#FFD700', // สีทองสำหรับคะแนน
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '1.5rem',
    borderRadius: '12px',
  };

  const selectStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '1rem',
    minWidth: '150px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '300px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontWeight: 500,
    fontSize: '0.95rem',
    background: 'linear-gradient(to right, #ff3366, #4834d4)',
    color: 'white',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans w-full text-white">
      <GlobalStyles />
      <Navbar />
      <BackToTop />
      <section id="reviews" style={sectionStyle}>
        <div className="bg-effect" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>Reviews</h1>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mr-4"></div>
              <p className="text-white">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500 text-center bg-[rgba(255,0,0,0.1)] p-4 rounded-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform duration-300"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              {/* ฟอร์มสำหรับเพิ่มรีวิวใหม่ */}
              <div style={formStyle}>
                <select
                  value={newReview.car_id}
                  onChange={(e) => setNewReview({ ...newReview, car_id: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">เลือกหมวดหมู่รถ</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.brand_name} {car.model_name} ({car.year})
                    </option>
                  ))}
                </select>

                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  style={selectStyle}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} ดาว
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="เขียนรีวิวของคุณ..."
                  style={inputStyle}
                />

                <button
                  onClick={handleAddReview}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  เพิ่มรีวิว
                </button>
              </div>

              {/* แสดงรายการรีวิว */}
              {reviews.length === 0 ? (
                <p className="text-center text-gray-400">ยังไม่มีรีวิวในระบบ</p>
              ) : (
                <div className="review-grid" style={reviewGridStyle}>
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="review-card"
                      style={reviewCardStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {editingReview && editingReview.id === review.id ? (
                        <>
                          <select
                            value={editingReview.rating}
                            onChange={(e) =>
                              setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })
                            }
                            style={selectStyle}
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num} ดาว
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editingReview.comment}
                            onChange={(e) =>
                              setEditingReview({ ...editingReview, comment: e.target.value })
                            }
                            style={inputStyle}
                          />
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleEditReview(editingReview)}
                              style={buttonStyle}
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={() => setEditingReview(null)}
                              style={{ ...buttonStyle, background: 'gray' }}
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={ratingStyle}>
                            {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                          </div>
                          <p className="text-gray-300 mb-2">
                            รถ: {review.brand_name} {review.model_name} ({review.year})
                          </p>
                          <p className="text-gray-400 mb-2">โดย: {review.user_email}</p>
                          <p className="text-white mb-2">{review.comment}</p>
                          <p className="text-gray-500 text-sm">
                            โพสต์เมื่อ: {new Date(review.created_at).toLocaleString()}
                          </p>
                          {user && ((user as any).id === review.user_id || (user as any).role === 'admin') && ( 
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => setEditingReview(review)}
                                style={buttonStyle}
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                style={{ ...buttonStyle, background: 'red' }}
                              >
                                ลบ
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reviews;