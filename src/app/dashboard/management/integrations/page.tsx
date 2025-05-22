'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronLeft
} from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Mock data for integration services based on mockup - restored all services
const integrationServices = [
  {
    id: 'telegram',
    name: 'Telegram',
    status: 'active',
    icon: 'telegram',
    clickable: true
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    status: 'active',
    icon: 'whatsapp',
    clickable: true
  },
  {
    id: 'amocrm',
    name: 'AmoCRM',
    status: 'inactive',
    icon: 'amocrm',
    clickable: true
  },
  {
    id: 'bitrix',
    name: 'Bitrix',
    status: 'inactive',
    icon: 'bitrix',
    clickable: false
  },
  {
    id: 'avito',
    name: 'AVITO',
    status: 'inactive',
    icon: 'avito',
    clickable: false
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'inactive',
    icon: 'instagram',
    clickable: false
  },
  {
    id: 'facebook',
    name: 'Facebook',
    status: 'inactive',
    icon: 'facebook',
    clickable: false
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'inactive',
    icon: 'slack',
    clickable: false
  },
  {
    id: 'viber',
    name: 'Viber',
    status: 'inactive',
    icon: 'viber',
    clickable: false
  },
  {
    id: 'wildberries',
    name: 'WildBerries',
    status: 'inactive',
    icon: 'wildberries',
    clickable: false
  }
];

// Integration details for Telegram with phone numbers
const telegramDetail = {
  id: 'telegram-detail',
  name: 'Telegram',
  fields: [
    { id: 1, label: 'Аккаунт 1', value: '+79999999999', editable: true },
    { id: 2, label: 'Аккаунт 2', value: '@username', editable: true },
    { id: 3, label: 'Аккаунт 3', value: '@tareev_site', editable: true },
    { id: 4, label: 'Аккаунт 4', value: '+79999999999', editable: true },
    { id: 5, label: 'Аккаунт 5', value: 'user1@example.com', editable: true }
  ]
};

// Integration details for AmoCRM
const amoCRMDetail = {
  id: 'amocrm-detail',
  name: 'AmoCRM',
  fields: [
    { id: 6, label: 'Аккаунт 1', value: '+79995599999', editable: true },
    { id: 7, label: 'Аккаунт 2', value: '+79999999943', editable: true },
    { id: 8, label: 'Аккаунт 3', value: '@tareev_site', editable: true },
    { id: 9, label: 'Аккаунт 4', value: '+79999999999', editable: true }
  ]
};

// Integration details for WhatsApp
const whatsAppDetail = {
  id: 'whatsapp-detail',
  name: 'WhatsApp',
  fields: [
    { id: 6, label: 'Аккаунт 1', value: '+79995599999', editable: true },
    { id: 7, label: 'Аккаунт 2', value: '+79999999943', editable: true },
    { id: 8, label: 'Аккаунт 3', value: '@tareev_site', editable: true },
    { id: 9, label: 'Аккаунт 4', value: '+79999999999', editable: true }
  ]
};

// Create a new page component for AI Assistants
function AIAssistantsPage() {
  const [stages, setStages] = React.useState([
    {
      id: 1,
      code_name: 'analyze1',
      text: 'Ты — аналитик отдела продаж с опытом руководителя. Твоя задача — анализировать переписку менеджеров с клиентами в мессенджерах и выявлять ключевые ошибки, влияющие на конверсию. \n# Этапы анализа: \n1. Определи, где менеджер допустил ошибку в диалоге. (error)\n2. Укажи причину, по которой клиент прекратил общение (stop_client). \n3. Оцени вероятность перехода на следующий этап в процентах (percent_sf). \n4. Оцени уровень удовлетворенности клиента по шкале от 1 до 10 (nps). \n5. Определи эмоциональный фон клиента (emotions). \n6. Выяви негативные слова, которые мешают достижению цели (negative). \n7. Укажи, какие были возражения у клиента (objections). \n8. Определи, просил ли клиент связать его с другим человеком (change).\n9. Оцени ход диалога с точки зрения эффективности (analyze_sf). \n10. Определи запрос и цель клиента (не более 5 слов) (target_client).\n'
    },
    {
      id: 2,
      code_name: 'presentation',
      text: 'Ты — менеджер стоматологической клиники. Твоя задача — провести клиента через этап «Презентация» и мягко перевести в этап «Закрытие». Общение выстраивай как живой человек: дружелюбно, по одной мысли за раз, с теплотой и вниманием.\n\nФормат: \n– Используй форму общения от первого лица («мы», «у нас», «давайте» и т. п.) \n– Каждое сообщение — это одна законченная мысль \n- Отвечай толкьо по делу: не уходи на сторонние темы. Если клиент спрашивает не по теме, то вежливо верни его к диалогу\n– Не давай длинных текстов — разбивай информацию на микросообщения \n– Всю информацию о клинике бери из базы знаний "search_knowledge". Кратко эту информацию используй. Не нужно больших текстов\n– Тон общения — тёплый, заботливый, уверенный, с фокусом на комфорте клиента, без официоза\n\nПереход к этапу «Закрытие», когда клиент проявил интерес: \n– Предложи записаться у специалисту\n– Предложи консультацию со специалистом, если клиент сомневается\n\nОтвечай структурировано, выделяя логические части ответа абзацами. Каждый абзац должен выражать законченную мысль. \n\nЕсли не влазит ответ в одно сообщение — разбивай на несколько. Не нужно экономить токены.'
    }
  ]);

  return (
    <PageContainer>
      <div className='space-y-4'>
        <h1 className='text-2xl font-bold'>AI Ассистенты</h1>
        {stages.map((stage) => (
          <div key={stage.id} className='rounded-md border p-4 shadow-sm'>
            <h2 className='text-lg font-semibold'>{stage.code_name}</h2>
            <textarea
              className='w-full rounded-md border p-2'
              value={stage.text}
              onChange={(e) => {
                const newStages = stages.map((s) =>
                  s.id === stage.id ? { ...s, text: e.target.value } : s
                );
                setStages(newStages);
              }}
            />
            <div className='mt-2 flex gap-4'>
              <label className='flex items-center'>
                <input type='checkbox' className='mr-2' />
                Доп. настройка 1
              </label>
              <label className='flex items-center'>
                <input type='checkbox' className='mr-2' />
                Доп. настройка 2
              </label>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

export default AIAssistantsPage;
