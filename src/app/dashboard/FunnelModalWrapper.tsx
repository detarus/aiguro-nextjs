'use client';

import React, { useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { useFunnels } from '@/contexts/FunnelsContext';
import { usePageHeaderContext } from '@/contexts/PageHeaderContext';
import AddFunnelModal from './overview/AddFunnelModal';

export default function FunnelModalWrapper() {
  const { organization } = useOrganization();
  const { isAddFunnelModalOpen, closeAddFunnelModal } = usePageHeaderContext();
  const { refreshFunnels, setNewFunnelAsSelected } = useFunnels();

  // Состояние для формы создания воронки
  const [newFunnelName, setNewFunnelName] = useState('');

  // Обработчик добавления воронки
  const handleAddFunnel = async (newFunnel?: any) => {
    console.log('handleAddFunnel called with:', newFunnel);

    if (newFunnel) {
      // Если передана новая воронка, устанавливаем её как выбранную
      setNewFunnelAsSelected(newFunnel);

      // Обновляем localStorage с полной информацией о воронке
      localStorage.setItem('currentFunnel', JSON.stringify(newFunnel));

      // Обновляем список воронок в localStorage
      const existingFunnels = localStorage.getItem('funnels');
      let funnels = [];
      if (existingFunnels) {
        try {
          funnels = JSON.parse(existingFunnels);
        } catch {
          funnels = [];
        }
      }

      // Добавляем новую воронку в список, если её там нет
      const funnelExists = funnels.find((f: any) => f.id === newFunnel.id);
      if (!funnelExists) {
        funnels.push(newFunnel);
        localStorage.setItem('funnels', JSON.stringify(funnels));
      }
    } else {
      // Если воронка не передана, обновляем список воронок
      await refreshFunnels();
    }

    // Закрываем модальное окно и сбрасываем форму
    closeAddFunnelModal();
    setNewFunnelName('');
  };

  return (
    <AddFunnelModal
      isOpen={isAddFunnelModalOpen}
      onClose={closeAddFunnelModal}
      onAdd={handleAddFunnel}
      newFunnelName={newFunnelName}
      setNewFunnelName={setNewFunnelName}
    />
  );
}
