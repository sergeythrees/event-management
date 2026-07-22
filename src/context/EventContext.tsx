import { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Event, EventFormData } from '@/types';
import * as eventService from '@/services/eventService';

interface EventState {
  events: Event[];
  loading: boolean;
}

type EventAction =
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

interface EventContextValue extends EventState {
  addEvent: (data: EventFormData) => Promise<Event>;
  updateEvent: (id: string, data: EventFormData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const EventContext = createContext<EventContextValue | null>(null);

function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.payload, loading: false };
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(eventReducer, {
    events: [],
    loading: true,
  });

  const refreshEvents = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const events = await eventService.getEvents();
    dispatch({ type: 'SET_EVENTS', payload: events });
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const addEvent = async (data: EventFormData): Promise<Event> => {
    const newEvent = await eventService.createEvent(data);
    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    return newEvent;
  };

  const updateEvent = async (id: string, data: EventFormData) => {
    const updated = await eventService.updateEvent(id, data);
    if (updated) {
      dispatch({ type: 'UPDATE_EVENT', payload: updated });
    }
  };

  const deleteEvent = async (id: string) => {
    await eventService.deleteEvent(id);
    dispatch({ type: 'DELETE_EVENT', payload: id });
  };

  return (
    <EventContext.Provider value={{ ...state, addEvent, updateEvent, deleteEvent, refreshEvents }}>
      {children}
    </EventContext.Provider>
  );
}
