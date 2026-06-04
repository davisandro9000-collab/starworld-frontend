import { api } from './axios';

export interface Promotion {
  id: string;
  type: 'hero' | 'card';
  title: string;
  description?: string;
  imageUrl?: string;
  accentColor?: string;
  ctaText?: string;
  ctaLink?: string;
  sortOrder: number;
  isActive: boolean;
}

export const getPromotions = async (): Promise<Promotion[]> => {
  const { data } = await api.get('/promotions');
  return data.promotions;
};