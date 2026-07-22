import { useEffect, useState, useContext, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { EventStatus, type Person, type EventFormData } from '@/types';
import { validateEventForm, hasErrors, type ValidationErrors } from '@/utils/validation';
import { findPeopleByQuery } from '@/services/personService';
import { X, Plus, Loader2 } from 'lucide-react';

function generateEventCode(existingCodes: string[]): string {
  const year = new Date().getFullYear();
  const existingYearCodes = existingCodes.filter((c) => c.startsWith(`EVT-${year}-`));
  const maxNum = existingYearCodes.reduce((max, c) => {
    const match = c.match(/EVT-\d+-(\d+)/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `EVT-${year}-${String(maxNum + 1).padStart(3, '0')}`;
}

const initialFormData: EventFormData = {
  code: '',
  title: '',
  date: '',
  status: EventStatus.Planned,
  students: [],
  responsibles: [],
};

export function EventFormDialog() {
  const app = useContext(AppContext);
  const { events, addEvent, updateEvent } = useEvents();

  const isOpen = app?.activeModal === 'create' || app?.activeModal === 'edit';
  const isEdit = app?.activeModal === 'edit';

  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [searchResponsibleQuery, setSearchResponsibleQuery] = useState('');
  const [searchStudentResults, setSearchStudentResults] = useState<Person[]>([]);
  const [searchResponsibleResults, setSearchResponsibleResults] = useState<Person[]>([]);
  const [showStudentSearch, setShowStudentSearch] = useState(false);
  const [showResponsibleSearch, setShowResponsibleSearch] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when opening
  useEffect(() => {
    if (isOpen && isEdit && app?.selectedEventId) {
      const event = events.find((e) => e.id === app.selectedEventId);
      if (event) {
        setFormData({
          code: event.code,
          title: event.title,
          date: event.date.slice(0, 16),
          status: event.status,
          students: [...event.students],
          responsibles: [...event.responsibles],
        });
      }
    } else if (isOpen && !isEdit) {
      const existingCodes = events.map((e) => e.code);
      setFormData({
        ...initialFormData,
        code: generateEventCode(existingCodes),
      });
    }
    setErrors({});
    setTouched({});
    setSearchStudentQuery('');
    setSearchResponsibleQuery('');
    setSearchStudentResults([]);
    setSearchResponsibleResults([]);
    setShowStudentSearch(false);
    setShowResponsibleSearch(false);
  }, [isOpen, isEdit, app?.selectedEventId, events]);

  const handleBlur = useCallback(
    (field: keyof ValidationErrors) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldLabels: Record<string, string> = {
        title: 'Название мероприятия обязательно',
        date: 'Дата и время обязательны',
        status: 'Статус обязателен',
      };
      const val = formData[field as keyof EventFormData] as string;
      if (!val || val.trim() === '') {
        setErrors((prev) => ({
          ...prev,
          [field]: fieldLabels[field] || 'Поле обязательно для заполнения',
        }));
      }
    },
    [formData]
  );

  // Search people
  const handleSearchStudent = useCallback(async (query: string) => {
    setSearchStudentQuery(query);
    if (query.trim().length > 0) {
      const results = await findPeopleByQuery(query);
      setSearchStudentResults(results);
    } else {
      setSearchStudentResults([]);
    }
  }, []);

  const handleSearchResponsible = useCallback(async (query: string) => {
    setSearchResponsibleQuery(query);
    if (query.trim().length > 0) {
      const results = await findPeopleByQuery(query);
      setSearchResponsibleResults(results);
    } else {
      setSearchResponsibleResults([]);
    }
  }, []);

  const addStudent = (person: Person) => {
    if (!formData.students.find((s) => s.id === person.id)) {
      setFormData((prev) => ({
        ...prev,
        students: [...prev.students, person],
      }));
    }
    setSearchStudentQuery('');
    setSearchStudentResults([]);
    setShowStudentSearch(false);
  };

  const addResponsible = (person: Person) => {
    if (!formData.responsibles.find((r) => r.id === person.id)) {
      setFormData((prev) => ({
        ...prev,
        responsibles: [...prev.responsibles, person],
      }));
    }
    setSearchResponsibleQuery('');
    setSearchResponsibleResults([]);
    setShowResponsibleSearch(false);
  };

  const removeStudent = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  };

  const removeResponsible = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      responsibles: prev.responsibles.filter((r) => r.id !== id),
    }));
  };

  const handleSubmit = async () => {
    const existingCodes = events.map((e) => e.code);
    const currentCode = isEdit ? formData.code : undefined;
    const validationErrors = validateEventForm(formData, existingCodes, currentCode);

    setErrors(validationErrors);
    setTouched({ code: true, title: true, date: true, status: true });
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      if (isEdit && app?.selectedEventId) {
        await updateEvent(app.selectedEventId, formData);
      } else {
        await addEvent(formData);
      }
      app?.closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      app?.closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle>{isEdit ? 'Редактировать мероприятие' : 'Создать мероприятие'}</DialogTitle>
          <DialogDescription>
            Заполните поля ниже. Поля, отмеченные *, обязательны.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Code */}
          <div className="space-y-1">
            <Label htmlFor="code">Код мероприятия *</Label>
            <Input
              id="code"
              value={formData.code}
              disabled
              className={
                errors.code && touched.code
                  ? 'ring-1 ring-red-500 border-red-500 bg-muted text-muted-foreground'
                  : 'bg-muted text-muted-foreground'
              }
            />
            {errors.code && touched.code && (
              <p className="text-xs text-red-500">{errors.code}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              onBlur={() => handleBlur('title')}
              className={errors.title && touched.title ? 'ring-1 ring-red-500 border-red-500' : ''}
              placeholder="Название мероприятия"
            />
            {errors.title && touched.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date">Дата и время *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, date: e.target.value }));
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              onBlur={() => handleBlur('date')}
              className={errors.date && touched.date ? 'ring-1 ring-red-500 border-red-500' : ''}
            />
            {errors.date && touched.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label htmlFor="status">Статус *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, status: value as EventStatus }));
                if (errors.status) setErrors((prev) => ({ ...prev, status: undefined }));
              }}
              onOpenChange={(open) => {
                if (!open) handleBlur('status');
              }}
            >
              <SelectTrigger
                id="status"
                className={errors.status && touched.status ? 'ring-1 ring-red-500 border-red-500' : ''}
              >
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventStatus.Planned}>Запланировано</SelectItem>
                <SelectItem value={EventStatus.InProgress}>В процессе</SelectItem>
                <SelectItem value={EventStatus.Completed}>Завершено</SelectItem>
                <SelectItem value={EventStatus.Cancelled}>Отменено</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && touched.status && (
              <p className="text-xs text-red-500">{errors.status}</p>
            )}
          </div>

          {/* Students section */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Обучающиеся ({formData.students.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowStudentSearch(!showStudentSearch)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Добавить
              </Button>
            </div>

            {showStudentSearch && (
              <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                <Input
                  placeholder="Поиск по имени, коду или отделу..."
                  value={searchStudentQuery}
                  onChange={(e) => handleSearchStudent(e.target.value)}
                  autoFocus
                />
                {searchStudentResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-md bg-background">
                    {searchStudentResults.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2"
                        onClick={() => addStudent(person)}
                      >
                        <Plus className="h-3 w-3 shrink-0 text-primary" />
                        <span className="font-medium">{person.fullName}</span>
                        <span className="text-muted-foreground text-xs">
                          ({person.code})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchStudentQuery && searchStudentResults.length === 0 && (
                  <p className="text-xs text-muted-foreground">Ничего не найдено</p>
                )}
              </div>
            )}

            {formData.students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left w-24">Код</TableHead>
                    <TableHead className="text-left w-1/2">ФИО</TableHead>
                    <TableHead className="text-left">Должность</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-xs text-left align-top">{student.code}</TableCell>
                      <TableCell className="text-left align-top whitespace-normal wrap-break-word">{student.fullName}</TableCell>
                      <TableCell className="text-left align-top whitespace-normal wrap-break-word">{student.position}</TableCell>
                      <TableCell className="align-top">
                        <button
                          type="button"
                          onClick={() => removeStudent(student.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Нет добавленных обучающихся</p>
            )}
          </div>

          {/* Responsibles section */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Ответственные ({formData.responsibles.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowResponsibleSearch(!showResponsibleSearch)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Добавить
              </Button>
            </div>

            {showResponsibleSearch && (
              <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                <Input
                  placeholder="Поиск по имени, коду или отделу..."
                  value={searchResponsibleQuery}
                  onChange={(e) => handleSearchResponsible(e.target.value)}
                  autoFocus
                />
                {searchResponsibleResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-md bg-background">
                    {searchResponsibleResults.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2"
                        onClick={() => addResponsible(person)}
                      >
                        <Plus className="h-3 w-3 shrink-0 text-primary" />
                        <span className="font-medium">{person.fullName}</span>
                        <span className="text-muted-foreground text-xs">
                          ({person.code})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResponsibleQuery && searchResponsibleResults.length === 0 && (
                  <p className="text-xs text-muted-foreground">Ничего не найдено</p>
                )}
              </div>
            )}

            {formData.responsibles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left w-24">Код</TableHead>
                    <TableHead className="text-left w-1/2">ФИО</TableHead>
                    <TableHead className="text-left">Должность</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.responsibles.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-mono text-xs text-left align-top">{person.code}</TableCell>
                      <TableCell className="text-left align-top whitespace-normal wrap-break-word">{person.fullName}</TableCell>
                      <TableCell className="text-left align-top whitespace-normal wrap-break-word">{person.position}</TableCell>
                      <TableCell className="align-top">
                        <button
                          type="button"
                          onClick={() => removeResponsible(person.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Нет добавленных ответственных</p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
