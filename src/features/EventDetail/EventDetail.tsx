import { useEffect, useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppContext } from '@/context/AppContext';
import { useEvents } from '@/hooks/useEvents';
import type { Event } from '@/types';
import { formatStatus, getStatusVariant, formatDate } from '@/utils/formatters';
import { Loader2 } from 'lucide-react';

export function EventDetailDialog() {
  const app = useContext(AppContext);
  const { events } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const isOpen = app?.activeModal === 'detail';

  useEffect(() => {
    if (isOpen && app?.selectedEventId) {
      setLoading(true);
      const found = events.find((e) => e.id === app.selectedEventId);
      // Simulate async load
      const timer = setTimeout(() => {
        setEvent(found ?? null);
        setLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setEvent(null);
    }
  }, [isOpen, app?.selectedEventId, events]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) app?.closeModal();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : event ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
              <div className="flex items-center gap-3">
                <DialogTitle>{event.title}</DialogTitle>
                <Badge variant={getStatusVariant(event.status)}>
                  {formatStatus(event.status)}
                </Badge>
              </div>
              <DialogDescription>
                Код: {event.code} | Дата: {formatDate(event.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Обучающиеся ({event.students.length})
                </h3>
                {event.students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left w-24">Код</TableHead>
                        <TableHead className="text-left w-1/2">ФИО</TableHead>
                        <TableHead className="text-left">Должность</TableHead>
                        <TableHead className="text-left">Подразделение</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {event.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs text-left align-top">{student.code}</TableCell>
                          <TableCell className="text-left align-top whitespace-normal wrap-break-word">{student.fullName}</TableCell>
                          <TableCell className="text-left align-top whitespace-normal wrap-break-word">{student.position}</TableCell>
                          <TableCell className="text-left align-top whitespace-normal wrap-break-word">{student.department}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Нет обучающихся</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Ответственные ({event.responsibles.length})
                </h3>
                {event.responsibles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left w-24">Код</TableHead>
                        <TableHead className="text-left w-1/2">ФИО</TableHead>
                        <TableHead className="text-left">Должность</TableHead>
                        <TableHead className="text-left">Подразделение</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {event.responsibles.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell className="font-mono text-xs text-left align-top">{person.code}</TableCell>
                          <TableCell className="text-left align-top whitespace-normal wrap-break-word">{person.fullName}</TableCell>
                          <TableCell className="text-left align-top whitespace-normal wrap-break-word">{person.position}</TableCell>
                          <TableCell className="text-left align-top whitespace-normal wrap-break-word">{person.department}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Нет ответственных</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t shrink-0">
              <Button variant="outline" onClick={() => app?.closeModal()}>
                Закрыть
              </Button>
              <Button onClick={() => app?.openEdit(event.id)}>
                Редактировать
              </Button>
            </div>
          </>
        ) : isOpen ? (
          <div className="py-12 text-center text-muted-foreground">
            Мероприятие не найдено
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
