import { EventStatus } from '@/types';

const statusLabels: Record<EventStatus, string> = {
  [EventStatus.Planned]: 'Запланировано',
  [EventStatus.InProgress]: 'В процессе',
  [EventStatus.Completed]: 'Завершено',
  [EventStatus.Cancelled]: 'Отменено',
};

const statusVariants: Record<EventStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'info' | 'warning'> = {
  [EventStatus.Planned]: 'info',
  [EventStatus.InProgress]: 'warning',
  [EventStatus.Completed]: 'success',
  [EventStatus.Cancelled]: 'destructive',
};

export function formatStatus(status: EventStatus): string {
  return statusLabels[status];
}

export function getStatusVariant(
  status: EventStatus
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'info' | 'warning' {
  return statusVariants[status];
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
