'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Header from '@/components/layout/Header';
import ToolList from '@/components/admin/ToolList';
import { Tool } from '@/types/tool';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminToolsPage() {
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: toolsData, error } = useSWR('/api/tools', fetcher, {
    revalidateOnFocus: false,
  });

  const tools: Tool[] = toolsData?.data || [];

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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            工具管理
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            拖拽排序、编辑或删除工具
          </p>
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
    </div>
  );
}
