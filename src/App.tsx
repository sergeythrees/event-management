import { EventProvider } from '@/context/EventContext';
import { AppProvider } from '@/context/AppContext';
import { EventList } from '@/features/EventList/EventList';
import { EventDetailDialog } from '@/features/EventDetail/EventDetail';
import { EventFormDialog } from '@/features/EventForm/EventForm';

function Header() {
  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          🎓 Управление учебными мероприятиями
        </h1>
      </div>
    </header>
  );
}

function App() {
  return (
    <EventProvider>
      <AppProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EventList />
          </main>
          <EventDetailDialog />
          <EventFormDialog />
        </div>
      </AppProvider>
    </EventProvider>
  );
}

export default App;
