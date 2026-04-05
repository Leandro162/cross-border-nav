'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import Header from '@/components/layout/Header';
import ToolList from '@/components/admin/ToolList';
import { Tool } from '@/types/tool';
import { Category } from '@/types/category';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NewToolForm {
  name: string;
  url: string;
  description: string;
  categoryId: string;
  hasDeal: boolean;
}

export default function AdminToolsPage() {
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTool, setNewTool] = useState<NewToolForm>({
    name: '',
    url: '',
    description: '',
    categoryId: '',
    hasDeal: false,
  });
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataStatus, setMetadataStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: toolsData, error } = useSWR('/api/tools', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: categoriesData } = useSWR('/api/categories', fetcher);

  const tools: Tool[] = toolsData?.data || [];
  const categories: Category[] = categoriesData?.data || [];

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchMetadata = async () => {
    if (newTool.url && isValidUrl(newTool.url)) {
      try {
        setFetchingMetadata(true);
        setMetadataStatus('idle');
        setStatusMessage('正在获取网站信息...');

        const response = await fetch('/api/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newTool.url }),
        });
        const data = await response.json();

        if (data.success && data.data) {
          const updates: Partial<NewToolForm> = {};
          if (data.data.title && !newTool.name) {
            updates.name = data.data.title;
          }
          if (data.data.description) {
            updates.description = data.data.description;
          }
          if (Object.keys(updates).length > 0) {
            setNewTool((prev) => ({ ...prev, ...updates }));
            setMetadataStatus('success');
            setStatusMessage('✓ 已自动获取网站信息');
          } else {
            setMetadataStatus('error');
            setStatusMessage('未能获取到网站信息');
          }
        } else {
          setMetadataStatus('error');
          setStatusMessage(data.error || '获取网站信息失败');
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
        setMetadataStatus('error');
        setStatusMessage('获取网站信息失败');
      } finally {
        setFetchingMetadata(false);
      }
    }
  };

  // Auto-fetch metadata when URL changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (showAddModal && newTool.url && isValidUrl(newTool.url) && !newTool.name && !newTool.description) {
        await fetchMetadata();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [showAddModal, newTool.url]);

  const handleReorder = async (items: { id: string; order: number }[]) => {
    const response = await fetch('/api/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder');
    }

    // Revalidate the tools list
    mutate('/api/tools');
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/tools/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete');
    }

    // Revalidate the tools list
    mutate('/api/tools');
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTool.name || !newTool.url || !newTool.categoryId) {
      alert('请填写所有必填字段');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTool.name,
          description: newTool.description,
          url: newTool.url,
          categoryId: newTool.categoryId,
          hasDeal: newTool.hasDeal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('工具添加成功！');
        setShowAddModal(false);
        setNewTool({
          name: '',
          url: '',
          description: '',
          categoryId: '',
          hasDeal: false,
        });
        setMetadataStatus('idle');
        setStatusMessage('');
        mutate('/api/tools');
      } else {
        alert(data.error || '添加失败，请重试');
      }
    } catch (error) {
      alert('添加失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setNewTool({
      name: '',
      url: '',
      description: '',
      categoryId: '',
      hasDeal: false,
    });
    setMetadataStatus('idle');
    setStatusMessage('');
    setShowAddModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTool) return;

    const response = await fetch(`/api/tools/${editingTool.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingTool.name,
        description: editingTool.description,
        url: editingTool.url,
        hasDeal: editingTool.has_deal,
      }),
    });

    if (response.ok) {
      setShowEditModal(false);
      setEditingTool(null);
      mutate('/api/tools');
    } else {
      alert('更新失败');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
        <Header />
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-red-600">加载失败，请刷新页面重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              工具管理
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              拖拽排序、编辑或删除工具
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex h-11 items-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加新工具
          </button>
        </div>

        <ToolList
          tools={tools}
          onReorder={handleReorder}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </main>

      {/* Edit Modal */}
      {showEditModal && editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              编辑工具
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  工具名称
                </label>
                <input
                  type="text"
                  value={editingTool.name}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, name: e.target.value })
                  }
                  className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  工具描述
                </label>
                <textarea
                  value={editingTool.description}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, description: e.target.value })
                  }
                  className="w-full min-h-[100px] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  工具链接
                </label>
                <input
                  type="url"
                  value={editingTool.url}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, url: e.target.value })
                  }
                  className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-hasDeal"
                  checked={editingTool.has_deal}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, has_deal: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                />
                <label
                  htmlFor="edit-hasDeal"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  有优惠/促销
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTool(null);
                  }}
                  className="flex-1 h-11 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Tool Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              添加新工具
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  工具名称 *
                </label>
                <input
                  type="text"
                  value={newTool.name}
                  onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="输入工具名称"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  工具链接 *
                </label>
                <input
                  type="url"
                  value={newTool.url}
                  onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="https://example.com"
                  required
                />
                <div className="mt-2 flex items-center justify-between">
                  {fetchingMetadata && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                      正在获取网站信息...
                    </p>
                  )}
                  {!fetchingMetadata && metadataStatus === 'success' && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {statusMessage}
                    </p>
                  )}
                  {!fetchingMetadata && metadataStatus === 'error' && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {statusMessage}
                    </p>
                  )}
                  {!fetchingMetadata && newTool.url && isValidUrl(newTool.url) && (
                    <button
                      type="button"
                      onClick={fetchMetadata}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      重新获取
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  工具描述 *
                </label>
                <textarea
                  value={newTool.description}
                  onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                  className="w-full min-h-[100px] rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="简要描述这个工具的功能和特点"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  分类 *
                </label>
                <select
                  value={newTool.categoryId}
                  onChange={(e) => setNewTool({ ...newTool, categoryId: e.target.value })}
                  className="w-full h-11 rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  required
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add-hasDeal"
                  checked={newTool.hasDeal}
                  onChange={(e) => setNewTool({ ...newTool, hasDeal: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600"
                />
                <label
                  htmlFor="add-hasDeal"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  有优惠/促销
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewTool({
                      name: '',
                      url: '',
                      description: '',
                      categoryId: '',
                      hasDeal: false,
                    });
                    setMetadataStatus('idle');
                    setStatusMessage('');
                  }}
                  className="flex-1 h-11 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || fetchingMetadata}
                  className="flex-1 h-11 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {submitting ? '添加中...' : '添加工具'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
