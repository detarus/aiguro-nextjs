'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/contexts/FunnelsContext';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';

// Импорт компонентов
import { GeneralSettingsComponent } from './components/GeneralSettings';
import { StageConfiguration } from './components/StageConfiguration';
import { AISettingsComponent } from './components/AISettings';
import { LoadingProgress } from './components/LoadingProgress';
import { SkeletonLoader } from './components/SkeletonLoader';

// Интерфейсы
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

interface StageSettings {
  id: number;
  name: string;
  prompt: string;
  isActive: boolean;
  aiSettings: AISettings;
}

interface GeneralSettings {
  cookieSettings: {
    strictlyNecessary1: boolean;
    functionalCookies1: boolean;
    strictlyNecessary2: boolean;
    functionalCookies2: boolean;
    strictlyNecessary3: boolean;
    functionalCookies3: boolean;
    functionalCookies4: boolean;
    contextMemory: boolean;
    dataCollection: boolean;
    stopAgentAfterManager: boolean;
    agentKnowledgeBase: boolean;
    voiceRequests: boolean;
  };
}

export default function AIAssistantsPage() {
  const { organization } = useOrganization();
  const backendOrgId = organization?.publicMetadata?.id_backend as string;
  const { currentFunnel } = useFunnels();
  const router = useRouter();

  // Состояния
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    cookieSettings: {
      strictlyNecessary1: true,
      functionalCookies1: false,
      strictlyNecessary2: true,
      functionalCookies2: false,
      strictlyNecessary3: true,
      functionalCookies3: false,
      functionalCookies4: false,
      contextMemory: true,
      dataCollection: false,
      stopAgentAfterManager: true,
      agentKnowledgeBase: true,
      voiceRequests: false
    }
  });

  const [stages, setStages] = useState<StageSettings[]>([
    {
      id: 1,
      name: 'Этап 1',
      prompt: '',
      isActive: true,
      aiSettings: {
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
      }
    }
  ]);

  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'setup' | 'test'>(
    'setup'
  );
  const [instructions, setInstructions] = useState('Fix the grammar.');

  // Состояния для загрузки
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Состояние для отслеживания первой загрузки
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Состояния для прогресс-бара
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLoadingStep, setCurrentLoadingStep] = useState('');
  const [hasLocalData, setHasLocalData] = useState(false);

  // Состояние для промптов этапов
  const [stagePrompts, setStagePrompts] = useState<Record<string, string>>({});

  // Состояние для данных воронки
  const [currentFunnelData, setCurrentFunnelData] = useState<any>(null);

  // Состояние для отслеживания изменений
  const [hasChanges, setHasChanges] = useState(false);
  const [hasAISettingsChanges, setHasAISettingsChanges] = useState(false);

  // Функция для создания этапов на основе данных воронки
  const createStagesFromFunnelData = useCallback((funnelData: any) => {
    if (!funnelData?.stages) {
      return [
        {
          id: 1,
          name: 'Этап 1',
          prompt: '',
          isActive: true,
          aiSettings: {
            mode: 'edit' as const,
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
          }
        }
      ];
    }

    return funnelData.stages.map((stage: any, index: number) => ({
      id: index + 1,
      name: stage.name || `Этап ${index + 1}`,
      prompt: '',
      isActive: index === 0,
      aiSettings: {
        mode: 'edit' as const,
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
      }
    }));
  }, []);

  // Функция обновления промпта этапа
  const updateStagePrompt = async (stageId: number, prompt: string) => {
    if (!backendOrgId || !currentFunnel?.id || !currentFunnelData?.stages) {
      setError('Отсутствуют необходимые данные для сохранения');
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      const stage = currentFunnelData.stages[stageId - 1];
      if (!stage?.assistant_code_name) {
        setError('Не найден код ассистента для этого этапа');
        return false;
      }

      const token = await getClerkTokenFromClientCookie();

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/assistant`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code_name: stage.assistant_code_name,
            text: prompt
          })
        }
      );

      if (response.ok) {
        console.log('Промпт успешно сохранен через API');
        return true;
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        setError(
          `Ошибка сервера: ${errorData.message || 'Неизвестная ошибка'}`
        );
        return false;
      }
    } catch (error) {
      console.error('Error updating stage prompt:', error);
      setError('Ошибка при сохранении промпта');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Сохранение AI настроек в localStorage
  const saveAISettingsToLocalStorage = useCallback(() => {
    if (!backendOrgId || !currentFunnel?.id) return;

    try {
      const aiSettingsKey = `ai_settings_${backendOrgId}_${currentFunnel.id}`;
      const aiSettingsToSave: Record<string, AISettings> = {};

      stages.forEach((stage) => {
        aiSettingsToSave[`stage_${stage.id}`] = stage.aiSettings;
      });

      localStorage.setItem(aiSettingsKey, JSON.stringify(aiSettingsToSave));
    } catch (error) {
      console.error('Error saving AI settings to localStorage:', error);
    }
  }, [stages, backendOrgId, currentFunnel?.id]);

  // Эффект для автосохранения AI настроек (убираем автосохранение, чтобы избежать циклов)
  // useEffect(() => {
  //   if (!isFirstLoad) {
  //     saveAISettingsToLocalStorage();
  //   }
  // }, [stages, saveAISettingsToLocalStorage, isFirstLoad]);

  // Эффект для загрузки данных при монтировании
  useEffect(() => {
    if (!backendOrgId || !currentFunnel?.id || !isFirstLoad) return;

    // Проверяем наличие локальных данных
    const checkLocalData = () => {
      try {
        const promptsKey = `ai-assistants-prompts-${backendOrgId}-${currentFunnel.id}`;
        const aiSettingsKey = `ai_settings_${backendOrgId}_${currentFunnel.id}`;

        const hasPrompts = localStorage.getItem(promptsKey);
        const hasAISettings = localStorage.getItem(aiSettingsKey);

        return !!(hasPrompts && hasAISettings);
      } catch {
        return false;
      }
    };

    const hasLocal = checkLocalData();
    setHasLocalData(hasLocal);

    // Загрузка данных воронки
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!hasLocal) {
          setLoadingProgress(10);
          setCurrentLoadingStep('Подключение к серверу...');
        }

        const token = await getClerkTokenFromClientCookie();

        if (!hasLocal) {
          setLoadingProgress(20);
          setCurrentLoadingStep('Загрузка данных воронки...');
        }

        const response = await fetch(
          `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCurrentFunnelData(data);

          if (!hasLocal) {
            setLoadingProgress(40);
            setCurrentLoadingStep('Создание этапов...');
          }

          // Создаем этапы на основе данных воронки
          const newStages = createStagesFromFunnelData(data);
          setStages(newStages);

          // Загружаем промпты для каждого этапа
          if (data.stages) {
            if (!hasLocal) {
              setLoadingProgress(50);
              setCurrentLoadingStep('Загрузка промптов ассистентов...');
            }

            const prompts: Record<string, string> = {};
            const totalStages = data.stages.length;

            for (let i = 0; i < data.stages.length; i++) {
              const stage = data.stages[i];
              if (stage.assistant_code_name) {
                if (!hasLocal) {
                  setLoadingProgress(50 + (i / totalStages) * 30);
                  setCurrentLoadingStep(
                    `Загрузка промпта для ${stage.name || `этапа ${i + 1}`}...`
                  );
                }

                try {
                  const assistantResponse = await fetch(
                    `/api/organization/${backendOrgId}/funnel/${currentFunnel.id}/assistant/${stage.assistant_code_name}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }
                  );

                  if (assistantResponse.ok) {
                    const assistantData = await assistantResponse.json();
                    prompts[`stage_${i + 1}`] = assistantData.text || '';
                  }
                } catch (error) {
                  console.error(
                    `Error loading assistant for stage ${i + 1}:`,
                    error
                  );
                }
              }
            }

            setStagePrompts(prompts);
          }
        }
      } catch (error) {
        console.error('Error fetching funnel data:', error);
        setError('Ошибка загрузки данных воронки');
      } finally {
        if (!hasLocal) {
          setLoadingProgress(100);
          setCurrentLoadingStep('Завершение загрузки...');
          setTimeout(() => {
            setLoading(false);
          }, 500);
        } else {
          setLoading(false);
        }
      }
    };

    // Загрузка из localStorage
    const loadLocal = () => {
      try {
        if (!hasLocal) {
          setLoadingProgress(80);
          setCurrentLoadingStep('Загрузка локальных настроек...');
        }

        const generalKey = `ai_general_settings_${backendOrgId}`;
        const savedGeneral = localStorage.getItem(generalKey);
        if (savedGeneral) {
          const parsed = JSON.parse(savedGeneral);
          // Мерджим с дефолтными значениями, чтобы новые поля были включены
          setGeneralSettings((prev) => ({
            cookieSettings: {
              ...prev.cookieSettings,
              ...parsed.cookieSettings
            }
          }));
        }

        // Загружаем промпты
        const promptsKey = `ai-assistants-prompts-${backendOrgId}-${currentFunnel.id}`;
        const savedPromptsData = localStorage.getItem(promptsKey);
        if (savedPromptsData) {
          const parsed = JSON.parse(savedPromptsData);
          setStagePrompts(parsed.prompts || {});
        }

        // Загружаем AI настройки с задержкой
        setTimeout(
          () => {
            if (!hasLocal) {
              setLoadingProgress(90);
              setCurrentLoadingStep('Применение настроек...');
            }

            const aiSettingsKey = `ai_settings_${backendOrgId}_${currentFunnel.id}`;
            const savedAISettings = localStorage.getItem(aiSettingsKey);
            if (savedAISettings) {
              const parsedAISettings = JSON.parse(savedAISettings);
              setStages((prevStages) => {
                return prevStages.map((stage) => {
                  const savedSettings = parsedAISettings[`stage_${stage.id}`];
                  if (savedSettings) {
                    return {
                      ...stage,
                      aiSettings: savedSettings
                    };
                  }
                  return stage;
                });
              });
            }
          },
          hasLocal ? 0 : 100
        );
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    fetchData();
    loadLocal();
    setIsFirstLoad(false);

    // Сброс состояний прогресса после завершения
    setTimeout(() => {
      setLoadingProgress(0);
      setCurrentLoadingStep('');
    }, 1000);
  }, [
    backendOrgId,
    currentFunnel?.id,
    isFirstLoad,
    createStagesFromFunnelData
  ]);

  // Эффект для синхронизации инструкций при смене этапа
  useEffect(() => {
    const stageKey = `stage_${activeStageId}`;
    const savedPrompt = stagePrompts[stageKey];
    if (savedPrompt !== undefined) {
      setInstructions(savedPrompt);
    }
  }, [activeStageId, stagePrompts]);

  // Обработчики
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
    if (!backendOrgId) return;
    try {
      const generalKey = `ai_general_settings_${backendOrgId}`;
      localStorage.setItem(generalKey, JSON.stringify(generalSettings));
      console.log('General settings saved to localStorage');
      setSuccessMessage('Общие настройки сохранены!');

      // Убираем сообщение через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving general settings:', error);
    }
  };

  const handleStageChange = (stageId: number) => {
    setActiveStageId(stageId);
  };

  const handleTabChange = (tab: 'setup' | 'test') => {
    setActiveSettingsTab(tab);
  };

  const handleInstructionsChange = (value: string) => {
    setInstructions(value);
    setHasChanges(true);
  };

  const handleSubmitInstructions = async () => {
    const stageKey = `stage_${activeStageId}`;

    // Очищаем предыдущие сообщения
    setError(null);
    setSuccessMessage(null);

    // Сохраняем промпт в localStorage сразу
    setStagePrompts((prev) => {
      const updatedPrompts = { ...prev, [stageKey]: instructions };
      // Сохраняем в localStorage напрямую
      try {
        const key = `ai-assistants-prompts-${backendOrgId}-${currentFunnel?.id}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            prompts: updatedPrompts,
            timestamp: Date.now()
          })
        );
      } catch (error) {
        console.error('Error saving prompts to localStorage:', error);
      }
      return updatedPrompts;
    });

    // Сохраняем через API
    const success = await updateStagePrompt(activeStageId, instructions);
    if (success) {
      // Показываем сообщение об успехе
      setSuccessMessage('Промпт успешно сохранен!');

      // Убираем сообщение через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      console.log('Промпт успешно сохранен:', { stageKey, instructions });
    } else {
      // Если сохранение через API не удалось, откатываем localStorage
      setStagePrompts((prev) => {
        // Сохраняем в localStorage напрямую
        try {
          const key = `ai-assistants-prompts-${backendOrgId}-${currentFunnel?.id}`;
          localStorage.setItem(
            key,
            JSON.stringify({
              prompts: prev,
              timestamp: Date.now()
            })
          );
        } catch (error) {
          console.error('Error saving prompts to localStorage:', error);
        }
        return prev;
      });
      console.error('Не удалось сохранить промпт через API');
    }
  };

  // Handle reload prompt button click - restore original prompt for current stage
  const handleReloadPrompt = () => {
    const stageKey = `stage_${activeStageId}`;

    // Find current stage to get original prompt
    let originalPrompt = '';

    // Check if we have the prompt in local storage first
    if (stagePrompts && stagePrompts[stageKey]) {
      originalPrompt = stagePrompts[stageKey];
    } else if (activeStage) {
      // Fallback to the stage prompt from state
      originalPrompt = activeStage.prompt;
    }

    // If we found an original prompt, restore it to the instructions state
    if (originalPrompt) {
      setInstructions(originalPrompt);
    }
  };

  const handleAISettingChange = (field: keyof AISettings, value: any) => {
    setStages((prev) => {
      const newStages = prev.map((stage) =>
        stage.id === activeStageId
          ? { ...stage, aiSettings: { ...stage.aiSettings, [field]: value } }
          : stage
      );

      // Автосохранение в localStorage
      if (backendOrgId && currentFunnel?.id) {
        try {
          const aiSettingsKey = `ai_settings_${backendOrgId}_${currentFunnel.id}`;
          const aiSettingsToSave: Record<string, AISettings> = {};

          newStages.forEach((stage) => {
            aiSettingsToSave[`stage_${stage.id}`] = stage.aiSettings;
          });

          localStorage.setItem(aiSettingsKey, JSON.stringify(aiSettingsToSave));
        } catch (error) {
          console.error('Error saving AI settings to localStorage:', error);
        }
      }

      return newStages;
    });

    setHasAISettingsChanges(true);
    setHasChanges(true);
  };

  const handleFollowUpChange = (field: string, value: any) => {
    setStages((prev) => {
      const newStages = prev.map((stage) =>
        stage.id === activeStageId
          ? {
              ...stage,
              aiSettings: {
                ...stage.aiSettings,
                followUp: { ...stage.aiSettings.followUp, [field]: value }
              }
            }
          : stage
      );

      // Автосохранение в localStorage
      if (backendOrgId && currentFunnel?.id) {
        try {
          const aiSettingsKey = `ai_settings_${backendOrgId}_${currentFunnel.id}`;
          const aiSettingsToSave: Record<string, AISettings> = {};

          newStages.forEach((stage) => {
            aiSettingsToSave[`stage_${stage.id}`] = stage.aiSettings;
          });

          localStorage.setItem(aiSettingsKey, JSON.stringify(aiSettingsToSave));
        } catch (error) {
          console.error('Error saving AI settings to localStorage:', error);
        }
      }

      return newStages;
    });

    setHasAISettingsChanges(true);
    setHasChanges(true);
  };

  const handleSaveAISettings = () => {
    saveAISettingsToLocalStorage();
    setSuccessMessage('AI настройки сохранены!');
    setHasAISettingsChanges(false);

    // Убираем сообщение через 3 секунды
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    console.log('AI settings saved to localStorage');
  };

  const handleFinishSetup = () => {
    // Сохраняем все изменения
    if (hasAISettingsChanges) {
      saveAISettingsToLocalStorage();
    }

    // Сохраняем текущий промпт, если есть изменения
    const stageKey = `stage_${activeStageId}`;
    const currentPrompt = stagePrompts[stageKey];
    if (currentPrompt !== instructions) {
      setStagePrompts((prev) => {
        const updatedPrompts = { ...prev, [stageKey]: instructions };
        try {
          const key = `ai-assistants-prompts-${backendOrgId}-${currentFunnel?.id}`;
          localStorage.setItem(
            key,
            JSON.stringify({
              prompts: updatedPrompts,
              timestamp: Date.now()
            })
          );
        } catch (error) {
          console.error('Error saving prompts to localStorage:', error);
        }
        return updatedPrompts;
      });
    }

    // Сохраняем общие настройки
    try {
      const generalKey = `ai_general_settings_${backendOrgId}`;
      localStorage.setItem(generalKey, JSON.stringify(generalSettings));
    } catch (error) {
      console.error('Error saving general settings:', error);
    }

    // Сбрасываем флаги изменений
    setHasChanges(false);
    setHasAISettingsChanges(false);

    // Показываем сообщение об успехе
    setSuccessMessage('Все настройки успешно сохранены!');

    // Переходим на экран управления
    setTimeout(() => {
      router.push('/dashboard/management');
    }, 1500);
  };

  const activeStage = stages.find((stage) => stage.id === activeStageId);

  // Отладка для проверки передаваемых значений
  console.log('AIAssistantsPage Debug:', {
    backendOrgId,
    currentFunnelId: currentFunnel?.id,
    currentFunnelName: currentFunnel?.name,
    hasCurrentFunnel: !!currentFunnel
  });

  // Обработчик возврата назад
  const handleBack = () => {
    router.push('/dashboard/management');
  };

  // Показываем прогресс-бар только при первой загрузке без локальных данных
  if (loading && isFirstLoad && !hasLocalData) {
    const loadingSteps = [
      'Подключение к серверу...',
      'Загрузка данных воронки...',
      'Создание этапов...',
      'Загрузка промптов ассистентов...',
      'Загрузка локальных настроек...',
      'Применение настроек...',
      'Завершение загрузки...'
    ];

    return (
      <PageContainer>
        <LoadingProgress
          progress={loadingProgress}
          currentStep={currentLoadingStep}
          steps={loadingSteps}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Заголовок с кнопкой назад */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleBack}
              className='mr-2'
            >
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='text-2xl font-bold'>
                Настройки мультиагента этапов
              </h1>
              <p className='text-muted-foreground'>
                Настройка и управление AI-ассистентами для этапов воронки
              </p>
            </div>
          </div>
          <Button
            className={`ml-auto ${hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={handleFinishSetup}
          >
            Завершить настройку
          </Button>
        </div>

        {/* ТЕСТОВЫЙ БЛОК - ПРОВЕРКА РЕНДЕРИНГА */}
        <div className='rounded-lg bg-red-500 p-8 text-center text-2xl font-bold text-white'>
          🔴 ТЕСТОВЫЙ БЛОК НА ГЛАВНОЙ СТРАНИЦЕ - ВИДНО?
          <div className='mt-4 text-lg'>
            backendOrgId: {backendOrgId || 'НЕТ'}
            <br />
            funnelId: {currentFunnel?.id || 'НЕТ'}
          </div>
        </div>

        {/* Показываем скелетон при загрузке с локальными данными */}
        {loading && hasLocalData ? (
          <SkeletonLoader />
        ) : (
          <div className='grid grid-cols-12 gap-6'>
            {/* Left Column - General Settings */}
            <div className='col-span-4 h-fit space-y-6'>
              <GeneralSettingsComponent
                generalSettings={generalSettings}
                onSettingChange={handleGeneralSettingChange}
                onSave={handleSaveGeneralSettings}
                backendOrgId={backendOrgId}
                funnelId={currentFunnel?.id}
              />
            </div>

            {/* Center Column - Stage Configuration */}
            <div className='col-span-5 h-fit space-y-6'>
              <StageConfiguration
                stages={stages}
                currentFunnelData={currentFunnelData}
                activeStageId={activeStageId}
                activeSettingsTab={activeSettingsTab}
                instructions={instructions}
                saving={saving}
                successMessage={successMessage}
                error={error}
                onStageChange={handleStageChange}
                onTabChange={handleTabChange}
                onInstructionsChange={handleInstructionsChange}
                onSubmitInstructions={handleSubmitInstructions}
                onReloadPrompt={handleReloadPrompt}
              />
            </div>

            {/* Right Column - AI Settings */}
            <div className='col-span-3 h-fit space-y-6'>
              <AISettingsComponent
                activeStage={activeStage}
                stages={stages}
                currentFunnelData={currentFunnelData}
                successMessage={successMessage}
                onAISettingChange={handleAISettingChange}
                onFollowUpChange={handleFollowUpChange}
                onSave={handleSaveAISettings}
                hasChanges={hasAISettingsChanges}
              />
            </div>
          </div>
        )}

        {/* ПРОСТОЙ СКЕЛЕТ СПИСКА ФАЙЛОВ - ВНЕ GRID */}
        <div className='mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
          <h3 className='mb-4 text-xl font-bold'>📁 Файлы базы знаний</h3>
          <div className='space-y-3'>
            <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
              <p className='font-semibold'>Статус:</p>
              <p className='mt-2 text-sm'>
                • backendOrgId: {backendOrgId || '❌ НЕТ'}
              </p>
              <p className='text-sm'>
                • funnelId: {currentFunnel?.id || '❌ НЕТ'}
              </p>
            </div>
            <div className='rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600'>
              <p className='text-gray-500'>Здесь будет список файлов</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
