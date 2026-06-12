import { api } from './axios';

export interface FootballTeam {
  id: string;
  name: string;
  slug: string;
  flagUrl: string;
  group: string;
  coach: string;
  worldRanking?: number;
  participations?: number;
  players: FootballPlayer[];
}

export interface FootballPlayer {
  id: string;
  name: string;
  position: string;
  number: number;
  goals: number;
  assists: number;
}

export interface FootballMatch {
  id: string;
  homeTeam: { id: string; name: string; slug: string; flagUrl: string };
  awayTeam: { id: string; name: string; slug: string; flagUrl: string };
  matchDate: string;
  venue: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
}

export interface PredictionGame {
  id: string;
  name: string;
  description: string;
  predictionType: 'WINNER' | 'FIRST_SCORER' | 'ASSIST' | 'NEXT_STAGE' | 'TOP_SCORER';
  matchId: string | null;
  match?: FootballMatch;
  points: number;
  coinReward: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface TicketListing {
  id: string;
  matchId: string;
  priceCoins: number;
  seatInfo: string;
  ticketImageUrl?: string;
  seller: { username: string };
  expiresAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalPoints: number;
  totalCoins: number;
}

export const getTeams = () => api.get('/football/teams').then(r => r.data.teams);
export const getTeamBySlug = (slug: string) => api.get(`/football/teams/${slug}`).then(r => r.data.team);
export const getTeamNews = (teamSlug: string) => api.get(`/football/teams/${teamSlug}/news`).then(r => r.data.news);
export const getTeamMatches = (teamSlug: string) => api.get(`/football/teams/${teamSlug}/matches`).then(r => r.data.matches);

export const getActivePredictionGames = () => api.get('/football/predictions/games').then(r => r.data.games);
export const submitPredictionEntry = (gameId: string, data: any, idempotencyKey: string) =>
  api.post('/football/predictions/entries', { gameId, ...data }, { headers: { 'Idempotency-Key': idempotencyKey } });

export const getMatchTicketListings = (matchId: string) => api.get(`/football/tickets/match/${matchId}`).then(r => r.data.listings);
export const buyTicketListing = (listingId: string, idempotencyKey: string) =>
  api.post('/football/tickets/buy', { listingId }, { headers: { 'Idempotency-Key': idempotencyKey } });

// ✅ Added missing leaderboard export
export const getPredictionLeaderboard = (): Promise<LeaderboardEntry[]> =>
  api.get('/football/predictions/leaderboard').then(r => r.data.leaderboard);