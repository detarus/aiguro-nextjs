# Тестирование API создания организаций

## Новая структура запроса

После внесенных изменений, API `/api/organizations` теперь отправляет следующую структуру в бэкенд Aiguro:

```json
{
  "gid": "org_2abc123def456ghi789",
  "display_name": "Название организации",
  "is_active": true
}
```

## Поля запроса

- **gid** (string) - Clerk Organization ID, уникальный идентификатор организации из Clerk
- **display_name** (string) - Отображаемое название организации
- **is_active** (boolean) - Статус активности организации (всегда true при создании)

## Пример использования

### 1. Автоматическое создание через OrganizationCreationProvider

Когда пользователь создает новую организацию через Clerk UI, система автоматически:

1. Детектирует создание новой организации
2. Вызывает `/api/organizations` с данными:
   ```json
   {
     "organizationName": "Моя новая компания",
     "clerkOrgId": "org_2abc123def456ghi789"
   }
   ```

3. API преобразует данные в структуру для бэкенда:
   ```json
   {
     "gid": "org_2abc123def456ghi789",
     "display_name": "Моя новая компания", 
     "is_active": true
   }
   ```

4. Отправляет POST запрос на `https://app.dev.aiguro.ru/api/organization`

5. Получает ответ с ID организации в бэкенде

6. Обновляет метаданные Clerk организации с полученным ID

### 2. Ручное тестирование через curl

```bash
curl -X POST http://localhost:3002/api/organizations \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_CLERK_SESSION_TOKEN" \
  -d '{
    "organizationName": "Тестовая организация",
    "clerkOrgId": "org_test123456789"
  }'
```

## Логирование

API выводит подробные логи для отладки:

```
🚀 Attempting to create organization in Aiguro backend...
📤 Request data: {
  url: 'https://app.dev.aiguro.ru/api/organization',
  method: 'POST',
  body: {
    gid: 'org_2abc123def456ghi789',
    display_name: 'Моя новая компания',
    is_active: true
  },
  clerkOrgId: 'org_2abc123def456ghi789',
  userId: 'user_123',
  hasToken: true
}
📥 Backend response status: 201
✅ Backend response data: { id: 42, display_name: "Моя новая компания", is_active: true }
🎯 Extracted backend organization ID: 42
```

## Ожидаемый ответ от бэкенда

Бэкенд должен вернуть структуру:

```json
{
  "id": 42,
  "gid": "org_2abc123def456ghi789",
  "display_name": "Моя новая компания",
  "is_active": true
}
```

Где `id` - это внутренний ID организации в системе Aiguro, который сохраняется в метаданных Clerk как `id_backend`. 