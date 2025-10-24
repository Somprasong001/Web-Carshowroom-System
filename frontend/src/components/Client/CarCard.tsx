import React from 'react';
import { Car } from '../../types';

interface CarCardProps {
  car: Car;
  onClick: (id: number) => void;
  onBook: (bookingType: 'test_drive' | 'inquiry') => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onClick, onBook }) => {
  return (
    <div
      className="car-card bg-[rgba(255,255,255,0.05)] p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
      onClick={() => onClick(car.id)}
    >
      <img
        src={car.image_url}
        alt={car.model_name}
        className="w-full h-48 object-cover rounded-md transition-transform duration-300"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
        }}
      />
      <div className="mt-4">
        <h3 className="text-xl font-bold text-white">
          {car.brand_name} {car.model_name}
        </h3>
        <p className="text-gray-300 text-lg font-semibold mt-2">
          {car.price.toLocaleString()} บาท
        </p>
        <div className="text-sm text-gray-400 mt-2 space-y-1">
          <p>Year: {car.year}</p>
          {car.color && <p>Color: {car.color}</p>}
          {car.mileage && <p>Mileage: {car.mileage.toLocaleString()} km</p>}
          {car.fuel_type && <p>Fuel Type: {car.fuel_type}</p>}
          {car.status && (
            <p>
              Status:{' '}
              <span
                className={`${
                  car.status === 'available'
                    ? 'text-green-400'
                    : car.status === 'reserved'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {car.status}
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onBook('test_drive')}
            className="flex-1 bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white py-2 px-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            disabled={car.status !== 'available'}
          >
            Test Drive
          </button>
          <button
            onClick={() => onBook('inquiry')}
            className="flex-1 bg-gradient-to-r from-[#4834d4] to-[#686de0] text-white py-2 px-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            disabled={car.status !== 'available'}
          >
            Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;