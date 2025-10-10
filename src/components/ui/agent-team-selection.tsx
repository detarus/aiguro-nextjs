'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IconUser } from '@tabler/icons-react';

interface AgentTeam {
  id: string;
  name: string;
  date: string;
  type: 'Мультиагент' | 'Одиночный';
  isActive: boolean;
  isEnabled: boolean;
  stats: {
    users: number;
    warnings: number;
    errors: number;
    success: number;
  };
  progress: number;
  meetingType: string;
  author: string;
}

const mockTeams: AgentTeam[] = [
  {
    id: '1',
    name: 'Агент1',
    date: '23-11-2024',
    type: 'Мультиагент',
    isActive: true,
    isEnabled: true,
    stats: { users: 1, warnings: 4, errors: 2, success: 1 },
    progress: 25,
    meetingType: 'Встреча',
    author: 'Валерий Гуро'
  },
  {
    id: '2',
    name: 'Агент2',
    date: '23-11-2024',
    type: 'Одиночный',
    isActive: false,
    isEnabled: false,
    stats: { users: 1, warnings: 4, errors: 2, success: 1 },
    progress: 25,
    meetingType: 'Встреча',
    author: 'Валерий Гуро'
  },
  {
    id: '3',
    name: 'Агент3',
    date: '23-11-2024',
    type: 'Мультиагент',
    isActive: false,
    isEnabled: false,
    stats: { users: 1, warnings: 4, errors: 2, success: 1 },
    progress: 25,
    meetingType: 'Встреча',
    author: 'Валерий Гуро'
  }
];

export function AgentTeamSelection() {
  const [teams, setTeams] = useState<AgentTeam[]>(mockTeams);

  const handleToggle = (teamId: string) => {
    if (teamId === '1') return; // Первый агент всегда активен

    setTeams(
      teams.map((team) =>
        team.id === teamId ? { ...team, isEnabled: !team.isEnabled } : team
      )
    );
  };

  return (
    <div className='mb-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Выбор команды агентов</h2>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' className='text-xs'>
            Добавить агента
          </Button>
          <Button variant='outline' size='sm' className='text-xs'>
            Настроить A/B тест
          </Button>
        </div>
      </div>

      <div className='space-y-2'>
        {teams.map((team) => (
          <Card
            key={team.id}
            className={`${
              team.isActive
                ? 'border-gray-800 bg-gray-100/50'
                : team.isEnabled
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-200 bg-gray-50/50'
            } transition-all`}
          >
            <CardContent className='p-3'>
              <div className='flex items-center justify-between'>
                {/* Левая часть - Switch и основная информация */}
                <div className='flex items-center gap-3'>
                  <Switch
                    checked={team.isEnabled || team.isActive}
                    onCheckedChange={() => handleToggle(team.id)}
                    disabled={team.id === '1' || !team.isEnabled}
                    className={
                      team.isActive ? 'data-[state=checked]:bg-gray-800' : ''
                    }
                  />

                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>{team.name}</span>
                    <span className='text-xs text-gray-500'>{team.date}</span>
                    <Badge
                      variant='outline'
                      className={`px-1 py-0 text-xs ${
                        team.type === 'Мультиагент'
                          ? 'border-purple-200 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      {team.type}
                    </Badge>
                  </div>
                </div>

                {/* Центральная часть - Статистика */}
                <div className='flex items-center gap-6'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-1'>
                      <div className='flex h-4 w-4 items-center justify-center rounded-full bg-gray-100'>
                        <IconUser className='h-2.5 w-2.5 text-gray-600' />
                      </div>
                      <span className='text-sm font-medium'>
                        {team.stats.users}
                      </span>
                    </div>

                    <div className='flex items-center gap-1'>
                      <div className='flex h-4 w-4 items-center justify-center rounded-full bg-yellow-100'>
                        <span className='text-xs font-bold text-yellow-600'>
                          !
                        </span>
                      </div>
                      <span className='text-sm font-medium'>
                        {team.stats.warnings}
                      </span>
                    </div>

                    <div className='flex items-center gap-1'>
                      <div className='flex h-4 w-4 items-center justify-center rounded-full bg-red-100'>
                        <span className='text-xs font-bold text-red-600'>
                          ×
                        </span>
                      </div>
                      <span className='text-sm font-medium'>
                        {team.stats.errors}
                      </span>
                    </div>

                    <div className='flex items-center gap-1'>
                      <div className='flex h-4 w-4 items-center justify-center rounded-full bg-green-100'>
                        <span className='text-xs font-bold text-green-600'>
                          ✓
                        </span>
                      </div>
                      <span className='text-sm font-medium'>
                        {team.stats.success}
                      </span>
                    </div>
                  </div>

                  {/* Прогресс бар */}
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>
                      {team.progress}%
                    </span>
                    <div className='w-20'>
                      <Progress value={team.progress} className='h-2' />
                    </div>
                  </div>

                  {/* Тип встречи */}
                  <div className='text-sm text-gray-600'>
                    {team.meetingType}
                  </div>

                  {/* Автор */}
                  <div className='text-sm text-gray-500'>{team.author}</div>
                </div>

                {/* Правая часть - Кнопка настроек */}
                <div>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={!team.isEnabled && !team.isActive}
                    className={`${
                      !team.isEnabled && !team.isActive
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                    }`}
                  >
                    Настройки
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
