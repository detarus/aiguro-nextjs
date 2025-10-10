'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { FileUploader } from '@/components/file-uploader';
import { Upload, Trash2, RefreshCw } from 'lucide-react';
import { getClerkTokenFromClientCookie } from '@/lib/auth-utils';

const FILE_CATEGORIES = [
  { value: 'general_info', label: 'Общая информация' },
  { value: 'service_catalog', label: 'Каталог услуг' },
  { value: 'dialog_management', label: 'Ведение диалога' },
  { value: 'client_work', label: 'Работа с клиентом' }
];

interface FileItem {
  id: number;
  name: string;
  size: number;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
}

interface FunnelFilesManagerProps {
  backendOrgId: string;
  funnelId: string | number;
  isKnowledgeBaseEnabled: boolean;
}

export function FunnelFilesManager({
  backendOrgId,
  funnelId,
  isKnowledgeBaseEnabled
}: FunnelFilesManagerProps) {
  console.log('🎯 FunnelFilesManager COMPONENT RENDERED!');
  console.log('FunnelFilesManager props:', {
    backendOrgId,
    funnelId,
    isKnowledgeBaseEnabled
  });

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    description: '',
    category: '',
    is_public: false
  });

  // Загрузка файлов при монтировании
  useEffect(() => {
    if (backendOrgId && funnelId) {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendOrgId, funnelId]);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setError('Токен авторизации не найден');
        return;
      }

      console.log('Fetching files for funnel:', { backendOrgId, funnelId });

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${funnelId}/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Fetch files response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки файлов');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файлов');
    } finally {
      setLoading(false);
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
    if (!uploadForm.file) {
      setError('Выберите файл для загрузки');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setUploadModalOpen(false);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setError('Токен авторизации не найден');
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }
      if (uploadForm.category) {
        formData.append('category', uploadForm.category);
      }
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки файла');
      }

      setSuccessMessage('Файл успешно загружен!');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Обновляем список файлов
      await fetchFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (fileId: string) => {
    setSelectedFileId(fileId);
    setDeleteModalOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!selectedFileId) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setDeleteModalOpen(false);

    try {
      const token = getClerkTokenFromClientCookie();
      if (!token) {
        setError('Токен авторизации не найден');
        return;
      }

      const response = await fetch(
        `/api/organization/${backendOrgId}/funnels/${funnelId}/files/${selectedFileId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка удаления файла');
      }

      setSuccessMessage('Файл успешно удален!');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Обновляем список файлов
      await fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err instanceof Error ? err.message : 'Ошибка удаления файла');
    } finally {
      setLoading(false);
      setSelectedFileId('');
    }
  };

  const formatFileSize = (bytes: number): string => {
    return `${bytes} Bytes`;
  };

  const getCategoryLabel = (value: string): string => {
    const category = FILE_CATEGORIES.find((cat) => cat.value === value);
    return category ? category.label : value;
  };

  // Проверка наличия необходимых данных
  const missingData = [];
  if (!isKnowledgeBaseEnabled) missingData.push('База знаний агента отключена');
  if (!backendOrgId) missingData.push('ID организации (backendOrgId)');
  if (!funnelId) missingData.push('ID воронки (funnelId)');

  const isFullyEnabled = missingData.length === 0;

  return (
    <>
      {/* Тестовый маркер для проверки рендеринга */}
      <div className='mt-6 bg-green-500 p-2 text-center font-bold text-white'>
        ✅ КОМПОНЕНТ FUNNEL FILES MANAGER ЗАГРУЖЕН!
      </div>

      <Card className='mt-6 h-fit'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Файлы базы знаний</CardTitle>
              <p className='text-muted-foreground mt-1 text-sm'>
                Управление файлами для этой воронки
              </p>
            </div>
            <Button
              onClick={fetchFiles}
              variant='outline'
              size='icon'
              disabled={loading || !isFullyEnabled}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Отображение статуса отсутствующих данных или неактивности */}
          {!isFullyEnabled && (
            <div
              className={`rounded-lg border p-4 ${
                !isKnowledgeBaseEnabled
                  ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
                  : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
              }`}
            >
              <h4
                className={`mb-2 text-sm font-semibold ${
                  !isKnowledgeBaseEnabled
                    ? 'text-gray-800 dark:text-gray-200'
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}
              >
                {!isKnowledgeBaseEnabled
                  ? '🔒 Компонент неактивен'
                  : '⚠️ Отсутствуют необходимые данные'}
              </h4>
              <ul
                className={`list-inside list-disc space-y-1 text-sm ${
                  !isKnowledgeBaseEnabled
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}
              >
                {missingData.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <div
                className={`mt-3 text-xs ${
                  !isKnowledgeBaseEnabled
                    ? 'text-gray-600 dark:text-gray-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                <p className='mb-1 font-semibold'>Текущие значения:</p>
                <p>
                  • База знаний:{' '}
                  {isKnowledgeBaseEnabled ? '✅ включена' : '❌ выключена'}
                </p>
                <p>• backendOrgId: {backendOrgId || '❌ не задан'}</p>
                <p>• funnelId: {funnelId || '❌ не задан'}</p>
              </div>
            </div>
          )}

          {isFullyEnabled && (
            <>
              {/* Сообщения об успехе/ошибке */}
              {successMessage && (
                <div className='rounded-lg bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                  {successMessage}
                </div>
              )}

              {error && (
                <div className='rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                  {error}
                </div>
              )}

              {/* Кнопка загрузки */}
              <Button
                onClick={handleOpenUploadModal}
                disabled={loading}
                className='w-full'
              >
                <Upload className='mr-2 h-4 w-4' />
                Загрузить файл
              </Button>

              {/* Таблица файлов */}
              {files.length > 0 ? (
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Имя файла</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Размер</TableHead>
                        <TableHead className='w-[50px]'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className='font-medium'>
                            {file.name}
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            {getCategoryLabel(file.category)}
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            {formatFileSize(file.size)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() =>
                                handleOpenDeleteModal(file.id.toString())
                              }
                              disabled={loading}
                            >
                              <Trash2 className='h-4 w-4 text-red-500' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='rounded-lg border border-dashed p-8 text-center'>
                  <p className='text-muted-foreground text-sm'>
                    Файлы не загружены
                  </p>
                </div>
              )}
            </>
          )}
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
                      setUploadForm((prev) => ({
                        ...prev,
                        file: files[0]
                      }));
                    } else {
                      setUploadForm((prev) => ({
                        ...prev,
                        file: null
                      }));
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
                    setUploadForm((prev) => ({
                      ...prev,
                      category: value
                    }))
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
              disabled={loading || !uploadForm.file}
            >
              {loading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно удаления файла */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Удалить файл</DialogTitle>
          </DialogHeader>

          <div className='py-4'>
            <p className='text-muted-foreground text-sm'>
              Вы уверены, что хотите удалить этот файл? Это действие нельзя
              отменить.
            </p>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteModalOpen(false)}>
              Отмена
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteFile}
              disabled={loading}
            >
              {loading ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
