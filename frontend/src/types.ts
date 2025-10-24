export interface Car {
  id: number;
  brand_name: string;
  model_name: string;
  year: number;
  price: number;
  image_url: string;
  color?: string;
  mileage?: number;
  fuel_type?: string;
  status?: 'available' | 'reserved' | 'sold';
}