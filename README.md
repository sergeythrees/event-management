# Управление учебными мероприятиями

SPA для управления учебными мероприятиями. React + TypeScript + Tailwind CSS + shadcn/ui.

## Требования

- Node.js >= 18

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Архитектурные решения

### shadcn/ui вместо самописных компонентов
Библиотека копирует исходный код компонентов прямо в проект (`src/components/ui/`). Это даёт полный контроль над реализацией и позволяет менять компоненты под задачу.

### Сервисный слой как абстракция над данными
Позволяет заменить моки на реальный API-клиент (fetch/axios) без переписывания компонентов.

### Разделение на `components/ui/` и `features/`
- `components/ui/` — базовые shadcn/ui компоненты (кнопки, инпуты, таблицы, диалоги)
- `features/` — компоненты с бизнес-логикой (EventCard, EventList, EventForm, EventDetail)

### Контекст вместо Redux/Zustand
Для такого объёма состояния достаточно React Context + useReducer. Так не будет лишних зависимостей.

### Tailwind CSS
Утилитарный подход к стилизации ускоряет вёрстку. Неиспользуемые классы вырезаются при сборке.

## Структура проекта

```
src/
├── components/ui/       # базовые shadcn/ui компоненты (Card, Badge, Dialog, Button, Input, Select, Table, Label)
├── features/            # Компоненты с бизнес-логикой
│   ├── EventCard/       # Карточка мероприятия
│   ├── EventList/       # Сетка карточек + кнопка «Создать»
│   ├── EventDetail/     # Модалка деталей мероприятия
│   └── EventForm/       # Форма создания/редактирования
├── services/            # CRUD-операции (слой данных)
├── data/                # Моковые данные
├── types/               # Общие типы
├── context/             # React Context + useReducer
├── hooks/               # Кастомные хуки
├── lib/                 # Утилиты shadcn/ui
└── utils/               # Валидация, форматирование
```
