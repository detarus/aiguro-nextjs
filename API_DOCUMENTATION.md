# API ДОКУМЕНТАЦИЯ AIGURO NEXTJS

## МЕТРИКА ОЦЕНКИ API (0-100 БАЛЛОВ)

### КРИТЕРИИ ОЦЕНКИ:
- **Безопасность (25 баллов)**: Аутентификация Bearer Token (5), Валидация входных данных (5), Rate limiting (5), CORS настройки (5), Обработка ошибок (5)
- **Производительность (25 баллов)**: Кэширование (5), Пагинация (5), Оптимизация запросов (5), Async/await использование (5), Сжатие ответов (5)
- **Архитектура (25 баллов)**: RESTful дизайн (5), Правильные HTTP методы (5), Статус коды (5), Структура URL (5), Идемпотентность (5)
- **Надежность (25 баллов)**: Логирование (5), Мониторинг (5), Timeout'ы (5), Retry логика (5), Документация (5)

### BASE URL: `${NEXT_PUBLIC_API_URL}`
### АУТЕНТИФИКАЦИЯ: Bearer Token (Clerk JWT)

---

## 1. ЭКРАН DASHBOARD OVERVIEW `/dashboard/overview`

### 1.1 Получение диалогов для обзора **[95/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}/dialogs`

**Параметры:**
- `orgId`: string - ID организации из backend
- `funnelId`: string - ID выбранной воронки
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - Уникальный ID диалога
- `uuid`: string - UUID диалога
- `thread_id`: string - ID потока сообщений
- `client_id`: number - ID клиента
- `funnel_id`: string - ID воронки
- `created_at`: string - Дата создания (ISO)
- `updated_at`: string - Дата обновления (ISO)
- `status`: string - Статус диалога
- `messages_count`: number - Количество сообщений
- `close_ratio`: number - Процент закрытия
- `manager`: string|null - Ответственный менеджер
- `ai`: boolean - Обрабатывается ИИ
- `unsubscribed`: boolean - Отписан ли клиент
- `client`: object - Данные клиента
  - `id`: number - ID клиента
  - `name`: string - Имя клиента
  - `phone`: string - Телефон
  - `email`: string - Email
  - `manager`: string|null - Менеджер
  - `status`: string - Статус клиента
  - `close_ratio`: number - Процент закрытия
  - `messages_count`: number - Количество сообщений

---

## 2. ЭКРАН КЛИЕНТЫ `/dashboard/clients`

### 2.1 Получение списка клиентов **[90/100]**
**GET** `/api/organization/{orgId}/clients`

**Параметры:**
- `orgId`: string - ID организации из backend
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: number - Уникальный ID клиента
- `name`: string - Имя клиента
- `email`: string - Email клиента
- `phone`: string - Телефон клиента
- `manager`: string|null - Ответственный менеджер
- `status`: string - Статус (active/inactive)
- `assignedTo`: string - Назначенный ответственный
- `type`: string - Текущая стадия клиента (новый / постоянный / неактивный)
- `created`: string - Дата создания
- `lastActivity`: string - Последняя активность
- `created_at`: string - Дата создания (ISO)
- `last_activity`: string - Последняя активность (ISO)

---

## 3. ЭКРАН СДЕЛКИ `/dashboard/deals`

### 3.1 Получение диалогов как сделок **[95/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}/dialogs`

**Параметры:**
- `orgId`: string - ID организации из backend
- `funnelId`: string - ID выбранной воронки
- `Authorization`: string - Bearer Token

**Ответ (расширенная структура для канбан и таблиц):**
- `id`: string - Уникальный ID диалога
- `uuid`: string - UUID диалога
- `thread_id`: string - ID потока сообщений
- `client_id`: number - ID клиента
- `funnel_id`: string|number - ID воронки
- `created_at`: string - Дата создания (ISO)
- `updated_at`: string - Дата обновления (ISO)
- `status`: string - Статус диалога
- `messages_count`: number - Количество сообщений
- `last_message`: string - Последнее сообщение
- `close_ratio`: number - Процент закрытия (0-100)
- `manager`: string|null - Ответственный менеджер
- `ai`: boolean - Обрабатывается ИИ
- `unsubscribed`: boolean - Отписан ли клиент
- `stage`: string - Текущая стадия
- `lastActivity`: string - Последняя активность
- `description`: string - Описание сделки
- `tags`: array - Теги сделки
- `price`: number - Сумма сделки
- `channel`: string - Канал (telegram/whatsapp/etc)
- `client`: object - Данные клиента
  - `id`: number - ID клиента
  - `name`: string - Имя клиента
  - `phone`: string - Телефон
  - `email`: string - Email
  - `manager`: string|null - Менеджер
  - `status`: string - Статус клиента
  - `close_ratio`: number - Процент закрытия
  - `messages_count`: number - Количество сообщений

---

## 4. ЭКРАН ТЕХПОДДЕРЖКА `/dashboard/support`

### 4.1 Получение тикетов поддержки **[85/100]**
**GET** `/api/support/tickets`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки (опционально)
- `status`: string - Фильтр по статусу (open/in_progress/waiting/closed)
- `department`: string - Отдел (technical/sales/billing/general)
- `page`: number - Номер страницы
- `limit`: number - Лимит записей
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - Уникальный ID тикета
- `subject`: string - Тема обращения
- `department`: string - Отдел
- `status`: string - Статус (open/in_progress/waiting/closed)
- `priority`: string - Приоритет (low/medium/high/urgent)
- `created_at`: string - Дата создания (ISO)
- `updated_at`: string - Дата обновления (ISO)
- `messages_count`: number - Количество сообщений
- `funnel_id`: string|null - ID воронки
- `funnel_name`: string|null - Название воронки

### 4.2 Создание тикета поддержки **[90/100]**
**POST** `/api/support/tickets`

**Параметры тела:**
- `subject`: string - Тема обращения (обязательно)
- `description`: string - Описание проблемы (обязательно)
- `department`: string - Отдел (обязательно)
- `funnel_id`: string - ID воронки (опционально)
- `priority`: string - Приоритет (опционально, по умолчанию medium)
- `files`: File[] - Прикрепленные файлы (опционально)

### 4.3 Получение конкретного тикета **[92/100]**
**GET** `/api/support/tickets/{ticketId}`

**Параметры:**
- `ticketId`: string - ID тикета
- `Authorization`: string - Bearer Token

### 4.4 Получение сообщений тикета **[88/100]**
**GET** `/api/support/tickets/{ticketId}/messages`

**Параметры:**
- `ticketId`: string - ID тикета
- `page`: number - Номер страницы
- `limit`: number - Лимит сообщений
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - ID сообщения
- `text`: string - Текст сообщения
- `role`: string - Роль (user/support)
- `timestamp`: string - Время отправки (ISO)
- `attachments`: array - Прикрепленные файлы
  - `id`: string - ID файла
  - `name`: string - Имя файла
  - `url`: string - URL для скачивания
  - `size`: number - Размер в байтах

### 4.5 Отправка сообщения в тикет **[89/100]**
**POST** `/api/support/tickets/{ticketId}/messages`

**Параметры тела:**
- `text`: string - Текст сообщения (обязательно)
- `attachments`: File[] - Прикрепленные файлы (опционально)

---

## 5. ЭКРАН УПРАВЛЕНИЕ ВОРОНКАМИ `/dashboard/management`

### 5.1 Получение данных воронки **[98/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - ID воронки
- `name`: string - Название воронки
- `display_name`: string - Отображаемое название
- `is_active`: boolean - Активна ли воронка
- `stages`: array - Этапы воронки
  - `name`: string - Название этапа
  - `assistant_code_name`: string - Код ассистента
  - `prompt`: string - Промпт этапа
  - `followups`: array - Настройки follow-up
    - `delay_minutes`: number - Задержка в минутах

### 5.2 Получение ассистентов воронки **[96/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}/assistants`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `Authorization`: string - Bearer Token

**Ответ:**
- `assistant_code_name`: string - Код ассистента
- `name`: string - Название ассистента
- `prompt`: string - Системный промпт
- `followups_count`: number - Количество настроек follow-up

### 5.3 Обновление ассистента **[94/100]**
**PUT** `/api/organization/{orgId}/funnel/{funnelId}/assistant/{assistantCode}`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `assistantCode`: string - Код ассистента
- `Authorization`: string - Bearer Token

**Параметры тела:**
- `prompt`: string - Новый промпт ассистента (обязательно)

### 5.4 Получение подключений мессенджеров **[91/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}/messenger_connections`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - ID подключения
- `name`: string|null - Название подключения
- `messenger_type`: string - Тип мессенджера (telegram/whatsapp/etc)
- `is_active`: boolean - Активно ли подключение
- `funnel_id`: string - ID воронки
- `connection_data`: object - Данные подключения

### 5.5 Создание подключения мессенджера **[89/100]**
**POST** `/api/organization/{orgId}/funnel/{funnelId}/messenger_connection`

**Параметры тела:**
- `messenger_type`: string - Тип мессенджера (обязательно)
- `token`: string - Токен подключения (обязательно)
- `name`: string - Название подключения (опционально)

### 5.6 Удаление подключения мессенджера **[92/100]**
**DELETE** `/api/organization/{orgId}/funnel/{funnelId}/messenger_connection/{connectionId}`

---

## 6. ЭКРАН ИНТЕГРАЦИИ `/dashboard/integrations`

### 6.1 Получение списка воронок **[93/100]**
**GET** `/api/organization/{orgId}/funnels`

**Параметры:**
- `orgId`: string - ID организации
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - ID воронки
- `name`: string - Название воронки
- `display_name`: string - Отображаемое название
- `is_active`: boolean - Активна ли воронка

### 6.2 Получение подключений мессенджеров по воронке **[90/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}/messenger_connections`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - ID подключения
- `name`: string|null - Название подключения
- `messenger_type`: string - Тип мессенджера (telegram/whatsapp/etc)
- `is_active`: boolean - Активно ли подключение
- `funnel_id`: string - ID воронки
- `connection_data`: object - Данные подключения

### 6.3 Создание подключения для интеграции **[87/100]**
**POST** `/api/organization/{orgId}/funnel/{funnelId}/messenger_connection`

**Параметры тела:**
- `messenger_type`: string - Тип мессенджера (обязательно)
- `token`: string - Токен подключения (обязательно)
- `name`: string - Название подключения (опционально)

### 6.4 Удаление подключения интеграции **[91/100]**
**DELETE** `/api/organization/{orgId}/funnel/{funnelId}/messenger_connection/{connectionId}`

---

## 7. ЭКРАН ВОРОНКИ `/dashboard/funnels`

### 7.1 Получение списка воронок **[94/100]**
**GET** `/api/organization/{orgId}/funnels`

**Параметры:**
- `orgId`: string - ID организации
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - ID воронки
- `name`: string - Название воронки
- `display_name`: string - Отображаемое название
- `is_active`: boolean - Активна ли воронка

### 7.2 Удаление воронки **[88/100]**
**DELETE** `/api/organization/{orgId}/funnel/{funnelId}`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `Authorization`: string - Bearer Token

---

## 8. ЭКРАН ДИАЛОГИ `/dashboard/messengers`

### 8.1 Получение диалогов мессенджеров **[96/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}/dialogs`

**Параметры:**
- `orgId`: string - ID организации из backend
- `funnelId`: string - ID выбранной воронки
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - Уникальный ID диалога
- `uuid`: string - UUID диалога
- `thread_id`: string - ID потока сообщений
- `client_id`: number - ID клиента
- `funnel_id`: string - ID воронки
- `created_at`: string - Дата создания (ISO)
- `updated_at`: string - Дата обновления (ISO)
- `status`: string - Статус диалога
- `messages_count`: number - Количество сообщений
- `close_ratio`: number - Процент закрытия
- `manager`: string|null - Ответственный менеджер
- `ai`: boolean - Обрабатывается ИИ
- `unsubscribed`: boolean - Отписан ли клиент

### 8.2 Получение сообщений диалога **[97/100]**
**GET** `/api/organization/{orgId}/funnel/{funnelId}/dialog/{dialogUuid}/messages`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `dialogUuid`: string - UUID диалога
- `page`: number - Номер страницы (опционально)
- `limit`: number - Лимит сообщений (опционально)
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - ID сообщения
- `text`: string - Текст сообщения
- `role`: string - Роль (user/assistant/manager)
- `timestamp`: string - Время отправки (ISO)
- `time`: string - Форматированное время

### 8.3 Отправка сообщения в диалог **[95/100]**
**POST** `/api/organization/{orgId}/funnel/{funnelId}/dialog/{dialogUuid}/message`

**Параметры:**
- `orgId`: string - ID организации
- `funnelId`: string - ID воронки
- `dialogUuid`: string - UUID диалога
- `Authorization`: string - Bearer Token

**Параметры тела:**
- `text`: string - Текст сообщения (обязательно)
- `role`: string - Роль отправителя (assistant/manager)

---

## 9. ЭКРАН КЛИЕНТ ДЕТАЛИ `/dashboard/clients/[id]`

### 9.1 Получение данных клиента **[89/100]**
**GET** `/api/organization/{orgId}/client/{clientId}`

**Параметры:**
- `orgId`: string - ID организации
- `clientId`: string - ID клиента
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: number - ID клиента
- `name`: string - Имя клиента
- `email`: string - Email
- `phone`: string - Телефон
- `manager`: string|null - Ответственный менеджер
- `status`: string - Статус клиента
- `created_at`: string - Дата создания (ISO)
- `last_activity`: string - Последняя активность (ISO)

### 9.2 Получение диалогов клиента **[93/100]**
**GET** `/api/organization/{orgId}/client/{clientId}/dialogs`

**Параметры:**
- `orgId`: string - ID организации
- `clientId`: string - ID клиента
- `Authorization`: string - Bearer Token

**Ответ:**
- `id`: string - Уникальный ID диалога
- `uuid`: string - UUID диалога
- `thread_id`: string - ID потока сообщений
- `client_id`: number - ID клиента
- `funnel_id`: string - ID воронки
- `created_at`: string - Дата создания (ISO)
- `updated_at`: string - Дата обновления (ISO)
- `status`: string - Статус диалога
- `messages_count`: number - Количество сообщений
- `close_ratio`: number - Процент закрытия
- `manager`: string|null - Ответственный менеджер
- `ai`: boolean - Обрабатывается ИИ
- `unsubscribed`: boolean - Отписан ли клиент

### 9.3 Обновление данных клиента **[86/100]**
**PUT** `/api/organization/{orgId}/client/{clientId}`

**Параметры тела:**
- `name`: string - Имя клиента (опционально)
- `email`: string - Email (опционально)
- `phone`: string - Телефон (опционально)
- `manager`: string - Ответственный менеджер (опционально)
- `status`: string - Статус (опционально)

### 9.4 Удаление клиента **[84/100]**
**DELETE** `/api/organization/{orgId}/client/{clientId}`

---

## СТАНДАРТНЫЕ ОШИБКИ

**400 Bad Request**: Некорректные параметры
**401 Unauthorized**: Отсутствует или невалидный токен
**403 Forbidden**: Недостаточно прав доступа
**404 Not Found**: Ресурс не найден
**429 Too Many Requests**: Превышен лимит запросов
**500 Internal Server Error**: Внутренняя ошибка сервера

## RATE LIMITS
- Аутентифицированные пользователи: 1000 запросов/мин
- Неаутентифицированные: 100 запросов/мин

## TIMEOUTS
- Стандартные запросы: 30 сек
- Загрузка файлов: 60 сек
- Тестирование ассистентов: 45 сек 