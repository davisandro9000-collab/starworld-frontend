// src/api/celebrity.api.ts
import { api } from './axios';

export interface Celebrity {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  genre?: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  isPublished: boolean;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: string;
}

export interface Event {
  id: string;
  ticketmasterId: string;
  eventName: string;
  artistName: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  eventDate: string | null;
  imageUrl: string | null;
  ticketUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
}

export async function getAllCelebrities(): Promise<Celebrity[]> {
  const { data } = await api.get('/celebrities');
  return data.celebrities;
}

export async function getCelebrity(slug: string): Promise<Celebrity> {
  const { data } = await api.get(`/celebrities/${slug}`);
  return data.celebrity;
}

export async function getCelebNews(slug: string): Promise<NewsArticle[]> {
  const { data } = await api.get(`/celebrities/${slug}/news`);
  // Backend returns { celebrity, articles }
  return data.articles || [];
}

export async function getCelebEvents(slug: string): Promise<Event[]> {
  const { data } = await api.get(`/celebrities/${slug}/events`);
  // Backend returns { success, celebrity, events }
  return data.events || [];
}