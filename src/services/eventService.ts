import { mockEvents } from '@/data/mockData';
import type { Event, EventFormData } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let events = [...mockEvents];

export async function getEvents(): Promise<Event[]> {
  await delay(200 + Math.random() * 200);
  return [...events];
}

export async function getEventById(id: string): Promise<Event | undefined> {
  await delay(100 + Math.random() * 200);
  return events.find((e) => e.id === id);
}

export async function createEvent(data: EventFormData): Promise<Event> {
  await delay(200 + Math.random() * 200);
  const newEvent: Event = {
    ...data,
    id: `e${Date.now()}`,
  };
  events = [newEvent, ...events];
  return newEvent;
}

export async function updateEvent(id: string, data: EventFormData): Promise<Event | undefined> {
  await delay(200 + Math.random() * 200);
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return undefined;
  const updated: Event = { ...data, id };
  events = events.map((e) => (e.id === id ? updated : e));
  return updated;
}

export async function deleteEvent(id: string): Promise<void> {
  await delay(100 + Math.random() * 200);
  events = events.filter((e) => e.id !== id);
}
