'use client';

import React from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { IconInfoCircle } from '@tabler/icons-react';

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
        <h1 className='mb-6 text-2xl font-bold'>AI Ассистенты</h1>
        {stages.map((stage) => (
          <div key={stage.id} className='rounded-md border p-4 shadow-sm'>
            <h2 className='pb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              <input
                type='text'
                className='mb-4 w-full rounded-md border p-2 text-gray-900 dark:text-white'
                value={stage.code_name}
                onChange={(e) => {
                  const newStages = stages.map((s) =>
                    s.id === stage.id ? { ...s, code_name: e.target.value } : s
                  );
                  setStages(newStages);
                }}
              />
            </h2>
            <label className='mb-2 block flex items-center text-sm font-medium text-gray-900 dark:text-white'>
              Промпт для Ассистента
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconInfoCircle
                    className='ml-1 cursor-help text-gray-900 dark:text-white'
                    size={16}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-sm text-black dark:text-white'>
                    Советы по заполнению: Опишите задачу ассистента, используйте
                    ясные и краткие формулировки, избегайте двусмысленностей.
                  </p>
                </TooltipContent>
              </Tooltip>
            </label>
            <textarea
              className='h-40 w-full rounded-md border p-4'
              value={stage.text}
              onChange={(e) => {
                const newStages = stages.map((s) =>
                  s.id === stage.id ? { ...s, text: e.target.value } : s
                );
                setStages(newStages);
              }}
            />
            <div className='mt-4 flex flex-col gap-2'>
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
        <Button className='mt-4 bg-blue-500 text-white hover:bg-blue-600'>
          Сохранить
        </Button>
      </div>
    </PageContainer>
  );
}

// Export the new page component
export default AIAssistantsPage;
