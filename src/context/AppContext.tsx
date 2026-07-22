import { createContext, useReducer, type ReactNode } from 'react';
import type { ModalType } from '@/types';

interface AppState {
  activeModal: ModalType;
  selectedEventId: string | null;
}

type AppAction =
  | { type: 'OPEN_MODAL'; payload: { modal: ModalType; eventId?: string } }
  | { type: 'CLOSE_MODAL' };

interface AppContextValue extends AppState {
  openDetail: (eventId: string) => void;
  openCreate: () => void;
  openEdit: (eventId: string) => void;
  closeModal: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        activeModal: action.payload.modal,
        selectedEventId: action.payload.eventId ?? null,
      };
    case 'CLOSE_MODAL':
      return { activeModal: null, selectedEventId: null };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    activeModal: null,
    selectedEventId: null,
  });

  const openDetail = (eventId: string) =>
    dispatch({ type: 'OPEN_MODAL', payload: { modal: 'detail', eventId } });

  const openCreate = () =>
    dispatch({ type: 'OPEN_MODAL', payload: { modal: 'create' } });

  const openEdit = (eventId: string) =>
    dispatch({ type: 'OPEN_MODAL', payload: { modal: 'edit', eventId } });

  const closeModal = () => dispatch({ type: 'CLOSE_MODAL' });

  return (
    <AppContext.Provider value={{ ...state, openDetail, openCreate, openEdit, closeModal }}>
      {children}
    </AppContext.Provider>
  );
}
