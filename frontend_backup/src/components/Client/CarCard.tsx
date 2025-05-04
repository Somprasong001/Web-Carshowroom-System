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
      className="car-card bg-[rgba(255,255,255,0.05)] p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(car.id)}
    >
      <img
        src={car.image_url}
        alt={car.model_name}
        className="w-full h-48 object-cover rounded-md transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
        }}
      />
      <h3 className="text-xl font-bold mt-4 text-white">
        {car.brand_name} {car.model_name}
      </h3>
      <p className="text-gray-300">{car.price.toLocaleString()} บาท</p>
      <p className="text-sm text-gray-400">Year: {car.year}</p>
      <p className="text-sm text-gray-400">Color: {car.color}</p>
      <p className="text-sm text-gray-400">Mileage: {car.mileage.toLocaleString()} km</p>
      <p className="text-sm text-gray-400">Fuel Type: {car.fuel_type}</p>
      <p className="text-sm text-gray-400">Status: {car.status}</p>
      <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onBook('test_drive')}
          className="bg-gradient-to-r from-[#ff3366] to-[#4834d4] text-white py-2 px-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={car.status !== 'available'}
        >
          Test Drive
        </button>
        <button
          onClick={() => onBook('inquiry')}
          className="bg-gradient-to-r from-[#4834d4] to-[#ff3366] text-white py-2 px-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={car.status !== 'available'}
        >
          Inquiry
        </button>
      </div>
    </div>
  );
};

export default CarCard;