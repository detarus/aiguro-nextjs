'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { CreateOrganizationModal } from '@/components/modal/create-organization-modal';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useUser, OrganizationSwitcher } from '@clerk/nextjs';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconPlus,
  IconSettings,
  IconUserCircle
} from '@tabler/icons-react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';

export const company = {
  name: 'Acme Inc',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user } = useUser();
  const router = useRouter();
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = React.useState(false);

  // Группа "Текущая воронка"
  const funnelNav: Array<{
    title: string;
    url: string;
    icon: keyof typeof Icons;
    isActive: boolean;
    disabled: boolean;
  }> = [
    {
      title: 'Дашборд',
      url: '/dashboard/overview',
      icon: 'dashboard',
      isActive: pathname === '/dashboard/overview',
      disabled: false
    },
    {
      title: 'Клиенты',
      url: '/dashboard/clients',
      icon: 'users',
      isActive: pathname === '/dashboard/clients',
      disabled: false
    },
    {
      title: 'Месенджеры',
      url: '/dashboard/messengers',
      icon: 'messengers',
      isActive: pathname === '/dashboard/messengers',
      disabled: false
    },
    {
      title: 'Управление',
      url: '/dashboard/management',
      icon: 'settings',
      isActive: pathname === '/dashboard/management',
      disabled: false
    }
  ];

  // Группа "Разделы компании"
  const companyNav: Array<{
    title: string;
    url: string;
    icon: keyof typeof Icons;
    isActive: boolean;
    disabled: boolean;
  }> = [
    {
      title: 'Воронки',
      url: '/dashboard/funnels',
      icon: 'kanban',
      isActive: pathname === '/dashboard/funnels',
      disabled: false
    },
    {
      title: 'Пользователи и Роли',
      url: '#',
      icon: 'users',
      isActive: false,
      disabled: false
    },
    {
      title: 'Команды AI-асистентов',
      url: '#',
      icon: 'userPen',
      isActive: false,
      disabled: false
    },
    {
      title: 'API-ключи',
      url: '#',
      icon: 'apiKeys',
      isActive: false,
      disabled: false
    }
  ];

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher
              organizationProfileMode='navigation'
              organizationProfileUrl='/dashboard/organization'
              createOrganizationMode='modal'
              hidePersonal={true}
              afterCreateOrganizationUrl='/dashboard/organization'
              afterSelectOrganizationUrl='/dashboard/overview'
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Текущая воронка</SidebarGroupLabel>
          <SidebarMenu>
            {funnelNav.map((item) => {
              const Icon = item.icon
                ? Icons[item.icon as keyof typeof Icons]
                : Icons.logo;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={item.isActive}
                  >
                    <Link href={item.url}>
                      {Icon ? <Icon /> : <Icons.logo />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          <SidebarGroupLabel>Разделы компании</SidebarGroupLabel>
          <SidebarMenu>
            {companyNav.map((item) => {
              const Icon = item.icon
                ? Icons[item.icon as keyof typeof Icons]
                : Icons.logo;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={item.isActive}
                  >
                    <Link href={item.url}>
                      {Icon ? <Icon /> : <Icons.logo />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Учетная запись
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/organization')}
                  >
                    <IconSettings className='mr-2 h-4 w-4' />
                    Управление компанией
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsCreateOrgModalOpen(true)}
                  >
                    <IconPlus className='mr-2 h-4 w-4' />
                    Добавить компанию
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconLogout className='mr-2 h-4 w-4' />
                  <SignOutButton redirectUrl='/auth/sign-in'>
                    Выйти
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <CreateOrganizationModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
      />
    </Sidebar>
  );
}
