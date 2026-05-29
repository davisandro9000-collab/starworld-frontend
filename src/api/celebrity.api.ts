import { api } from './axios'

export interface Celebrity {
  id: string
  slug: string
  name: string
  genre?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  isPublished: boolean
}

export interface CelebrityNews {
  id: string
  headline: string
  summary?: string
  imageUrl?: string
  sourceUrl?: string
  publishedAt: string
}

export interface TriviaQuestion {
  id: string
  question: string
  options: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export const getCelebrities = async (): Promise<Celebrity[]> => {
  const { data } = await api.get('/celebrities')
  return data
}

export const getCelebrity = async (slug: string): Promise<Celebrity> => {
  const { data } = await api.get(`/celebrities/${slug}`)
  return data
}

export const getCelebNews = async (slug: string): Promise<CelebrityNews[]> => {
  const { data } = await api.get(`/celebrities/${slug}/news`)
  return data
}

export const getCelebTrivia = async (slug: string): Promise<TriviaQuestion[]> => {
  const { data } = await api.get(`/celebrities/${slug}/trivia`)
  return data
}
