'use client';

import { useState, useEffect } from 'react';
import {
  useOrganization,
  useOrganizationList,
  useUser,
  useClerk
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Loader2, Building } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function OrganizationSwitcher() {
  const { organization: currentOrg } = useOrganization();
  const { userMemberships, setActive, isLoaded } = useOrganizationList();
  const { user } = useUser();
  const { openCreateOrganization } = useClerk();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Populate organizations list
  useEffect(() => {
    if (
      isLoaded &&
      (!userMemberships?.data || userMemberships.data.length === 0)
    ) {
      if (user?.organizationMemberships) {
        setOrganizations(
          user.organizationMemberships.map(
            (membership) => membership.organization
          )
        );
      }
    } else if (userMemberships?.data) {
      setOrganizations(
        userMemberships.data.map((membership) => membership.organization)
      );
    }
  }, [isLoaded, userMemberships?.data, user?.organizationMemberships]);

  const handleOrganizationSwitch = async (org: any) => {
    console.log('🔄 Organization switch requested:', org.name, org.id);

    if (setActive) {
      await setActive({ organization: org.id });
    }
  };

  const handleCreateOrganization = () => {
    openCreateOrganization({
      afterCreateOrganizationUrl: '/dashboard/overview',
      appearance: {
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-lg',
          headerTitle: 'text-xl font-semibold',
          headerSubtitle: 'text-gray-600'
        }
      }
    });
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant='outline' className='w-full justify-start' disabled>
        <Building className='mr-2 h-4 w-4' />
        Загрузка...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='w-full min-w-0 justify-start'>
          <Building className='mr-2 h-4 w-4 flex-shrink-0' />
          <span className='truncate'>
            {currentOrg?.name || 'Выберите организацию'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align='start'>
        <DropdownMenuLabel>Сменить организацию</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!isLoaded && (
          <DropdownMenuItem disabled>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Загрузка организаций...
          </DropdownMenuItem>
        )}

        {isLoaded && organizations.length === 0 && (
          <DropdownMenuItem disabled>
            Нет доступных организаций
          </DropdownMenuItem>
        )}

        <div className='max-h-48 overflow-y-auto'>
          {organizations.map((org) => {
            const isCurrentOrg = currentOrg?.id === org.id;
            const hasBackendId = !!org.publicMetadata?.id_backend;

            return (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleOrganizationSwitch(org)}
                className={`flex flex-col items-start space-y-1 p-3 ${isCurrentOrg ? 'bg-muted' : ''}`}
              >
                <div className='flex w-full items-center'>
                  <div className='flex-1'>
                    <div className='font-medium'>{org.name}</div>
                    <div className='text-muted-foreground text-xs'>
                      {hasBackendId
                        ? 'Синхронизирована'
                        : 'Не синхронизирована'}
                      {isCurrentOrg && ' (Текущая)'}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateOrganization}
          className='text-blue-600'
        >
          + Создать организацию
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
