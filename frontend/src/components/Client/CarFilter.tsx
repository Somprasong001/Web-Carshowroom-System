import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car } from '../../types';
import Navbar from '../Common/Navbar';
import BackToTop from '../Common/BackToTop';
import GlobalStyles from '../Common/GlobalStyles';

interface Filters {
  brand: string;
  year: string;
  priceMax: string;
}

const CarFilter: React.FC = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    brand: '',
    year: '',
    priceMax: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch cars, brands, and years from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [carsResponse, brandsResponse, yearsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/cars'),
          axios.get('http://localhost:5000/api/brands'),
          axios.get('http://localhost:5000/api/years')
        ]);

        const carsData = carsResponse.data;
        const brandsData = brandsResponse.data;
        const yearsData = yearsResponse.data;

        console.log('Cars data:', carsData);
        console.log('Brands data:', brandsData);
        console.log('Years data:', yearsData);

        // กรองข้อมูลที่ไม่สมบูรณ์
        const validCars = carsData.filter((car: any) => {
          const isValid =
            car &&
            car.brand_name &&
            typeof car.brand_name === 'string' &&
            car.year != null &&
            (typeof car.year === 'number' || typeof car.year === 'string');
          if (!isValid) {
            console.warn('Invalid car data:', car);
          }
          return isValid;
        });

        console.log('Valid cars after filtering:', validCars);

        // อัพเดต state
        setBrands(brandsData);
        setYears(yearsData.sort((a: string, b: string) => parseInt(b) - parseInt(a)));
        setCars(validCars);
        setFilteredCars(validCars);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later or check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle filter changes and apply filtering
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...cars];

      console.log('Applying filters:', filters);

      // Filter by brand
      if (filters.brand) {
        filtered = filtered.filter((car) => {
          const matches = car.brand_name.toLowerCase() === filters.brand.toLowerCase();
          console.log(`Brand filter: ${car.brand_name} === ${filters.brand} -> ${matches}`);
          return matches;
        });
      }

      // Filter by year
      if (filters.year) {
        filtered = filtered.filter((car) => {
          const carYear = String(car.year);
          const filterYear = String(filters.year);
          const matches = carYear === filterYear;
          console.log(`Year filter: ${carYear} === ${filterYear} -> ${matches}`);
          return matches;
        });
      }

      // Filter by maximum price
      if (filters.priceMax) {
        const maxPrice = parseFloat(filters.priceMax);
        if (!isNaN(maxPrice)) {
          filtered = filtered.filter((car) => {
            const matches = car.price <= maxPrice;
            console.log(`Price filter: ${car.price} <= ${maxPrice} -> ${matches}`);
            return matches;
          });
        }
      }

      console.log('Filtered cars:', filtered);

      setFilteredCars(filtered);
    };

    applyFilters();
  }, [filters, cars]);

  // Handle input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

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
    background: 'radial-gradient(circle, rgba(72, 52, 212, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
    zIndex: 0,
  };

  const filterFormStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
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
    width: '150px',
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
      <section id="car-filter" style={sectionStyle}>
        <div className="bg-effect" style={bgEffectStyle} />
        <div className="section-content" style={sectionContentStyle}>
          <h1 className="section-title" style={sectionTitleStyle}>Filter Cars</h1>

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
          ) : (
            <>
              {/* แจ้งเตือนถ้าข้อมูลใน dropdown ไม่ครบ */}
              {brands.length === 0 && (
                <p className="text-center text-yellow-400 mb-4">
                  ไม่พบข้อมูลยี่ห้อรถ กรุณาตรวจสอบฐานข้อมูลหรือ API
                </p>
              )}
              {years.length === 0 && (
                <p className="text-center text-yellow-400 mb-4">
                  ไม่พบข้อมูลปีรถ กรุณาตรวจสอบฐานข้อมูลหรือ API
                </p>
              )}
              {brands.length > 0 && brands.length < 4 && (
                <p className="text-center text-yellow-400 mb-4">
                  ข้อมูลยี่ห้อรถอาจไม่ครบ ({brands.length}/4 ยี่ห้อ) กรุณาตรวจสอบ API
                </p>
              )}
              {years.length > 0 && years.length < 3 && (
                <p className="text-center text-yellow-400 mb-4">
                  ข้อมูลปีรถอาจไม่ครบ ({years.length}/3 ปี) กรุณาตรวจสอบ API
                </p>
              )}

              {/* Filter Form */}
              <div className="filter-form" style={filterFormStyle}>
                <select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  style={selectStyle}
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  style={selectStyle}
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
                  placeholder="Max Price (บาท)"
                  style={inputStyle}
                />
              </div>

              {/* Filtered Cars */}
              {filteredCars.length === 0 ? (
                <p className="text-center text-gray-400">ไม่พบรถที่ตรงกับตัวเลือกของคุณ</p>
              ) : (
                <div className="car-grid" style={carGridStyle}>
                  {filteredCars.map((car) => (
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
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CarFilter;