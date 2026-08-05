export interface Contributor {
  name: string;
  github: string;
  avatar: string;
  contributions: number;
  role: string;
  bio: string;
}

export interface CommunityEvent {
  title: string;
  date: string;
  endDate?: string;
  type: 'hackathon' | 'meetup' | 'conference' | 'workshop';
  location: string;
  description: string;
  url?: string;
  status: 'upcoming' | 'past';
}

export interface HallOfFameEntry {
  name: string;
  github: string;
  avatar: string;
  contribution: string;
  year: number;
}

// Removido na auditoria 2026-07-31: os dados anteriores eram inventados.
// As listas só voltam a ser preenchidas com fonte real verificada
// (ex.: API do GitHub de repos/anomalyco/opencode/contributors).
export const contributors: Contributor[] = [];

export const events: CommunityEvent[] = [];

export const hallOfFame: HallOfFameEntry[] = [];

export function getUpcomingEvents(): CommunityEvent[] {
  return events.filter(e => e.status === 'upcoming');
}

export function getPastEvents(): CommunityEvent[] {
  return events.filter(e => e.status === 'past');
}

export function getContributorsByContributions(): Contributor[] {
  return [...contributors].sort((a, b) => b.contributions - a.contributions);
}
