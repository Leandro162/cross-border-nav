'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { Category } from '@/types/category';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SubmitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    categoryId: '',
    hasDeal: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  const { data: categoriesData } = useSWR('/api/categories', fetcher);
  const categories: Category[] = categoriesData?.data || [];

  // Fetch metadata when URL changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.url && isValidUrl(formData.url) && !formData.description) {
        try {
          setFetchingMetadata(true);
          const response = await fetch('/api/metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.url }),
          });
          const data = await response.json();
          if (data.success && data.data) {
            setFormData((prev) => ({
              ...prev,
              name: data.data.title || prev.name,
              description: data.data.description || prev.description,
            }));
          }
        } catch (error) {
          console.error('Failed to fetch metadata:', error);
        } finally {
          setFetchingMetadata(false);
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.url]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url || !formData.categoryId) {
      alert('请填写所有必填字段');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          url: formData.url,
          categoryId: formData.categoryId,
          hasDeal: formData.hasDeal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('工具提交成功！');
        router.push('/');
      } else {
        alert(data.error || '提交失败，请重试');
      }
    } catch (error) {
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: '选择分类' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            提交工具
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            分享您发现的优秀跨境出海工具
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="工具名称 *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="输入工具名称"
            required
          />

          <Input
            label="工具链接 *"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com"
            required
          />
          {fetchingMetadata && (
            <p className="text-sm text-blue-600">正在获取网页信息...</p>
          )}

          <Textarea
            label="工具描述 *"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="简要描述这个工具的功能和特点"
            rows={4}
            required
          />

          <Select
            label="分类 *"
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            options={categoryOptions}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasDeal"
              checked={formData.hasDeal}
              onChange={(e) =>
                setFormData({ ...formData, hasDeal: e.target.checked })
              }
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="hasDeal"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              此工具有优惠/促销活动
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || fetchingMetadata}
            >
              {loading ? '提交中...' : '提交工具'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
