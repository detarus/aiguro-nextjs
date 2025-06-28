'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CreateOrganizationModal } from '@/components/modal/create-organization-modal';
import {
  useUser,
  useOrganization,
  OrganizationSwitcher,
  SignOutButton
} from '@clerk/nextjs';
import {
  IconLayoutDashboard,
  IconLayoutKanban,
  IconListCheck,
  IconMessage,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconTemplate,
  IconBuildingStore,
  IconKey,
  IconPlugConnected,
  IconHeadset,
  IconAdjustments,
  IconSun,
  IconMoon,
  IconUser,
  IconCoin,
  IconCreditCard,
  IconLogout,
  IconChevronDown,
  IconBug
} from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

// Структура навигационного меню
const navigationSections = [
  {
    title: 'ОБЩЕЕ',
    items: [
      {
        title: 'Дашборд',
        url: '/dashboard/overview',
        icon: IconLayoutDashboard,
        isActive: false,
        disabled: false
      },
      {
        title: 'Сделки',
        url: '/dashboard/deals',
        icon: IconLayoutKanban,
        isActive: false,
        disabled: false
      },
      // {
      //   title: 'Задачи',
      //   url: '#',
      //   icon: IconListCheck,
      //   isActive: false,
      //   disabled: true
      // },
      {
        title: 'Диалоги',
        url: '/dashboard/messengers',
        icon: IconMessage,
        isActive: false,
        disabled: false
      },
      // {
      //   title: 'Аналитика',
      //   url: '#',
      //   icon: IconChartBar,
      //   isActive: false,
      //   disabled: true
      // },
      {
        title: 'Клиенты',
        url: '/dashboard/clients',
        icon: IconUsers,
        isActive: false,
        disabled: false
      },
      {
        title: 'Управление',
        url: '/dashboard/management',
        icon: IconSettings,
        isActive: false,
        disabled: false
      }
    ]
  },
  {
    title: 'ВНЕШНЕЕ',
    items: [
      {
        title: 'Шаблоны',
        url: '#',
        icon: IconTemplate,
        isActive: false,
        disabled: true
      },
      {
        title: 'Маркетплейс',
        url: '#',
        icon: IconBuildingStore,
        isActive: false,
        disabled: true
      },
      {
        title: 'API-ключи',
        url: '#',
        icon: IconKey,
        isActive: false,
        disabled: true
      }
    ]
  },
  {
    title: 'АДМИНИСТРИРОВАНИЕ',
    items: [
      {
        title: 'Интеграции',
        url: '/dashboard/integrations',
        icon: IconPlugConnected,
        isActive: false,
        disabled: false
      },
      {
        title: 'Поддержка',
        url: '#',
        icon: IconHeadset,
        isActive: false,
        disabled: true
      },
      {
        title: 'Дебаг',
        url: '/dashboard/debug',
        icon: IconBug,
        isActive: false,
        disabled: false
      },
      {
        title: 'Настройки',
        url: '/dashboard/settings',
        icon: IconAdjustments,
        isActive: false,
        disabled: false
      }
    ]
  }
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { organization } = useOrganization();
  const { theme, setTheme } = useTheme();
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = React.useState(false);

  // Обновляем активное состояние для пунктов меню
  const updatedSections = navigationSections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      isActive: pathname === item.url
    }))
  }));

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sidebar className='border-none bg-transparent dark:bg-transparent'>
      <SidebarHeader className='p-4'>
        {/* Логотип AI Guro */}
        <div className='mb-0 flex items-center gap-3'>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800 dark:bg-gray-100'>
            <IconSettings className='h-4 w-4 text-white dark:text-gray-900' />
          </div>
          <div className='flex items-center gap-2'>
            <h1 className='text-base font-semibold text-gray-900 dark:text-white'>
              AI Guro
            </h1>
            <span className='text-gray-400 dark:text-gray-500'>|</span>
            <p className='text-xs text-gray-500 dark:text-gray-300'>
              Sales Hub
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3'>
        {/* Основная закругленная панель */}
        <div className='rounded-[25px] border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-[#2D2D2D]'>
          {/* Навигационные секции */}
          {updatedSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-3' : ''}>
              <h3 className='mb-2 text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-300'>
                {section.title}
              </h3>
              <div className='space-y-1'>
                {section.items.map((item) => {
                  const Icon = item.icon;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.title}
                        className='flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-1.5 opacity-40'
                      >
                        <Icon className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                          {item.title}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link key={item.title} href={item.url}>
                      <div
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          item.isActive
                            ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                            : 'text-gray-700 dark:text-gray-100'
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            item.isActive
                              ? 'text-white dark:text-gray-900'
                              : 'text-gray-600 dark:text-gray-200'
                          }`}
                        />
                        <span className='text-xs font-medium'>
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Переключатель темы */}
          <div className='mt-3 border-t border-gray-200 pt-2 dark:border-gray-600'>
            <div className='flex items-center justify-center'>
              <div className='flex items-center rounded-full bg-gray-100 p-0.5 dark:bg-gray-700'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={toggleTheme}
                  className={`h-auto rounded-full p-1 transition-colors ${
                    theme === 'light'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <IconSun className='h-3 w-3' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={toggleTheme}
                  className={`h-auto rounded-full p-1 transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <IconMoon className='h-3 w-3' />
                </Button>
              </div>
            </div>
          </div>

          {/* Информация о компании */}
          <div className='mt-2 border-t border-gray-200 pt-2 dark:border-gray-600'>
            <div className='flex items-center gap-2'>
              {/* Выбор организации */}
              <div className='flex-1'>
                <OrganizationSwitcher
                  organizationProfileMode='navigation'
                  organizationProfileUrl='/dashboard/organization'
                  createOrganizationMode='modal'
                  hidePersonal={true}
                  afterCreateOrganizationUrl='/dashboard/organization'
                  afterSelectOrganizationUrl='/dashboard/overview'
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger:
                        '!p-0 !bg-transparent !border-0 !shadow-none !w-full',
                      organizationSwitcherTriggerIcon: '!hidden',
                      organizationPreview:
                        '!flex !items-center !gap-2 !p-2 !rounded-lg !bg-gray-50 dark:!bg-gray-800 hover:!bg-gray-100 dark:hover:!bg-gray-700 !transition-colors !w-full',
                      organizationPreviewAvatarContainer:
                        '!w-5 !h-5 !bg-gray-200 dark:!bg-gray-600 !rounded-full !flex !items-center !justify-center !overflow-hidden',
                      organizationPreviewAvatarImage:
                        '!w-full !h-full !object-cover',
                      organizationPreviewMainIdentifier:
                        '!text-[9px] !text-gray-500 dark:!text-gray-300 !truncate !font-normal',
                      organizationPreviewSecondaryIdentifier: '!hidden',
                      organizationSwitcherPopoverCard:
                        '!p-3 !rounded-xl !shadow-xl !border !border-gray-200 dark:!border-gray-700 !bg-white dark:!bg-gray-800 !mt-2',
                      organizationSwitcherPopoverActionButton:
                        '!text-sm !p-3 hover:!bg-gray-100 dark:hover:!bg-gray-700 !rounded-lg !transition-colors',
                      organizationSwitcherPopoverActionButtonText:
                        '!text-sm !font-medium',
                      organizationPreviewTextContainer: '!flex-1 !min-w-0',
                      organizationSwitcherPopoverActions: '!gap-1'
                    }
                  }}
                />
              </div>

              {/* Разделитель */}
              <div className='h-4 w-px bg-gray-300 dark:bg-gray-600'></div>

              {/* Баланс аккаунта */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='flex h-auto items-center gap-1.5 rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                  >
                    <IconCoin className='h-3 w-3 text-gray-600 dark:text-gray-200' />
                    <span className='text-xs font-medium text-gray-900 dark:text-white'>
                      100
                    </span>
                    <IconChevronDown className='h-2.5 w-2.5 text-gray-500 dark:text-gray-400' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800'
                  side='top'
                  align='end'
                  sideOffset={4}
                >
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                    onClick={() => {
                      /* Логика пополнения баланса */
                    }}
                  >
                    <IconCreditCard className='h-4 w-4' />
                    Пополнить баланс
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
                    onClick={() =>
                      (window.location.href = '/dashboard/profile')
                    }
                  >
                    <IconUser className='h-4 w-4' />
                    Настройки
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className='my-1 bg-gray-200 dark:bg-gray-700' />
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700'
                    asChild
                  >
                    <SignOutButton redirectUrl='/auth/sign-in'>
                      <div className='flex items-center gap-2'>
                        <IconLogout className='h-4 w-4' />
                        Выход из аккаунта
                      </div>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />

      <CreateOrganizationModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
      />
    </Sidebar>
  );
}
