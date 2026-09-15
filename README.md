# Workshop Booking System — NestJS

Система управления бронированием мастер-классов. Проект переписывает серверную часть версии из Django REST Framework на **NestJS + TypeORM + PostgreSQL**.

## Возможности

- регистрация и JWT-аутентификация;
- роли `USER` и `ADMIN`;
- публичный просмотр мастер-классов;
- CRUD мастер-классов для администратора;
- создание и отмена бронирований авторизованным пользователем;
- просмотр собственных бронирований;
- просмотр всех бронирований администратором;
- проверка даты, вместимости и повторного бронирования;
- DTO и автоматическая валидация входных данных;
- хеширование паролей через bcrypt;
- PostgreSQL и TypeORM;
- Docker Compose для запуска API и БД.

## Структура

```text
src/
├── auth/                    # JWT, guards, роли, регистрация и вход
├── users/                   # User entity и DTO
├── workshops/               # Workshop, Classroom, CRUD
├── bookings/                # Booking и бизнес-правила
├── app.module.ts
└── main.ts
```

Контроллеры отвечают только за HTTP-слой, а бизнес-правила находятся в сервисах.

## Запуск через Docker

1. Скопировать `.env.example` в `.env`.
2. При необходимости изменить `JWT_SECRET` и параметры PostgreSQL.
3. Выполнить:

```bash
docker compose up --build
```

API будет доступен на `http://localhost:3000/api`.

TypeORM использует `synchronize: true` для учебного проекта: схема БД создаётся автоматически из Entity.

## Локальный запуск

```bash
npm install
npm run start:dev
```

Для локального запуска PostgreSQL должен быть доступен по параметрам из `.env`.

## Аутентификация

Регистрация:

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user1",
  "password": "Password123"
}
```

Вход:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "Password123"
}
```

В ответе возвращается `access_token`. Для защищённых методов используется заголовок:

```text
Authorization: Bearer <access_token>
```

Новые пользователи регистрируются с ролью `USER`. Для проверки административных методов в учебной БД можно назначить роль:

```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';
```

## API

### Auth

| Method | Endpoint | Доступ |
|---|---|---|
| POST | `/api/auth/register` | публичный |
| POST | `/api/auth/login` | публичный |

### Workshops

| Method | Endpoint | Доступ |
|---|---|---|
| GET | `/api/workshops` | публичный |
| GET | `/api/workshops/:id` | публичный |
| POST | `/api/workshops` | ADMIN |
| PUT | `/api/workshops/:id` | ADMIN |
| DELETE | `/api/workshops/:id` | ADMIN |
| POST | `/api/workshops/classrooms` | ADMIN |

Пример создания мастер-класса:

```json
{
  "title": "Основы TypeScript",
  "description": "Практический мастер-класс",
  "date": "2027-01-15T18:00:00Z",
  "maxParticipants": 10,
  "classroomId": 1
}
```

### Bookings

| Method | Endpoint | Доступ |
|---|---|---|
| POST | `/api/bookings` | USER/ADMIN |
| GET | `/api/bookings/mine` | USER/ADMIN |
| DELETE | `/api/bookings/:id` | владелец брони |
| GET | `/api/bookings/all` | ADMIN |

Создание бронирования:

```json
{
  "workshopId": 1
}
```

## Бизнес-правила

- нельзя бронировать прошедший мастер-класс;
- нельзя создать две активные брони одного пользователя на один мастер-класс;
- нельзя превысить `maxParticipants`;
- `maxParticipants` не может превышать вместимость аудитории;
- отменённая бронь не считается активной;
- пользователь получает только свои бронирования;
- административные операции защищены JWT + `RolesGuard`;
- создание брони выполняется в транзакции с блокировкой мастер-класса, чтобы избежать переполнения при параллельных запросах.

## Postman

Коллекцию запросов можно импортировать из `postman/NestJS-Workshop-Booking.postman_collection.json`.

## Проверка

Перед сдачей рекомендуется проверить:

```bash
npm run build
npm test
```

Проект подготовлен в рамках домашнего задания по серверным фреймворкам: NestJS, ORM, REST API, безопасность, Docker и Postman.
