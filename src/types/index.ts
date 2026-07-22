export const EventStatus = {
  Planned: 'planned',
  InProgress: 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export interface Person {
  id: string;
  code: string;
  fullName: string;
  position: string;
  department: string;
}

export interface Event {
  id: string;
  code: string;
  title: string;
  date: string;
  status: EventStatus;
  students: Person[];
  responsibles: Person[];
}

export type EventFormData = Omit<Event, 'id'>;

export type ModalType = 'detail' | 'create' | 'edit' | null;
