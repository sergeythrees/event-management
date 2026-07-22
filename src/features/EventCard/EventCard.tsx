import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Event, EventStatus } from '@/types';
import { EventStatus as StatusValues } from '@/types';
import { formatStatus, getStatusVariant, formatDateShort } from '@/utils/formatters';
import { Pencil, Trash2, ChevronDown } from 'lucide-react';

const statusOptions: EventStatus[] = [
  StatusValues.Planned,
  StatusValues.InProgress,
  StatusValues.Completed,
  StatusValues.Cancelled,
];

interface EventCardProps {
  event: Event;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: EventStatus) => void;
}

export function EventCard({ event, onView, onEdit, onDelete, onStatusChange }: EventCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showStatusMenu) return;
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStatusMenu]);

  return (
    <Card className="group flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer relative" onClick={() => onView(event.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
          <div ref={statusRef} className="relative shrink-0">
            <button
              className="inline-flex items-center gap-0.5"
              title="Сменить статус"
              onClick={(e) => { e.stopPropagation(); setShowStatusMenu((prev) => !prev); }}
            >
              <Badge variant={getStatusVariant(event.status)}>
                {formatStatus(event.status)}
              </Badge>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {showStatusMenu && (
              <div className="absolute top-full right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 py-1 min-w-[140px]">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                      event.status === status ? 'font-semibold' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(event.id, status);
                      setShowStatusMenu(false);
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
        </div>
      </CardHeader>
      <CardContent className="pb-10 flex-1">
        <div className="space-y-1.5 text-sm text-muted-foreground dark:text-slate-300">
          <p>
            <span className="font-medium text-foreground dark:text-slate-100">Код:</span> {event.code}
          </p>
          <p>
            <span className="font-medium text-foreground dark:text-slate-100">Дата:</span>{' '}
            {formatDateShort(event.date)}
          </p>
          <p>
            <span className="font-medium text-foreground dark:text-slate-100">Обучающихся:</span>{' '}
            {event.students.length}
          </p>
          <p>
            <span className="font-medium text-foreground dark:text-slate-100">Ответственных:</span>{' '}
            {event.responsibles.length}
          </p>
        </div>
      </CardContent>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-1 px-3 py-2 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 group-hover:text-slate-500 hover:text-blue-500 hover:bg-blue-500/10"
            title="Редактировать"
            onClick={(e) => { e.stopPropagation(); onEdit(event.id); }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 group-hover:text-slate-500 hover:text-red-500 hover:bg-red-500/10"
            title="Удалить"
            onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
