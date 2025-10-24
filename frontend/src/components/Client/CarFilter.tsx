import React, { useState, useEffect } from 'react';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [carsResponse, brandsResponse, yearsResponse] = await Promise.all([
          fetch(`${API_URL}/cars`),
          fetch(`${API_URL}/brands`),
          fetch(`${API_URL}/years`)
        ]);

        if (!carsResponse.ok || !brandsResponse.ok || !yearsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const carsData = await carsResponse.json();
        const brandsData = await brandsResponse.json();
        const yearsData = await yearsResponse.json();

        const validCars = carsData.filter((car: any) => {
          return car && car.brand_name && car.year != null;
        });

        setBrands(brandsData);
        setYears(yearsData.sort((a: string, b: string) => parseInt(b) - parseInt(a)));
        setCars(validCars);
        setFilteredCars(validCars);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...cars];

      if (filters.brand) {
        filtered = filtered.filter((car) => 
          car.brand_name.toLowerCase() === filters.brand.toLowerCase()
        );
      }

      if (filters.year) {
        filtered = filtered.filter((car) => 
          String(car.year) === String(filters.year)
        );
      }

      if (filters.priceMax) {
        const maxPrice = parseFloat(filters.priceMax);
        if (!isNaN(maxPrice)) {
          filtered = filtered.filter((car) => car.price <= maxPrice);
        }
      }

      setFilteredCars(filtered);
    };

    applyFilters();
  }, [filters, cars]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleViewDetails = (carId: number) => {
    navigate(`/client/home/car-details/${carId}`);
  };

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
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="p-3 rounded-lg bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] min-w-[150px]"
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
                  className="p-3 rounded-lg bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] min-w-[150px]"
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
                  className="p-3 rounded-lg bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] w-[150px]"
                />
              </div>

              {filteredCars.length === 0 ? (
                <p className="text-center text-gray-400">ไม่พบรถที่ตรงกับตัวเลือกของคุณ</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {filteredCars.map((car) => (
                    <div
                      key={car.id}
                      className="bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
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
                          className="w-full mt-4 py-3 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white rounded-full hover:scale-105 transition-transform"
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