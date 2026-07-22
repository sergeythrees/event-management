import { useEvents } from '@/hooks/useEvents';
import { useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { AppContext } from '@/context/AppContext';
import { EventCard } from '@/features/EventCard/EventCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Loader2, LayoutGrid, List, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { formatStatus, getStatusVariant, formatDateShort } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import type { EventStatus } from '@/types';
import { EventStatus as StatusValues } from '@/types';

type ViewMode = 'cards' | 'table';

const statusOptions: EventStatus[] = [
  StatusValues.Planned,
  StatusValues.InProgress,
  StatusValues.Completed,
  StatusValues.Cancelled,
];

function StatusMenu({
  children,
  eventId,
  currentStatus,
  onStatusChange,
}: {
  children: ReactNode;
  eventId: string;
  currentStatus: EventStatus;
  onStatusChange: (id: string, status: EventStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        className="inline-flex items-center gap-0.5"
        title="Сменить статус"
        onClick={(e) => { e.stopPropagation(); setOpen((prev) => !prev); }}
      >
        {children}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-1 bg-popover border rounded-md shadow-lg z-50 py-1 min-w-[140px]">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                currentStatus === status ? 'font-semibold' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(eventId, status);
                setOpen(false);
              }}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  status === StatusValues.Planned ? 'bg-sky-500' :
                  status === StatusValues.InProgress ? 'bg-amber-500' :
                  status === StatusValues.Completed ? 'bg-emerald-500' :
                  'bg-red-500'
                }`}
              />
              {formatStatus(status)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EventList() {
  const { events, loading, refreshEvents, updateEvent, deleteEvent } = useEvents();
  const app = useContext(AppContext);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const handleStatusChange = (id: string, status: EventStatus) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    updateEvent(id, {
      code: event.code,
      title: event.title,
      date: event.date,
      status,
      students: event.students,
      responsibles: event.responsibles,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      deleteEvent(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Загрузка мероприятий...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Учебные мероприятия</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Всего мероприятий: {events.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'cards'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              )}
              title="Карточки"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              )}
              title="Таблица"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={refreshEvents}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Обновить
          </Button>
          <Button onClick={() => app?.openCreate()}>
            <Plus className="h-4 w-4 mr-1" />
            Создать
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/30">
          <p className="text-lg text-muted-foreground mb-4">Нет мероприятий</p>
          <Button onClick={() => app?.openCreate()}>
            <Plus className="h-4 w-4 mr-1" />
            Создать мероприятие
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Код</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="w-28">Дата</TableHead>
                <TableHead className="w-36">Статус</TableHead>
                <TableHead className="w-24 text-center">Обучающихся</TableHead>
                <TableHead className="w-24 text-center">Ответственных</TableHead>
                <TableHead className="w-24 text-center">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  key={event.id}
                  className="group cursor-pointer"
                  onClick={() => app?.openDetail(event.id)}
                >
                  <TableCell className="font-mono text-xs">{event.code}</TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDateShort(event.date)}</TableCell>
                  <TableCell>
                    <StatusMenu
                      eventId={event.id}
                      currentStatus={event.status}
                      onStatusChange={handleStatusChange}
                    >
                      <Badge variant={getStatusVariant(event.status)}>
                        {formatStatus(event.status)}
                      </Badge>
                    </StatusMenu>
                  </TableCell>
                  <TableCell className="text-center">{event.students.length}</TableCell>
                  <TableCell className="text-center">{event.responsibles.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 group-hover:text-slate-500 hover:text-blue-500 hover:bg-blue-500/10"
                        title="Редактировать"
                        aria-label="Редактировать"
                        onClick={(e) => { e.stopPropagation(); app?.openEdit(event.id); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 group-hover:text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                        title="Удалить"
                        aria-label="Удалить"
                        onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onView={(id) => app?.openDetail(id)}
              onEdit={(id) => app?.openEdit(id)}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
