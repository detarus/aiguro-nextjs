'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/contexts/FunnelsContext';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { AllFunnelsPlaceholder } from '@/components/all-funnels-placeholder';
import { FileUploader } from '@/components/file-uploader';
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBrandFacebook,
  IconSettings,
  IconUsers,
  IconAlertCircle,
  IconRotateClockwise,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
  IconUpload,
  IconRefresh
} from '@tabler/icons-react';

// Импорт Kanban компонентов
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// Интерфейсы
interface Integration {
  id: string;
  name: string;
  type: 'telegram' | 'whatsapp' | 'instagram' | 'facebook' | 'other';
  status: 'connected' | 'disconnected' | 'error';
  funnel_id?: string;
  connection_name?: string;
  last_activity?: string;
}

interface AgentTeam {
  id: string;
  name: string;
  type: 'Мультиагент' | 'Одиночный';
  cv: number;
  users: number;
  warnings: number;
  errors: number;
  success: number;
  enabled: boolean;
  meetingType?: string;
}

interface Stage {
  name: string;
  assistant_code_name: string;
  prompt?: string;
  followups?: { delay_minutes: number }[];
  deals_count?: number;
  deals_amount?: number;
  assistant?: {
    name: string;
    code_name: string;
  };
}

// Интерфейсы для настроек AI
interface AISettings {
  mode: 'complete' | 'insert' | 'edit';
  model: string;
  temperature: number;
  maxLength: number;
  topP: number;
  preset: string;
  followUp: {
    enabled: boolean;
    count: number;
    delay: number;
  };
  transfer: string;
}

interface GeneralSettings {
  cookieSettings: {
    contextMemory: boolean;
    dataCollection: boolean;
    stopAgentAfterManager: boolean;
    agentKnowledgeBase: boolean;
    voiceRequests: boolean;
  };
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  time: string;
}

// Конфигурация интеграций
const integrationIcons = {
  telegram: IconBrandTelegram,
  whatsapp: IconBrandWhatsapp,
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  default: IconSettings
};

// Компоненты скелетонов
function ConnectionSkeleton() {
  return (
    <Card className='mb-2'>
      <CardContent className='p-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded' />
          <div className='flex-1'>
            <Skeleton className='mb-1 h-4 w-24' />
            <Skeleton className='h-3 w-16' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentSkeleton() {
  return (
    <Card className='border bg-white shadow-sm'>
      <CardContent>
        <div className='grid grid-cols-3 gap-0'>
          {/* Колонка 1: Название и переключатель */}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-6 w-12 rounded-full' />
          </div>

          {/* Разделитель */}
          <div className='relative flex items-center justify-center'>
            <div className='absolute top-0 bottom-0 left-27 w-px bg-gray-200'></div>
            <div className='flex flex-col items-center gap-2'>
              <Skeleton className='h-5 w-20 rounded-full' />
              <Skeleton className='h-7 w-20 rounded' />
            </div>
            <div className='absolute top-0 right-27 bottom-0 w-px bg-gray-200'></div>
          </div>

          {/* Колонка 3: CV агента */}
          <div className='space-y-2'>
            <Skeleton className='ml-auto h-3 w-16' />
            <Skeleton className='ml-auto h-6 w-12' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StageSkeleton() {
  return (
    <Card className='mb-4 border bg-white shadow-sm'>
      <CardContent className='py-2'>
        <div className='grid grid-cols-2 gap-0'>
          {/* Колонка 1: Проблем */}
          <div>
            <Skeleton className='mb-2 h-3 w-12' />
            <div className='flex items-center gap-1'>
              <Skeleton className='h-4 w-4 rounded-full' />
              <Skeleton className='h-5 w-4' />
            </div>
          </div>

          {/* Разделитель и Колонка 2: CV Этапа */}
          <div className='relative'>
            <div className='absolute top-0 bottom-0 left-0 w-px bg-gray-200'></div>
            <div className='pl-10'>
              <Skeleton className='mb-2 ml-auto h-3 w-16' />
              <div className='flex items-center justify-end gap-2'>
                <Skeleton className='h-5 w-6' />
                <Skeleton className='h-4 w-8 rounded-full' />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент общих настроек мультиагента
function AgentGeneralSettings({
  generalSettings,
  onSettingChange,
  onSave,
  backendOrgId,
  funnelId
}: {
  generalSettings: GeneralSettings;
  onSettingChange: (key: string, value: boolean) => void;
  onSave: () => void;
  backendOrgId?: string;
  funnelId?: string;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    description: '',
    category: '',
    is_public: false
  });

  const FILE_CATEGORIES = [
    { value: 'general_info', label: 'Общая информация' },
    { value: 'service_catalog', label: 'Каталог услуг' },
    { value: 'dialog_management', label: 'Ведение диалога' },
    { value: 'client_work', label: 'Работа с клиентом' }
  ];

  const isKnowledgeBaseEnabled =
    generalSettings.cookieSettings.agentKnowledgeBase;

  // Загрузка файлов при активации базы знаний
  useEffect(() => {
    if (isKnowledgeBaseEnabled && backendOrgId && funnelId) {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKnowledgeBaseEnabled, backendOrgId, funnelId]);

  const fetchFiles = async () => {
    if (!backendOrgId || !funnelId) return;

    setFilesLoading(true);
    try {
      const token = getClerkTokenFromClientCookie();
      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${funnelId}/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Files data:', data); // Отладка
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleOpenUploadModal = () => {
    setUploadForm({
      file: null,
      description: '',
      category: '',
      is_public: false
    });
    setUploadModalOpen(true);
  };

  const handleUploadFile = async () => {
    if (!uploadForm.file || !backendOrgId || !funnelId) return;

    setUploadLoading(true);
    try {
      const token = getClerkTokenFromClientCookie();
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      if (uploadForm.description)
        formData.append('description', uploadForm.description);
      if (uploadForm.category) formData.append('category', uploadForm.category);
      formData.append('is_public', uploadForm.is_public.toString());

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${funnelId}/files`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        setUploadModalOpen(false);
        await fetchFiles(); // Перезагружаем список файлов
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string | number) => {
    if (!backendOrgId || !funnelId) return;

    if (!confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      const token = getClerkTokenFromClientCookie();
      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${funnelId}/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        await fetchFiles(); // Перезагружаем список файлов
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  const cookieOptions = [
    {
      key: 'contextMemory',
      title: 'Память контекста',
      description:
        'Сохраняет информацию о предыдущих действиях пользователя для обеспечения последовательного взаимодействия с сайтом.',
      enabled: true
    },
    {
      key: 'dataCollection',
      title: 'Сбор массива данных',
      description:
        'Позволяет собирать анонимные данные о поведении пользователя для анализа и улучшения сервиса.',
      enabled: false
    },
    {
      key: 'stopAgentAfterManager',
      title: 'Пауза после сообщения от менеджера',
      description:
        'Обеспечивает автоматическую остановку работы чат-агента после вмешательства менеджера.',
      enabled: true
    },
    {
      key: 'agentKnowledgeBase',
      title: 'База знаний агента',
      description:
        'Даёт агенту доступ к внутренней базе знаний для предоставления точных и полезных ответов пользователю.',
      enabled: true
    },
    {
      key: 'voiceRequests',
      title: 'Голосовые запросы и ответы',
      description:
        'Активирует возможность обработки голосовых команд и озвучивания ответов для удобства пользователей.',
      enabled: false
    }
  ];

  return (
    <>
      <Card className='h-fit'>
        {/* <CardHeader>
          <CardTitle>Настройки мультиагента</CardTitle>
          <p className='text-muted-foreground text-sm'>
            Вы можете настроить и адаптировать под свои задачи в этом меню агента
          </p>
        </CardHeader> */}
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            {cookieOptions.map((setting) => (
              <React.Fragment key={setting.key}>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium'>{setting.title}</h4>
                    <p className='text-muted-foreground text-xs'>
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    checked={
                      generalSettings.cookieSettings[
                        setting.key as keyof typeof generalSettings.cookieSettings
                      ]
                    }
                    onCheckedChange={(checked) =>
                      onSettingChange(setting.key, checked)
                    }
                  />
                </div>

                {/* Показываем файлы СРАЗУ после "База знаний агента" */}
                {setting.key === 'agentKnowledgeBase' &&
                  isKnowledgeBaseEnabled && (
                    <div className='mt-3 mb-3 ml-4 space-y-3 border-l-2 border-blue-300 pl-4'>
                      <div className='flex items-center justify-between gap-2'>
                        <h5 className='text-sm font-semibold text-blue-700'>
                          📁 Файлы базы знаний
                        </h5>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={fetchFiles}
                          disabled={filesLoading || !backendOrgId || !funnelId}
                        >
                          <IconRefresh
                            className={`h-3 w-3 ${filesLoading ? 'animate-spin' : ''}`}
                          />
                        </Button>
                      </div>

                      {!backendOrgId || !funnelId ? (
                        <div className='rounded bg-yellow-50 p-2 text-xs text-yellow-600'>
                          ⚠️ Недостаточно данных для загрузки файлов
                        </div>
                      ) : filesLoading ? (
                        <div className='text-xs text-gray-500'>
                          Загрузка файлов...
                        </div>
                      ) : (
                        <>
                          {files.length === 0 ? (
                            <div className='rounded border-2 border-dashed bg-gray-50 p-3 text-center text-xs text-gray-500'>
                              Файлы не загружены
                            </div>
                          ) : (
                            <div className='space-y-1'>
                              {files.slice(0, 5).map((file: any) => {
                                // Используем original_name как основное название
                                const fileName =
                                  file.original_name ||
                                  file.filename ||
                                  file.name ||
                                  `Файл ${file.id}`;
                                const fileSize = file.size || '?';

                                return (
                                  <div
                                    key={file.id}
                                    className='group flex items-center gap-2 rounded bg-blue-50 p-2 text-xs transition-colors hover:bg-blue-100'
                                  >
                                    <span
                                      className='flex-1 truncate font-medium'
                                      title={fileName}
                                    >
                                      {fileName}
                                    </span>
                                    <span className='flex-shrink-0 text-gray-500'>
                                      {fileSize} Bytes
                                    </span>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-6 w-6 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
                                      onClick={() => handleDeleteFile(file.id)}
                                    >
                                      <IconTrash className='h-3 w-3 text-red-500' />
                                    </Button>
                                  </div>
                                );
                              })}
                              {files.length > 5 && (
                                <div className='pt-1 text-center text-xs text-gray-500'>
                                  И еще {files.length - 5} файл(ов)
                                </div>
                              )}
                            </div>
                          )}

                          {/* Кнопка загрузки внизу списка */}
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full'
                            onClick={handleOpenUploadModal}
                            disabled={!backendOrgId || !funnelId}
                          >
                            <IconUpload className='mr-2 h-3 w-3' />
                            Загрузить
                          </Button>
                        </>
                      )}
                    </div>
                  )}
              </React.Fragment>
            ))}
          </div>

          <Button onClick={onSave} className='w-full'>
            Сохранить настройки общения
          </Button>
        </CardContent>
      </Card>

      {/* Модальное окно загрузки файла */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>Загрузить файл в базу знаний</DialogTitle>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label>Файл *</Label>
              <div className='min-h-[120px]'>
                <FileUploader
                  value={uploadForm.file ? [uploadForm.file] : []}
                  onValueChange={(files) => {
                    if (Array.isArray(files) && files.length > 0) {
                      setUploadForm((prev) => ({ ...prev, file: files[0] }));
                    } else {
                      setUploadForm((prev) => ({ ...prev, file: null }));
                    }
                  }}
                  accept={{ '*': [] }}
                  maxSize={50 * 1024 * 1024}
                  maxFiles={1}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='category'>Категория</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите категорию' />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='is_public'>Публичный доступ</Label>
                <Select
                  value={uploadForm.is_public ? 'true' : 'false'}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      is_public: value === 'true'
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='false'>Нет</SelectItem>
                    <SelectItem value='true'>Да</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Описание</Label>
              <Textarea
                id='description'
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                placeholder='Краткое описание файла'
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setUploadModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleUploadFile}
              disabled={uploadLoading || !uploadForm.file}
            >
              {uploadLoading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Компонент настроек AI
function AISettingsComponent({
  aiSettings,
  onAISettingChange,
  onFollowUpChange,
  onSave,
  hasChanges = false
}: {
  aiSettings: AISettings;
  onAISettingChange: (field: keyof AISettings, value: any) => void;
  onFollowUpChange: (field: string, value: any) => void;
  onSave: () => void;
  hasChanges?: boolean;
}) {
  return (
    <Card className='h-fit'>
      <CardContent className='space-y-6 px-6'>
        {/* Mode Toggle */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Форматы работы</Label>
          <Tabs
            value={aiSettings.mode}
            onValueChange={(value) => onAISettingChange('mode', value)}
          >
            <TabsList className='bg-muted w-full'>
              <TabsTrigger value='complete' className='flex-1 text-xs'>
                Агент
              </TabsTrigger>
              <TabsTrigger value='insert' className='flex-1 text-xs'>
                Помощник
              </TabsTrigger>
              <TabsTrigger value='edit' className='flex-1 text-xs'>
                Менеджер
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Model Selection */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Модель AI</Label>
          <Select
            value={aiSettings.model}
            onValueChange={(value) => onAISettingChange('model', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='GPT-4.1 mini'>GPT-4.1 mini</SelectItem>
              <SelectItem value='GPT-4'>GPT-4</SelectItem>
              <SelectItem value='GPT-3.5 Turbo'>GPT-3.5 Turbo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Temperature */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>Температура</Label>
            <span className='text-muted-foreground text-sm'>
              {aiSettings.temperature}
            </span>
          </div>
          <Slider
            value={[aiSettings.temperature]}
            onValueChange={([value]) => onAISettingChange('temperature', value)}
            max={1}
            min={0}
            step={0.01}
            className='w-full'
          />
        </div>

        {/* Maximum Length */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>Макс. длина сообщения</Label>
            <span className='text-muted-foreground text-sm'>
              {aiSettings.maxLength}
            </span>
          </div>
          <Slider
            value={[aiSettings.maxLength]}
            onValueChange={([value]) => onAISettingChange('maxLength', value)}
            max={4000}
            min={1}
            step={1}
            className='w-full'
          />
        </div>

        {/* Follow up */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Фоллоу-ап</Label>
          <div className='flex items-center gap-2'>
            <Switch
              checked={aiSettings.followUp.enabled}
              onCheckedChange={(checked) =>
                onFollowUpChange('enabled', checked)
              }
            />
            <div className='flex flex-1 gap-2'>
              <Select
                value={String(aiSettings.followUp.count)}
                onValueChange={(value) =>
                  onFollowUpChange('count', Number(value))
                }
              >
                <SelectTrigger className='w-16'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>1</SelectItem>
                  <SelectItem value='2'>2</SelectItem>
                  <SelectItem value='3'>3</SelectItem>
                  <SelectItem value='4'>4</SelectItem>
                  <SelectItem value='5'>5</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={`${aiSettings.followUp.delay} мин`}
                onValueChange={(value) =>
                  onFollowUpChange('delay', Number(value.replace(' мин', '')))
                }
              >
                <SelectTrigger className='flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10 мин'>10 мин</SelectItem>
                  <SelectItem value='20 мин'>20 мин</SelectItem>
                  <SelectItem value='30 мин'>30 мин</SelectItem>
                  <SelectItem value='60 мин'>60 мин</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Transfer */}
        {/* <div className='space-y-2'>
          <Label className='text-sm font-medium'>Передача</Label>
          <Select
            value={aiSettings.transfer}
            onValueChange={(value) => onAISettingChange('transfer', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transferOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        <Button
          onClick={onSave}
          className={`w-full ${hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        >
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

// Компонент настройки промпта и тестирования
function PromptTestingComponent({
  instructions,
  activeSettingsTab,
  onTabChange,
  onInstructionsChange,
  onSubmitInstructions,
  onReloadPrompt,
  saving,
  successMessage,
  error,
  stageName,
  currentFunnel,
  backendOrgId
}: {
  instructions: string;
  activeSettingsTab: 'setup' | 'test';
  onTabChange: (tab: 'setup' | 'test') => void;
  onInstructionsChange: (value: string) => void;
  onSubmitInstructions: () => void;
  onReloadPrompt: () => void;
  saving: boolean;
  successMessage: string | null;
  error: string | null;
  stageName?: string;
  currentFunnel?: any;
  backendOrgId?: string;
}) {
  // Состояния чата
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // Состояния диалогов
  const [testDialogs, setTestDialogs] = useState<any[]>([]);
  const [selectedTestDialogId, setSelectedTestDialogId] = useState<string>('');
  const [loadingDialogs, setLoadingDialogs] = useState(false);
  const [creatingDialog, setCreatingDialog] = useState(false);
  const [deletingDialog, setDeletingDialog] = useState(false);

  // Состояние ошибок
  const [testError, setTestError] = useState<string | null>(null);

  // Ref для отслеживания активного поллинга
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const loadTestDialogs = useCallback(async () => {
    if (!backendOrgId || !currentFunnel?.id) return;

    setLoadingDialogs(true);
    setTestError(null);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setTestError('Токен авторизации недоступен');
        return;
      }

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/test_dialogs`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const dialogs = Array.isArray(data) ? data : [];
      setTestDialogs(dialogs);

      // Если есть диалоги и нет выбранного, выбираем первый
      if (dialogs.length > 0 && !selectedTestDialogId) {
        setSelectedTestDialogId(dialogs[0].uuid);
      }
    } catch (error: any) {
      console.error('Error loading test dialogs:', error);
      setTestError(error.message || 'Ошибка при загрузке диалогов');
    } finally {
      setLoadingDialogs(false);
    }
  }, [backendOrgId, currentFunnel?.id, selectedTestDialogId]);

  const fetchDialogData = useCallback(
    async (dialogUuid: string) => {
      if (!backendOrgId || !currentFunnel?.id || !dialogUuid) return;

      try {
        const token = getClerkTokenFromClientCookie();
        if (!token) return;

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${dialogUuid}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTestDialogs((prevDialogs) =>
            prevDialogs.map((d) =>
              d.uuid === dialogUuid ? { ...d, stage: data.stage } : d
            )
          );
        }
      } catch (error) {
        console.error('Error fetching dialog data:', error);
      }
    },
    [backendOrgId, currentFunnel?.id]
  );

  // Отображение новых сообщений по одному
  const displayNewMessagesSequentially = (messagesToAdd: ChatMessage[]) => {
    if (messagesToAdd.length === 0) {
      setSendingMessage(false); // Все сообщения отображены, разблокируем кнопку
      loadTestDialogs(); // Перезагружаем все диалоги, чтобы получить актуальный статус
      return;
    }

    const [nextMessage, ...rest] = messagesToAdd;
    setMessages((prev) => [...prev, nextMessage]);

    // Запускаем отображение следующего сообщения через 800мс
    setTimeout(() => {
      displayNewMessagesSequentially(rest);
    }, 800);
  };

  // Загрузка сообщений диалога
  const loadDialogMessages = useCallback(
    async (dialogUuid: string) => {
      if (!backendOrgId || !currentFunnel?.id || !dialogUuid) return;

      setLoadingMessages(true);
      setTestError(null);

      try {
        const token = getClerkTokenFromClientCookie();
        if (!token) {
          setTestError('Токен авторизации недоступен');
          return;
        }

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${dialogUuid}/messages`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Преобразуем сообщения в нужный формат
        const formattedMessages: ChatMessage[] = Array.isArray(data)
          ? data.map((msg: any) => ({
              id: msg.id || `${msg.time}-${msg.text.slice(0, 50)}`,
              text: msg.text || msg.message || '',
              sender: (msg.role === 'user' ? 'user' : 'assistant') as
                | 'user'
                | 'assistant',
              time: msg.time
                ? new Date(msg.time).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : ''
            }))
          : [];

        // API возвращает сообщения от новых к старым, поэтому реверсируем для получения хронологического порядка
        formattedMessages.reverse();

        setMessages(formattedMessages);
      } catch (error: any) {
        console.error('Error loading dialog messages:', error);
        setTestError(error.message || 'Ошибка при загрузке сообщений');
      } finally {
        setLoadingMessages(false);
      }
    },
    [backendOrgId, currentFunnel?.id]
  );

  // Остановка поллинга
  const stopPolling = (reEnableSend = true) => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingRef.current = false;
    setAiThinking(false);
    if (reEnableSend) {
      setSendingMessage(false); // Разблокируем кнопку отправки
    }
  };

  // Запуск поллинга для новых сообщений
  const startPolling = async () => {
    if (!selectedTestDialogId || isPollingRef.current) return;

    isPollingRef.current = true;
    setAiThinking(true);
    setSendingMessage(true);

    let attempts = 0;
    const maxAttempts = 30; // 15 секунд максимум

    const poll = async () => {
      try {
        if (!isPollingRef.current || !selectedTestDialogId) return;

        const token = getClerkTokenFromClientCookie();
        if (!token) {
          stopPolling();
          return;
        }

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${selectedTestDialogId}/messages`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const allMessagesFromApi: ChatMessage[] = Array.isArray(data)
          ? data.map((msg: any) => ({
              id: msg.id || `${msg.time}-${msg.text.slice(0, 50)}`,
              text: msg.text || msg.message || '',
              sender: (msg.role === 'user' ? 'user' : 'assistant') as
                | 'user'
                | 'assistant',
              time: msg.time
                ? new Date(msg.time).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : ''
            }))
          : [];

        // Реверсируем для хронологического порядка
        allMessagesFromApi.reverse();

        const currentMessageIds = new Set(messages.map((m) => m.id));
        const newAiMessages = allMessagesFromApi.filter(
          (m) => !currentMessageIds.has(m.id) && m.sender === 'assistant'
        );

        if (newAiMessages.length > 0) {
          stopPolling(false); // Останавливаем поллинг, но кнопка заблокирована
          setAiThinking(false); // Убираем индикатор печати
          displayNewMessagesSequentially(newAiMessages); // Показываем сообщения по одному
          return; // Выходим из функции поллинга
        }

        // Проверяем, что поллинг еще активен перед продолжением
        if (!isPollingRef.current) {
          return;
        }

        // Продолжаем поллинг только если нет новых сообщений
        attempts++;
        if (attempts >= maxAttempts) {
          stopPolling(true);
        } else if (isPollingRef.current) {
          pollingRef.current = setTimeout(poll, 1000);
        }
      } catch (error) {
        console.error('Polling error:', error);
        stopPolling(true);
      }
    };

    // Начинаем поллинг
    pollingRef.current = setTimeout(poll, 1000);
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!userMessage.trim() || sendingMessage || !selectedTestDialogId) return;

    setSendingMessage(true);
    setTestError(null);

    const messageText = userMessage.trim();

    // Оптимистичное обновление UI
    const newUserMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      text: messageText,
      sender: 'user',
      time: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setUserMessage('');
    setAiThinking(true);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        throw new Error('Токен авторизации недоступен');
      }

      // Отправляем сообщение через тестовый API роут
      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/test/${selectedTestDialogId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text: messageText,
            role: 'user',
            time: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      startPolling();
    } catch (error: any) {
      console.error('Error sending message:', error);
      setTestError(error.message || 'Ошибка при отправке сообщения');
      // Откатываем UI
      setMessages((prev) => prev.filter((msg) => msg.id !== newUserMessage.id));
      setUserMessage(messageText);
      setAiThinking(false);
      setSendingMessage(false);
    }
  };

  // Создание нового диалога
  const createNewDialog = async () => {
    if (!backendOrgId || !currentFunnel?.id || !stageName) return;

    setCreatingDialog(true);
    setTestError(null);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setTestError('Токен авторизации недоступен');
        return;
      }

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/test_dialog`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            stage: stageName,
            manager: 'Test Manager',
            ai: true,
            unsubscribed: false,
            description: 'Тестовый диалог',
            tags: ['test'],
            price: 0,
            messenger_connection_id: 0
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.uuid) {
        setSelectedTestDialogId(data.uuid);
        await loadTestDialogs();
        setMessages([]);
      }
    } catch (error: any) {
      console.error('Error creating dialog:', error);
      setTestError(error.message || 'Ошибка при создании диалога');
    } finally {
      setCreatingDialog(false);
    }
  };

  // Удаление диалога
  const deleteDialog = async () => {
    if (!selectedTestDialogId || !backendOrgId || !currentFunnel?.id) return;

    const confirmed = window.confirm('Удалить текущий диалог?');
    if (!confirmed) return;

    setDeletingDialog(true);
    setTestError(null);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setTestError('Токен авторизации недоступен');
        return;
      }

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/dialog/${selectedTestDialogId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setSelectedTestDialogId('');
      setMessages([]);
      await loadTestDialogs();
    } catch (error: any) {
      console.error('Error deleting dialog:', error);
      setTestError(error.message || 'Ошибка при удалении диалога');
    } finally {
      setDeletingDialog(false);
    }
  };

  // Изменение диалога
  const handleDialogChange = async (dialogUuid: string) => {
    if (dialogUuid === selectedTestDialogId) return;

    stopPolling();
    setSelectedTestDialogId(dialogUuid);
    setMessages([]);

    if (dialogUuid) {
      await loadDialogMessages(dialogUuid);
    }
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendingMessage && !loadingMessages && userMessage.trim()) {
        sendMessage();
      }
    }
  };

  // Загрузка диалогов при инициализации
  useEffect(() => {
    if (activeSettingsTab === 'test' && backendOrgId && currentFunnel?.id) {
      loadTestDialogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSettingsTab, backendOrgId, currentFunnel?.id]);

  // Загрузка сообщений при выборе диалога
  useEffect(() => {
    if (selectedTestDialogId && activeSettingsTab === 'test') {
      loadDialogMessages(selectedTestDialogId);
      fetchDialogData(selectedTestDialogId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTestDialogId, activeSettingsTab]);

  // Очистка поллинга при размонтировании
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (activeSettingsTab === 'test' && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, aiThinking, activeSettingsTab]);

  return (
    <Card className='h-fit'>
      <CardHeader>
        <CardTitle className='mb-2'>
          Промпт агента/Тестирование
          {stageName && (
            <div className='mt-1 text-sm font-normal text-gray-600'>
              Этап: {stageName}
            </div>
          )}
        </CardTitle>
        <Tabs
          value={activeSettingsTab}
          onValueChange={(value) => onTabChange(value as 'setup' | 'test')}
        >
          <TabsList className='w-full pt-1'>
            <TabsTrigger value='setup' className='flex-1'>
              Настройка
            </TabsTrigger>
            <TabsTrigger value='test' className='flex-1'>
              Тестирование
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className='p-0'>
        {activeSettingsTab === 'setup' && (
          <div className='p-4'>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium'>
                  Инструкции для агента
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => onInstructionsChange(e.target.value)}
                  placeholder='Введите инструкции для AI-агента...'
                  rows={8}
                  className='mt-2 w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
                />
              </div>

              <div className='flex gap-2'>
                <Button
                  onClick={onSubmitInstructions}
                  disabled={saving}
                  className='flex-1'
                >
                  {saving ? 'Сохранение...' : 'Сохранить промпт'}
                </Button>
                <Button
                  variant='outline'
                  onClick={onReloadPrompt}
                  className='px-4'
                >
                  Перезагрузить
                </Button>
              </div>

              {successMessage && (
                <div className='text-sm text-green-600'>{successMessage}</div>
              )}

              {error && <div className='text-sm text-red-600'>{error}</div>}
            </div>
          </div>
        )}

        {activeSettingsTab === 'test' && (
          <div className='flex h-[330px] flex-col'>
            {/* Заголовок чата */}
            <div className='flex items-center justify-between border-b p-4'>
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-200'>
                  <IconUsers className='h-5 w-5 text-gray-500' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>Тестирование</span>
                  <span className='text-xs text-gray-500'>
                    {loadingDialogs ? (
                      'Загрузка...'
                    ) : testDialogs.length > 0 && selectedTestDialogId ? (
                      <select
                        value={selectedTestDialogId}
                        onChange={(e) => handleDialogChange(e.target.value)}
                        className='cursor-pointer border-none bg-transparent text-xs outline-none'
                        disabled={loadingMessages}
                      >
                        {testDialogs.map((dialog, index) => (
                          <option key={dialog.uuid} value={dialog.uuid}>
                            Диалог {index + 1} (
                            {getTranslatedStage(dialog.stage)})
                          </option>
                        ))}
                      </select>
                    ) : (
                      'Нет диалогов'
                    )}
                  </span>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  size='icon'
                  onClick={createNewDialog}
                  disabled={creatingDialog || loadingDialogs}
                  className='h-8 w-8 rounded-full'
                  title='Создать новый диалог'
                >
                  {creatingDialog ? (
                    <IconRotateClockwise className='h-3.5 w-3.5 animate-spin' />
                  ) : (
                    <IconPlus className='h-3.5 w-3.5' />
                  )}
                </Button>

                {selectedTestDialogId && (
                  <Button
                    size='icon'
                    variant='destructive'
                    onClick={deleteDialog}
                    disabled={deletingDialog}
                    className='h-8 w-8 rounded-full'
                    title='Удалить текущий диалог'
                  >
                    {deletingDialog ? (
                      <IconRotateClockwise className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <IconTrash className='h-3.5 w-3.5' />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Ошибки */}
            {testError && (
              <div className='border-b bg-red-50 p-2 text-sm text-red-600'>
                {testError}
              </div>
            )}

            {/* Область сообщений */}
            <div
              ref={chatContainerRef}
              className='chat-messages-container flex-1 overflow-y-auto p-4'
            >
              {loadingMessages ? (
                <div className='flex h-full items-center justify-center'>
                  <div className='text-sm text-gray-500'>
                    Загрузка сообщений...
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className='flex h-full items-center justify-center'>
                  <div className='text-center text-gray-500'>
                    <p>Нет сообщений</p>
                    <p className='mt-1 text-xs'>
                      Напишите сообщение для начала диалога
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      } message-enter-animation`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className='whitespace-pre-wrap'>{message.text}</p>
                        <p className='mt-1 text-xs opacity-70'>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  {aiThinking && (
                    <div className='typing-indicator-animation flex justify-start'>
                      <div className='rounded-lg bg-gray-200 p-3 text-gray-800'>
                        <div className='flex items-center gap-2'>
                          <div className='flex space-x-1'>
                            <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></div>
                            <div
                              className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                              style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                              className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                          </div>
                          <span className='text-sm text-gray-600'>
                            AI печатает...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Поле ввода */}
            <div className='border-t p-4'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Введите сообщение...'
                  className='flex-1 rounded-md border p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  disabled={
                    sendingMessage || loadingMessages || !selectedTestDialogId
                  }
                />
                <Button
                  onClick={sendMessage}
                  disabled={
                    sendingMessage ||
                    loadingMessages ||
                    !userMessage.trim() ||
                    !selectedTestDialogId
                  }
                  size='sm'
                >
                  {sendingMessage ? 'Отправка...' : 'Отправить'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Компонент перемещаемой карточки подключения
function ConnectionCard({
  connection,
  isOverlay
}: {
  connection: Integration;
  isOverlay?: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: connection.id,
    data: {
      type: 'Connection',
      connection
    }
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  };

  const IconComponent =
    integrationIcons[connection.type as keyof typeof integrationIcons] ||
    integrationIcons.default;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 cursor-grab ${isDragging || isOverlay ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className='p-3'>
        <div className='flex items-center gap-2'>
          <IconComponent className='h-4 w-4' />
          <div>
            <div className='text-sm font-medium'>
              {connection.connection_name || connection.name}
            </div>
            <div className='text-xs text-gray-500'>{connection.type}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент колонки Kanban
function KanbanColumn({
  title,
  children,
  className = '',
  headerContent
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border bg-gray-50 ${className}`}
      style={{
        minHeight: '600px',
        minWidth: '250px',
        width: '100%',
        maxWidth: '300px'
      }}
    >
      <div className='rounded-t-lg border-b bg-white p-4'>
        <h3 className='text-sm font-semibold tracking-wide text-gray-700 uppercase'>
          {title}
        </h3>
        {headerContent}
      </div>
      <div className='p-3'>
        <ScrollArea className='h-[500px]'>{children}</ScrollArea>
      </div>
    </div>
  );
}

const STAGE_TRANSLATIONS: { [key: string]: string } = {
  greetings: 'Приветствие',
  presentation: 'Презентация',
  qualification: 'Квалификация',
  needs_analysis: 'Анализ потребностей',
  proposal: 'Предложение',
  negotiation: 'Переговоры',
  closing: 'Закрытие',
  follow_up: 'Сопровождение',
  initial_contact: 'Первичный контакт',
  discovery: 'Выявление',
  demo: 'Демонстрация',
  objection_handling: 'Работа с возражениями'
};

const getTranslatedStage = (stage?: string) => {
  if (!stage) return 'без этапа';
  return STAGE_TRANSLATIONS[stage.toLowerCase()] || stage;
};

function ManagementPageContent() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;

  const [funnelStages, setFunnelStages] = useState<Stage[]>([]);
  const [assistantsLoading, setAssistantsLoading] = useState(true);

  // Состояния для интеграций
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);

  // Состояния для агентов
  const [agentTeams, setAgentTeams] = useState<AgentTeam[]>([]);

  // Состояние для режима настройки агента
  const [selectedAgentForSettings, setSelectedAgentForSettings] =
    useState<AgentTeam | null>(null);

  // Состояние для выбранного этапа в режиме настроек
  const [selectedStageIndex, setSelectedStageIndex] = useState<number | null>(
    null
  );

  // Состояние для модального окна настройки этапа
  const [stageSettingsModal, setStageSettingsModal] = useState<{
    isOpen: boolean;
    stage: Stage | null;
    stageIndex: number;
  }>({
    isOpen: false,
    stage: null,
    stageIndex: -1
  });

  // Состояния для редактирования названий этапов
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(
    null
  );
  const [editingStageValue, setEditingStageValue] = useState<string>('');

  // Состояния для настроек AI
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    cookieSettings: {
      contextMemory: true,
      dataCollection: false,
      stopAgentAfterManager: true,
      agentKnowledgeBase: true,
      voiceRequests: false
    }
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    mode: 'edit',
    model: 'GPT-4.1 mini',
    temperature: 0.56,
    maxLength: 256,
    topP: 0.9,
    preset: 'Пресет 1',
    followUp: {
      enabled: true,
      count: 2,
      delay: 20
    },
    transfer: 'Менеджеру'
  });

  const [activeSettingsTab, setActiveSettingsTab] = useState<'setup' | 'test'>(
    'setup'
  );
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Состояние для Drag and Drop
  const [activeConnection, setActiveConnection] = useState<Integration | null>(
    null
  );

  const { currentFunnel, funnels, loading: funnelsLoading } = useFunnels();

  // Загрузка интеграций
  const fetchIntegrations = useCallback(async () => {
    if (!backendOrgId) return;

    try {
      setIntegrationsLoading(true);
      const token = getClerkTokenFromClientCookie();

      if (!token) return;

      // Получаем все интеграции для всех воронок
      const allIntegrations: Integration[] = [];

      if (funnels && funnels.length > 0) {
        for (const funnel of funnels) {
          try {
            const response = await fetch(
              `/api/organization/${backendOrgId}/funnel/${funnel.id}/messenger_connections`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              const connections = Array.isArray(data) ? data : [];

              connections.forEach((conn: any) => {
                allIntegrations.push({
                  id: `${funnel.id}-${conn.id || conn.name || Math.random()}`,
                  name: conn.connection_name || conn.name || 'Анонимный',
                  type: conn.messenger_type?.toLowerCase() || 'other',
                  status: conn.is_active ? 'connected' : 'disconnected',
                  funnel_id: funnel.id,
                  connection_name: conn.connection_name,
                  last_activity: conn.last_activity
                });
              });
            }
          } catch (error) {
            console.error(
              `Error fetching integrations for funnel ${funnel.id}:`,
              error
            );
          }
        }
      }

      setIntegrations(allIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setIntegrationsLoading(false);
    }
  }, [backendOrgId, funnels]);

  // Загрузка команд агентов
  const loadAgentTeams = useCallback(() => {
    const mockAgentTeams: AgentTeam[] = [
      {
        id: '1',
        name: 'Боевой',
        type: 'Мультиагент',
        cv: 56,
        users: 120,
        warnings: 5,
        errors: 2,
        success: 95,
        enabled: true,
        meetingType: 'Настройки'
      },
      {
        id: '2',
        name: 'Мария',
        type: 'Одиночный',
        cv: 42,
        users: 85,
        warnings: 3,
        errors: 1,
        success: 87,
        enabled: false,
        meetingType: 'Консультация'
      }
    ];
    setAgentTeams(mockAgentTeams);
  }, []);

  // Загрузка этапов воронки
  const fetchFunnelStages = useCallback(async () => {
    if (!currentFunnel || !backendOrgId || funnelsLoading) {
      return;
    }

    // Если выбраны "Все воронки", не загружаем этапы
    if (currentFunnel.id === '0') {
      return;
    }

    try {
      setAssistantsLoading(true);
      const token = getClerkTokenFromClientCookie();

      if (!token) {
        console.error('No token available');
        return;
      }

      const url = `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFunnelStages(data.stages || []);
      } else {
        console.error('Failed to fetch funnel data, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setAssistantsLoading(false);
    }
  }, [currentFunnel, backendOrgId, funnelsLoading]);

  // Обработчики для настроек
  const handleGeneralSettingChange = (key: string, value: boolean) => {
    setGeneralSettings((prev) => ({
      ...prev,
      cookieSettings: {
        ...prev.cookieSettings,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveGeneralSettings = () => {
    // Здесь можно добавить API вызов для сохранения настроек
    setSuccessMessage('Настройки успешно сохранены');
    setHasChanges(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAISettingChange = (field: keyof AISettings, value: any) => {
    setAiSettings((prev) => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleFollowUpChange = (field: string, value: any) => {
    setAiSettings((prev) => ({
      ...prev,
      followUp: {
        ...prev.followUp,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveAISettings = () => {
    // Здесь можно добавить API вызов для сохранения AI настроек
    setSuccessMessage('AI настройки успешно сохранены');
    setHasChanges(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleTabChange = (tab: 'setup' | 'test') => {
    setActiveSettingsTab(tab);
  };

  const handleInstructionsChange = (value: string) => {
    setInstructions(value);
    setHasChanges(true);
  };

  const handleSubmitInstructions = async () => {
    if (
      !currentFunnel ||
      !backendOrgId ||
      selectedStageIndex === null ||
      !funnelStages[selectedStageIndex]
    ) {
      setError('Отсутствуют необходимые данные для сохранения');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setError('Отсутствует токен авторизации');
        return;
      }

      const stage = funnelStages[selectedStageIndex];

      if (stage.assistant && (stage.assistant as any).id) {
        console.log(
          'Saving prompt for assistant ID:',
          (stage.assistant as any).id
        );

        // Используем ID ассистента из данных этапа
        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/assistant/update/${(stage.assistant as any).id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              code_name: stage.assistant.code_name,
              name: stage.assistant.name,
              prompt: instructions
            })
          }
        );

        console.log('Save response status:', response.status);

        if (response.ok) {
          const responseData = await response.json();
          console.log('Save response data:', responseData);
          setSuccessMessage('Промпт успешно обновлен');
          setHasChanges(false);

          // Обновляем данные в локальном состоянии
          const updatedStages = [...funnelStages];
          updatedStages[selectedStageIndex] = {
            ...stage,
            assistant: {
              ...stage.assistant,
              prompt: instructions
            } as any
          };
          setFunnelStages(updatedStages);

          // Убираем сообщение об успехе через 3 секунды
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        } else {
          // Получаем детали ошибки
          let errorMessage = `HTTP ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            console.log('Failed to parse error response');
          }
          throw new Error(errorMessage);
        }
      } else {
        // Если нет ассистента, показываем предупреждение
        setError(
          'У этого этапа не назначен ассистент. Промпт не может быть сохранен.'
        );
      }
    } catch (err: any) {
      console.error('Error saving prompt:', err);
      setError(err.message || 'Ошибка при обновлении промпта');
    } finally {
      setSaving(false);
    }
  };

  const handleReloadPrompt = () => {
    if (selectedStageIndex !== null) {
      loadPromptForStage(selectedStageIndex);
    }
    setHasChanges(false);
  };

  // Функция загрузки промпта для этапа из данных воронки
  const loadPromptForStage = async (stageIndex: number) => {
    if (!currentFunnel || !funnelStages[stageIndex]) {
      setInstructions('');
      return;
    }

    try {
      const stage = funnelStages[stageIndex];
      console.log('Loading prompt for stage:', stage);

      // Берем промпт из данных ассистента этапа
      if (stage.assistant && (stage.assistant as any).prompt) {
        console.log(
          'Found prompt in assistant data:',
          (stage.assistant as any).prompt
        );
        setInstructions((stage.assistant as any).prompt);
      } else if (stage.prompt) {
        console.log('Found prompt in stage data:', stage.prompt);
        setInstructions(stage.prompt);
      } else {
        console.log('No prompt found for stage');
        setInstructions('');
      }
    } catch (error) {
      console.error('Error loading prompt for stage:', error);
      setInstructions('');
    }
  };

  // Обработчик клика на заголовок этапа
  const handleStageHeaderClick = (stageIndex: number) => {
    // Выбираем первого доступного агента и открываем настройки
    if (agentTeams.length > 0) {
      setSelectedAgentForSettings(agentTeams[0]);
      setSelectedStageIndex(stageIndex);
      // Загружаем промпт для выбранного этапа
      loadPromptForStage(stageIndex);
    }
  };

  // Модифицированный обработчик возврата назад
  const handleBackFromSettings = () => {
    setSelectedAgentForSettings(null);
    setSelectedStageIndex(null);
  };

  // Обработчик выбора этапа
  const handleStageSelect = (stageIndex: number | null, stage?: any) => {
    if (stageIndex !== null && stage) {
      setStageSettingsModal({
        isOpen: true,
        stage: stage,
        stageIndex: stageIndex
      });
    }
  };

  // Обработчик закрытия модального окна настройки этапа
  const handleCloseStageSettings = () => {
    setStageSettingsModal({
      isOpen: false,
      stage: null,
      stageIndex: -1
    });
  };

  // Обработчики редактирования названий этапов
  const handleStartEditing = (stageIndex: number, currentName: string) => {
    setEditingStageIndex(stageIndex);
    setEditingStageValue(currentName);
  };

  const handleSaveStageEdit = async () => {
    if (editingStageIndex === null || !editingStageValue.trim()) return;

    try {
      // Здесь будет API вызов для сохранения нового названия этапа
      // TODO: Реализовать API вызов
      console.log(
        'Saving stage name:',
        editingStageValue,
        'for stage index:',
        editingStageIndex
      );

      // Обновляем локальное состояние
      setFunnelStages((prev) =>
        prev.map((stage, index) =>
          index === editingStageIndex
            ? { ...stage, name: editingStageValue.trim() }
            : stage
        )
      );

      // Сбрасываем состояние редактирования
      setEditingStageIndex(null);
      setEditingStageValue('');
    } catch (error) {
      console.error('Error saving stage name:', error);
    }
  };

  const handleCancelStageEdit = () => {
    setEditingStageIndex(null);
    setEditingStageValue('');
  };

  const handleStageInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      handleSaveStageEdit();
    } else if (e.key === 'Escape') {
      handleCancelStageEdit();
    }
  };

  // Загрузка данных при изменении воронки
  useEffect(() => {
    // Если выбраны "Все воронки", не загружаем данные
    if (currentFunnel?.id === '0') {
      return;
    }
    fetchFunnelStages();
  }, [fetchFunnelStages, currentFunnel?.id]);

  // Загрузка промпта при изменении выбранного этапа
  useEffect(() => {
    if (
      selectedStageIndex !== null &&
      selectedAgentForSettings &&
      funnelStages.length > 0
    ) {
      loadPromptForStage(selectedStageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStageIndex, funnelStages, selectedAgentForSettings]);

  // Загрузка интеграций и агентов
  useEffect(() => {
    if (backendOrgId) {
      fetchIntegrations();
      loadAgentTeams();
    }
  }, [backendOrgId, fetchIntegrations, loadAgentTeams]);

  // Настройка сенсоров для Drag and Drop
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // Обработчики Drag and Drop
  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const connection = integrations.find((int) => int.id === active.id);
    if (connection) {
      setActiveConnection(connection);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveConnection(null);
    // Здесь можно добавить логику для обработки перемещения
    console.log('Drag ended:', event);
  }

  function onDragOver(event: DragOverEvent) {
    // Здесь можно добавить логику для обработки наведения
    console.log('Drag over:', event);
  }

  // Мемоизированные данные колонок
  const connectionIds = useMemo(
    () => integrations.map((int) => int.id),
    [integrations]
  );

  if (!organization) {
    return <div>Загрузка...</div>;
  }

  // Показываем заглушку для "Все воронки"
  if (currentFunnel?.id === '0') {
    return (
      <PageContainer>
        <AllFunnelsPlaceholder />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <ScrollArea className='w-full'>
            <div className='flex flex-col gap-6 pb-4 md:flex-row'>
              {/* Колонка 1: Доступные источники или Настройки агента */}
              <KanbanColumn
                title={selectedAgentForSettings ? '' : 'Доступные источники'}
                headerContent={
                  selectedAgentForSettings ? (
                    <div className='flex items-center gap-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleBackFromSettings}
                      >
                        Назад
                      </Button>
                      <h3 className='text-sm font-semibold tracking-wide text-gray-700 uppercase'>
                        Настройки агента
                      </h3>
                    </div>
                  ) : undefined
                }
              >
                {selectedAgentForSettings ? (
                  <AgentGeneralSettings
                    generalSettings={generalSettings}
                    onSettingChange={handleGeneralSettingChange}
                    onSave={handleSaveGeneralSettings}
                    backendOrgId={backendOrgId}
                    funnelId={currentFunnel?.id}
                  />
                ) : (
                  <SortableContext items={connectionIds}>
                    {integrationsLoading ? (
                      // Показываем 5 скелетонов по умолчанию
                      Array.from({ length: 5 }).map((_, index) => (
                        <ConnectionSkeleton
                          key={`connection-skeleton-${index}`}
                        />
                      ))
                    ) : integrations.length === 0 ? (
                      <div className='text-sm text-gray-500'>
                        Нет подключений
                      </div>
                    ) : (
                      integrations.map((integration) => (
                        <ConnectionCard
                          key={integration.id}
                          connection={integration}
                        />
                      ))
                    )}
                  </SortableContext>
                )}
              </KanbanColumn>

              {/* Объединенный блок: Агенты воронки + Этапы */}
              <div
                className='rounded-lg border bg-gray-50'
                style={{ minHeight: '600px', minWidth: '800px' }}
              >
                <div className='rounded-t-lg border-b bg-white p-0'>
                  <div className='flex gap-0'>
                    {/* Заголовок Агенты воронки - скрывается в режиме настройки */}
                    {!selectedAgentForSettings && (
                      <>
                        <div className='align-center flex w-85 flex-shrink-0 p-4'>
                          <h3 className='text-sm font-semibold tracking-wide text-gray-700 uppercase'>
                            Агенты воронки
                          </h3>
                        </div>

                        {/* Вертикальный разделитель */}
                        <div className='mx-0 w-px self-stretch bg-gray-200'></div>
                      </>
                    )}

                    {/* Заголовки этапов */}
                    <div
                      className={`min-w-0 flex-1 ${selectedAgentForSettings ? 'pl-4' : 'pl-0'}`}
                    >
                      <div className='flex overflow-x-auto'>
                        {(() => {
                          if (funnelsLoading || assistantsLoading) {
                            // Показываем скелетоны заголовков для 3 этапов
                            return Array.from({ length: 3 }).map((_, index) => (
                              <div
                                key={`header-skeleton-${index}`}
                                className='flex items-center'
                              >
                                <div
                                  className='flex-shrink-0 px-4 py-4'
                                  style={{ width: '256px' }}
                                >
                                  <Skeleton className='h-4 w-24' />
                                </div>
                                {index < 2 && (
                                  <div className='mx-0 w-px self-stretch bg-gray-200'></div>
                                )}
                              </div>
                            ));
                          }

                          if (!currentFunnel || funnelStages.length === 0) {
                            return (
                              <div className='group flex-shrink-0 rounded px-4 py-2 transition-colors hover:bg-gray-100'>
                                <div className='flex items-center justify-between'>
                                  <h3 className='text-sm font-semibold tracking-wide text-gray-700 uppercase'>
                                    Этапы воронки
                                  </h3>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100'
                                  >
                                    <IconSettings className='h-3 w-3 text-gray-500' />
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          return funnelStages.map((stage, index) => {
                            const isActiveStage = selectedStageIndex === index;
                            const isEditing = editingStageIndex === index;
                            return (
                              <div key={index} className='flex items-center'>
                                <div
                                  className={`group flex-shrink-0 rounded px-4 py-4 transition-colors ${
                                    isEditing
                                      ? 'cursor-default'
                                      : 'cursor-pointer'
                                  } ${
                                    isActiveStage
                                      ? 'border border-blue-200 bg-blue-100'
                                      : 'hover:bg-gray-100'
                                  }`}
                                  style={{
                                    minWidth: '200px',
                                    width: '100%',
                                    maxWidth: '256px'
                                  }}
                                  onClick={() =>
                                    !isEditing && handleStageHeaderClick(index)
                                  }
                                >
                                  <div className='flex items-center justify-between'>
                                    {isEditing ? (
                                      <input
                                        type='text'
                                        value={editingStageValue}
                                        onChange={(e) =>
                                          setEditingStageValue(e.target.value)
                                        }
                                        onKeyDown={handleStageInputKeyDown}
                                        className={`border-none bg-transparent text-sm font-semibold tracking-wide uppercase outline-none ${
                                          isActiveStage
                                            ? 'text-blue-700'
                                            : 'text-gray-700'
                                        }`}
                                        style={{ width: '160px' }}
                                        autoFocus
                                      />
                                    ) : (
                                      <h3
                                        className={`text-sm font-semibold tracking-wide uppercase ${
                                          isActiveStage
                                            ? 'text-blue-700'
                                            : 'text-gray-700'
                                        }`}
                                      >
                                        {stage.assistant?.name || stage.name}
                                      </h3>
                                    )}

                                    {/* Кнопки редактирования */}
                                    <div className='flex items-center gap-1'>
                                      {isEditing ? (
                                        <>
                                          {/* Кнопка сохранить */}
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            className='h-5 w-5 p-0 transition-colors hover:bg-green-100'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSaveStageEdit();
                                            }}
                                          >
                                            <IconCheck className='h-3 w-3 text-green-600' />
                                          </Button>
                                          {/* Кнопка отменить */}
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            className='h-5 w-5 p-0 transition-colors hover:bg-red-100'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCancelStageEdit();
                                            }}
                                          >
                                            <IconX className='h-3 w-3 text-red-600' />
                                          </Button>
                                        </>
                                      ) : (
                                        /* Кнопка редактировать */
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          className='h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditing(
                                              index,
                                              stage.assistant?.name ||
                                                stage.name
                                            );
                                          }}
                                        >
                                          <IconSettings className='h-3 w-3 text-gray-500' />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* Разделитель между заголовками этапов */}
                                {index < funnelStages.length - 1 && (
                                  <div className='mx-0 w-px self-stretch bg-gray-200'></div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-4'>
                  <ScrollArea className='h-[480px]'>
                    <div className='flex flex-col gap-4 md:flex-row'>
                      {/* Левая секция: Агенты воронки - скрывается в режиме настройки */}
                      {!selectedAgentForSettings && (
                        <div className='w-full flex-shrink-0 md:w-80'>
                          <div className='space-y-3'>
                            {/* Добавляем состояние загрузки для агентов */}
                            {!backendOrgId
                              ? // Показываем 2 скелетона агентов по умолчанию
                                Array.from({ length: 2 }).map((_, index) => (
                                  <AgentSkeleton
                                    key={`agent-skeleton-${index}`}
                                  />
                                ))
                              : agentTeams.map((agent) => (
                                  <Card
                                    key={agent.id}
                                    className={`border shadow-sm ${
                                      agent.enabled
                                        ? 'bg-white'
                                        : 'bg-gray-100 opacity-60'
                                    }`}
                                  >
                                    <CardContent>
                                      <div className='grid grid-cols-3 gap-0'>
                                        {/* Колонка 1: Название и переключатель */}
                                        <div className='space-y-2'>
                                          <div
                                            className={`text-sm font-semibold ${
                                              agent.enabled
                                                ? 'text-gray-900'
                                                : 'text-gray-500'
                                            }`}
                                          >
                                            {agent.name}
                                          </div>
                                          <Switch
                                            checked={agent.enabled}
                                            className='data-[state=checked]:bg-blue-600'
                                          />
                                        </div>

                                        {/* Разделитель */}
                                        <div className='relative flex items-center justify-center'>
                                          <div className='absolute top-0 right-27 bottom-0 w-px bg-gray-200'></div>
                                          <div className='flex flex-col items-center gap-2'>
                                            <Badge
                                              variant='secondary'
                                              className={`text-xs ${
                                                agent.enabled
                                                  ? ''
                                                  : 'bg-gray-200 text-gray-500 opacity-50'
                                              }`}
                                            >
                                              {agent.type === 'Мультиагент'
                                                ? 'Мультигент'
                                                : 'Одиночный'}
                                            </Badge>
                                            <Button
                                              variant='outline'
                                              size='sm'
                                              className={`h-7 px-3 text-xs ${
                                                agent.enabled
                                                  ? ''
                                                  : 'border-gray-300 bg-gray-100 text-gray-400 opacity-50'
                                              }`}
                                              onClick={() => {
                                                setSelectedAgentForSettings(
                                                  agent
                                                );
                                                // Если этап не выбран, выбираем первый этап
                                                if (
                                                  selectedStageIndex === null &&
                                                  funnelStages.length > 0
                                                ) {
                                                  setSelectedStageIndex(0);
                                                  loadPromptForStage(0);
                                                }
                                              }}
                                            >
                                              Настройки
                                            </Button>
                                          </div>
                                          <div className='absolute top-0 bottom-0 left-27 w-px bg-gray-200'></div>
                                        </div>

                                        {/* Колонка 3: CV агента и процент */}
                                        <div className='space-y-2'>
                                          <div
                                            className={`text-right text-xs ${
                                              agent.enabled
                                                ? 'text-gray-600'
                                                : 'text-gray-400'
                                            }`}
                                          >
                                            CV Агента
                                          </div>
                                          <div className='text-right'>
                                            <div
                                              className={`text-xl font-bold ${
                                                agent.enabled
                                                  ? 'text-gray-900'
                                                  : 'text-gray-500'
                                              }`}
                                            >
                                              {agent.cv}%
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                          </div>
                        </div>
                      )}

                      {/* Правая секция: Этапы воронки */}
                      <div
                        className={`min-w-0 flex-1 ${selectedAgentForSettings ? 'pl-0' : 'pl-0'}`}
                      >
                        {selectedAgentForSettings ? (
                          // Показываем две колонки настроек для выбранного агента с ограниченной шириной
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='col-span-2'>
                              <PromptTestingComponent
                                instructions={instructions}
                                activeSettingsTab={activeSettingsTab}
                                onTabChange={handleTabChange}
                                onInstructionsChange={handleInstructionsChange}
                                onSubmitInstructions={handleSubmitInstructions}
                                onReloadPrompt={handleReloadPrompt}
                                saving={saving}
                                successMessage={successMessage}
                                error={error}
                                stageName={
                                  selectedStageIndex !== null &&
                                  funnelStages[selectedStageIndex]
                                    ? funnelStages[selectedStageIndex].assistant
                                        ?.name ||
                                      funnelStages[selectedStageIndex].name
                                    : 'Этап не выбран'
                                }
                                currentFunnel={currentFunnel}
                                backendOrgId={backendOrgId}
                              />
                            </div>
                            <div className='col-span-1'>
                              <AISettingsComponent
                                aiSettings={aiSettings}
                                onAISettingChange={handleAISettingChange}
                                onFollowUpChange={handleFollowUpChange}
                                onSave={handleSaveAISettings}
                                hasChanges={hasChanges}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className='flex gap-4 overflow-x-auto'>
                            {(() => {
                              if (funnelsLoading || assistantsLoading) {
                                // Показываем 3 этапа с 2 скелетонами агентов в каждом
                                return Array.from({ length: 3 }).map(
                                  (_, stageIndex) => (
                                    <div
                                      key={`stage-skeleton-${stageIndex}`}
                                      className='flex-shrink-0'
                                      style={{
                                        minWidth: '200px',
                                        width: '100%',
                                        maxWidth: '240px'
                                      }}
                                    >
                                      <div className='space-y-2'>
                                        {Array.from({ length: 2 }).map(
                                          (_, agentIndex) => (
                                            <StageSkeleton
                                              key={`stage-${stageIndex}-agent-${agentIndex}`}
                                            />
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )
                                );
                              }

                              if (!currentFunnel) {
                                return (
                                  <div className='rounded-lg border bg-yellow-50 p-4 text-sm text-gray-500'>
                                    <div className='mb-2'>
                                      Воронка не выбрана
                                    </div>
                                    <div className='text-xs'>
                                      Доступных воронок: {funnels?.length || 0}
                                      {funnels?.length > 0 && (
                                        <div className='mt-1'>
                                          Доступные:{' '}
                                          {funnels
                                            .map(
                                              (f) => f.display_name || f.name
                                            )
                                            .join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              if (funnelStages.length === 0) {
                                return (
                                  <div className='rounded-lg border bg-blue-50 p-4 text-sm text-gray-500'>
                                    <div className='mb-2'>
                                      Нет этапов в воронке &quot;
                                      {currentFunnel.display_name ||
                                        currentFunnel.name}
                                      &quot;
                                    </div>
                                    <div className='text-xs'>
                                      Настройте этапы воронки в разделе
                                      AI-ассистенты
                                    </div>
                                  </div>
                                );
                              }

                              return funnelStages.map((stage, index) => (
                                <div
                                  key={index}
                                  className='flex-shrink-0'
                                  style={{
                                    minWidth: '200px',
                                    width: '100%',
                                    maxWidth: '240px'
                                  }}
                                >
                                  <div className='space-y-2'>
                                    {!backendOrgId
                                      ? // Показываем скелетоны этапов если нет ID организации
                                        Array.from({ length: 2 }).map(
                                          (_, agentIndex) => (
                                            <StageSkeleton
                                              key={`stage-${index}-agent-skeleton-${agentIndex}`}
                                            />
                                          )
                                        )
                                      : agentTeams.map((agent, agentIndex) => {
                                          // Моковые данные для демонстрации (стабильные на основе индексов)
                                          const problems =
                                            ((index + agentIndex) % 8) + 1;
                                          const stageCV =
                                            85 + ((index + agentIndex) % 15);
                                          const cvPercent =
                                            8 + ((index + agentIndex) % 25);

                                          return (
                                            <Card
                                              key={`${stage.assistant?.name || stage.name}-${agent.id}`}
                                              className={`mb-4 border shadow-sm ${
                                                agent.enabled
                                                  ? 'cursor-pointer bg-white'
                                                  : 'cursor-not-allowed bg-gray-100 opacity-60'
                                              }`}
                                              onClick={() =>
                                                agent.enabled &&
                                                handleStageSelect(index, stage)
                                              }
                                            >
                                              <CardContent className='py-0.5'>
                                                <div className='grid grid-cols-2 gap-0'>
                                                  {/* Колонка 1: Проблем */}
                                                  <div>
                                                    <div
                                                      className={`mb-2 text-xs ${
                                                        agent.enabled
                                                          ? 'text-gray-600'
                                                          : 'text-gray-400'
                                                      }`}
                                                    >
                                                      Проблем
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                      <div
                                                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                                          agent.enabled
                                                            ? 'bg-red-100'
                                                            : 'bg-gray-200'
                                                        }`}
                                                      >
                                                        <IconAlertCircle
                                                          className={`h-3 w-3 ${
                                                            agent.enabled
                                                              ? 'text-red-600'
                                                              : 'text-gray-400'
                                                          }`}
                                                        />
                                                      </div>
                                                      <span
                                                        className={`text-lg font-bold ${
                                                          agent.enabled
                                                            ? 'text-gray-900'
                                                            : 'text-gray-500'
                                                        }`}
                                                      >
                                                        {problems}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {/* Разделитель */}
                                                  <div className='relative'>
                                                    <div
                                                      className={`absolute top-0 bottom-0 left-0 w-px ${
                                                        agent.enabled
                                                          ? 'bg-gray-200'
                                                          : 'bg-gray-300 opacity-50'
                                                      }`}
                                                    ></div>

                                                    {/* Колонка 2: CV Этапа */}
                                                    <div className='pl-10'>
                                                      <div
                                                        className={`mb-2 text-right text-xs ${
                                                          agent.enabled
                                                            ? 'text-gray-600'
                                                            : 'text-gray-400'
                                                        }`}
                                                      >
                                                        CV Этапа
                                                      </div>
                                                      <div className='flex items-center justify-end gap-2'>
                                                        <span
                                                          className={`text-lg font-bold ${
                                                            agent.enabled
                                                              ? 'text-gray-900'
                                                              : 'text-gray-500'
                                                          }`}
                                                        >
                                                          {stageCV}
                                                        </span>
                                                        <Badge
                                                          className={`border-0 text-xs ${
                                                            agent.enabled
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : 'bg-gray-200 text-gray-500 opacity-50'
                                                          }`}
                                                        >
                                                          {cvPercent}%
                                                        </Badge>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          );
                                        })}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeConnection && (
              <ConnectionCard connection={activeConnection} isOverlay />
            )}
          </DragOverlay>
        </DndContext>

        {/* Модальное окно настройки этапа */}
        <Dialog
          open={stageSettingsModal.isOpen}
          onOpenChange={handleCloseStageSettings}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                Настройка этапа: {stageSettingsModal.stage?.name}
              </DialogTitle>
            </DialogHeader>

            {stageSettingsModal.stage && (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Название этапа
                    </label>
                    <div className='text-sm text-gray-700'>
                      {stageSettingsModal.stage.assistant?.name ||
                        stageSettingsModal.stage.name}
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Назначенный агент
                    </label>
                    <div className='text-sm text-gray-700'>
                      {stageSettingsModal.stage.assistant_code_name ||
                        'Не назначен'}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Сделки
                    </label>
                    <div className='text-lg font-semibold'>
                      {stageSettingsModal.stage.deals_count || 0}
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Сумма
                    </label>
                    <div className='text-lg font-semibold'>
                      {stageSettingsModal.stage.deals_amount
                        ? `₽${stageSettingsModal.stage.deals_amount.toLocaleString()}`
                        : '₽0'}
                    </div>
                  </div>
                  <div>
                    <label className='mb-1 block text-sm font-medium'>
                      Follow-up
                    </label>
                    <div className='text-lg font-semibold'>
                      {stageSettingsModal.stage.followups?.length || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium'>
                    Промпт этапа
                  </label>
                  <Textarea
                    value={stageSettingsModal.stage.prompt || ''}
                    readOnly
                    className='min-h-[120px] resize-none'
                    placeholder='Промпт не настроен'
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant='outline' onClick={handleCloseStageSettings}>
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (stageSettingsModal.stage) {
                    window.location.href = `/dashboard/management/ai-assistants?stage=${encodeURIComponent(stageSettingsModal.stage.assistant?.name || stageSettingsModal.stage.name)}`;
                  }
                }}
              >
                Редактировать промпт
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

export default function ManagementPage() {
  return <ManagementPageContent />;
}
