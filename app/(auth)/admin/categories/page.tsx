'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Category } from '@/types/category';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminCategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categoriesData, error } = useSWR('/api/categories', fetcher, {
    revalidateOnFocus: false,
  });

  const categories: Category[] = categoriesData?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName }),
    });

    if (response.ok) {
      setNewCategoryName('');
      setShowAddModal(false);
      mutate('/api/categories');
    } else {
      const data = await response.json();
      alert(data.error || '创建失败');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCategory) return;

    const response = await fetch(`/api/categories/${editingCategory.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingCategory.name }),
    });

    if (response.ok) {
      setEditingCategory(null);
      mutate('/api/categories');
    } else {
      alert('更新失败');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除分类 "${name}" 吗？\n\n注意：只能删除没有工具的分类。`)) {
      return;
    }

    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (response.ok) {
      mutate('/api/categories');
    } else {
      alert(data.error || '删除失败');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
        <Header />
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-red-600">加载失败，请刷新页面重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              分类管理
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              管理工具分类
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            添加分类
          </Button>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {category.name}
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {category.slug}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="rounded p-2 text-zinc-400 hover:bg-zinc-100 hover:text-blue-600 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="rounded p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">暂无分类</p>
          </div>
        )}
      </main>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              添加分类
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="分类名称"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入分类名称"
                required
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCategoryName('');
                  }}
                >
                  取消
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  创建
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              编辑分类
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="分类名称"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, name: e.target.value })
                }
                required
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingCategory(null)}
                >
                  取消
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  保存
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
