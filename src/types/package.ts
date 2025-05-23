export interface Package {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  showPrice: boolean;
  features: string[];
}