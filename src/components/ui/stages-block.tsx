'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconEdit,
  IconCheck,
  IconX,
  IconSettings,
  IconPlus
} from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

interface Stage {
  name: string;
  assistant_code_name?: string;
  prompt?: string;
  followups?: number[];
  deals_count?: number;
  deals_amount?: number;
}

interface StagesBlockProps {
  organizationId: string;
  funnelId: string;
  stages: Stage[];
  isLoading?: boolean;
  onStageUpdate?: () => void;
  onStageSelect?: (stageIndex: number | null, stage?: Stage) => void;
}

export function StagesBlock({
  organizationId,
  funnelId,
  stages = [],
  isLoading = false,
  onStageUpdate,
  onStageSelect
}: StagesBlockProps) {
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const handleEditStart = (index: number, currentName: string) => {
    setEditingStage(index);
    setEditedName(currentName);
  };

  const handleEditCancel = () => {
    setEditingStage(null);
    setEditedName('');
  };

  const handleEditSave = async (index: number) => {
    if (!editedName.trim()) return;

    setLoading(true);
    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) throw new Error('No token available');

      // Создаем обновленный массив этапов
      const updatedStages = [...stages];
      updatedStages[index] = {
        ...updatedStages[index],
        name: editedName.trim()
      };

      const response = await fetch(
        `/api/organization/${organizationId}/funnel/${funnelId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            stages: updatedStages
          })
        }
      );

      if (response.ok) {
        setEditingStage(null);
        setEditedName('');
        onStageUpdate?.();
      } else {
        console.error('Failed to update stage name');
      }
    } catch (error) {
      console.error('Error updating stage name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = (index: number, stageName: string) => {
    if (editingStage === index) return; // Не выделяем, если редактируем
    const newSelectedStage = selectedStage === index ? null : index;
    setSelectedStage(newSelectedStage);
    onStageSelect?.(
      newSelectedStage,
      newSelectedStage !== null ? stages[newSelectedStage] : undefined
    );
  };

  const handleStageEdit = (stageName: string) => {
    // Переход к странице редактирования этапа AI-ассистентов
    window.location.href = `/dashboard/management/ai-assistants?stage=${encodeURIComponent(stageName)}`;
  };

  // Функция для получения цвета этапа
  const getStageColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-green-500',
      'bg-pink-500',
      'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };

  // Компонент скелетной загрузки для этапа
  const StageSkeleton = () => (
    <div className='w-64 flex-shrink-0'>
      {/* Заголовок этапа */}
      <div className='mb-3 rounded-lg border bg-white'>
        <Skeleton className='h-1 w-full rounded-t-lg' />
        <div className='rounded-b-lg bg-gray-50 px-3 py-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-8 rounded-full' />
              <div className='flex-1 text-center'>
                <Skeleton className='mx-auto h-4 w-20' />
              </div>
              <Skeleton className='h-8 w-8 rounded' />
            </div>
          </div>
        </div>
      </div>

      {/* Контент этапа */}
      <div className='min-h-[80px] rounded-lg border border-gray-200 bg-white p-3'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-full rounded border-2 border-dashed' />
          <div className='h-px bg-gray-200' />
        </div>
      </div>
    </div>
  );

  return (
    <div className='mb-6'>
      <div
        className='stages-scroll overflow-x-auto pb-4'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          maxWidth: 'calc(100vw - 556px)!important'
        }}
      >
        <div className='flex gap-6'>
          {isLoading ? (
            // Показываем скелетную загрузку во время загрузки
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <StageSkeleton key={index} />
              ))}
            </>
          ) : stages.length === 0 ? (
            // Показываем сообщение об отсутствии этапов только после загрузки
            <div className='text-muted-foreground w-full py-8 text-center'>
              Этапы не найдены. Настройте воронку продаж.
            </div>
          ) : (
            stages.map((stage, index) => (
              <div key={index} className='w-64 flex-shrink-0'>
                {/* Заголовок этапа */}
                <div
                  className={`mb-3 cursor-pointer rounded-lg border bg-white transition-all ${
                    selectedStage === index
                      ? 'border-gray-800 bg-gray-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => handleStageClick(index, stage.name)}
                >
                  <div
                    className={`h-1 w-full rounded-t-lg ${getStageColor(index)}`}
                  />
                  <div
                    className={`rounded-b-lg px-3 py-2 ${
                      selectedStage === index ? 'bg-gray-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='flex h-8 w-8 cursor-help items-center justify-center rounded-full border border-gray-300 bg-gray-100'
                          title={
                            stage.assistant_code_name
                              ? stage.assistant_code_name
                              : `Этап ${stage.name}`
                          }
                        >
                          <span className='text-xs font-medium text-gray-700'>
                            {index + 1}
                          </span>
                        </div>
                        <div className='flex-1 text-center'>
                          {editingStage === index ? (
                            <div
                              className='flex items-center gap-2'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className='h-8 text-sm font-medium'
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditSave(index);
                                  if (e.key === 'Escape') handleEditCancel();
                                }}
                              />
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleEditSave(index)}
                                disabled={loading}
                                className='h-8 w-8 p-0'
                              >
                                <IconCheck className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={handleEditCancel}
                                disabled={loading}
                                className='h-8 w-8 p-0'
                              >
                                <IconX className='h-4 w-4' />
                              </Button>
                            </div>
                          ) : (
                            <div className='text-center'>
                              <h2 className='text-sm font-semibold tracking-wide text-gray-700 uppercase'>
                                {stage.name}
                              </h2>
                            </div>
                          )}
                        </div>
                        {editingStage !== index && (
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(index, stage.name);
                            }}
                            className='h-8 w-8 p-0'
                          >
                            <IconEdit className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Контент этапа */}
                <div className='min-h-[80px] rounded-lg border border-gray-200 bg-white p-3'>
                  <div className='space-y-2'>
                    {/* Кнопка добавления подсказки */}
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600'
                      onClick={() => handleStageEdit(stage.name)}
                    >
                      <IconPlus className='mr-1 h-3 w-3' />
                      Добавить подсказки
                    </Button>

                    <Separator />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
