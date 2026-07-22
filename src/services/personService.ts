import { mockPeople } from '@/data/mockData';
import type { Person } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllPeople(): Promise<Person[]> {
  await delay(100 + Math.random() * 100);
  return [...mockPeople];
}

export async function findPeopleByQuery(query: string): Promise<Person[]> {
  await delay(100 + Math.random() * 150);
  const lower = query.toLowerCase();
  return mockPeople.filter(
    (p) =>
      p.fullName.toLowerCase().includes(lower) ||
      p.code.toLowerCase().includes(lower) ||
      p.department.toLowerCase().includes(lower)
  );
}

export async function getPersonById(id: string): Promise<Person | undefined> {
  await delay(50);
  return mockPeople.find((p) => p.id === id);
}
