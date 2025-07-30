'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  IconSettings,
  IconPlus,
  IconUserCircle,
  IconLogout
} from '@tabler/icons-react';

export function UserNav() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Don't render until user data is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <Button
        variant='ghost'
        className='relative h-8 w-8 rounded-full'
        disabled
      >
        <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900'></div>
      </Button>
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <UserAvatarProfile user={user} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-56'
          align='end'
          sideOffset={10}
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {user.fullName}
              </p>
              <p className='text-muted-foreground text-xs leading-none'>
                {user.emailAddresses[0].emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <IconUserCircle className='mr-2 h-4 w-4' />
              Учетная запись
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/organization')}
            >
              <IconSettings className='mr-2 h-4 w-4' />
              Управление компанией
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconPlus className='mr-2 h-4 w-4' />
              Добавить компанию
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <IconLogout className='mr-2 h-4 w-4' />
            <SignOutButton redirectUrl='/auth/sign-in'>Выйти</SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
