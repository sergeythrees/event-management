import type { EventFormData } from '@/types';

export interface ValidationErrors {
  code?: string;
  title?: string;
  date?: string;
  status?: string;
}

export function validateEventForm(
  data: Partial<EventFormData>,
  existingCodes: string[],
  currentCode?: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.code || data.code.trim() === '') {
    errors.code = 'Код мероприятия обязателен';
  } else if (
    data.code !== currentCode &&
    existingCodes.includes(data.code.trim())
  ) {
    errors.code = 'Такой код уже существует';
  }

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Название мероприятия обязательно';
  }

  if (!data.date || data.date.trim() === '') {
    errors.date = 'Дата и время обязательны';
  } else if (isNaN(Date.parse(data.date))) {
    errors.date = 'Некорректный формат даты';
  }

  if (!data.status) {
    errors.status = 'Статус обязателен';
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
