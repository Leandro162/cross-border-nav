'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Loader2, Check, Settings } from 'lucide-react';
import { Category } from '@/lib/types';

interface MetaData {
  title: string;
  description: string;
  icon: string;
  image: string;
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [message, setMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchMetadata = async () => {
    if (!url) {
      setMessage('请输入网址');
      return;
    }

    setFetching(true);
    setMessage('');

    try {
      const response = await fetch('/api/fetch-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setMetaData(data);
        setMessage('✓ 成功获取网站信息');
      } else {
        setMessage('获取失败：' + (data.error || '未知错误'));
      }
    } catch (error) {
      setMessage('获取失败，请稍后重试');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url || !category) {
      setMessage('请填写必填项');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title: metaData?.title || '',
          description: metaData?.description || '',
          icon: metaData?.icon || '',
          image: metaData?.image || '',
          category,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
        }),
      });

      if (response.ok) {
        setMessage('✓ 链接添加成功！');
        setUrl('');
        setTags('');
        setMetaData(null);
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setMessage('添加失败，请重试');
      }
    } catch (error) {
      setMessage('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors inline-flex"
            >
              <ArrowLeft size={20} />
              <span>返回首页</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Settings size={20} />
              <span>分类管理</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-4">添加新链接</h1>
          <p className="text-slate-500 text-sm mt-1">输入网址自动获取网站信息</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div className="glass-card rounded-xl p-6">
              <label className="block text-slate-700 font-medium mb-2">
                网址 URL <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={fetchMetadata}
                  disabled={fetching || !url}
                  className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {fetching ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Plus size={20} />
                      <span>获取</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Meta Data Preview */}
            {metaData && (
              <div className="glass-card rounded-xl overflow-hidden border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-600 p-4 pb-2">
                  <Check size={20} />
                  <span className="font-medium">已获取网站信息</span>
                </div>

                {/* Thumbnail Preview */}
                {metaData.image && (
                  <div className="px-4 pb-3">
                    <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={metaData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 pt-0 flex items-start gap-4">
                  {metaData.icon && (
                    <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={metaData.icon} alt="" className="w-8 h-8 object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-medium">{metaData.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{metaData.description || '无描述'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Category Selection */}
            <div className="glass-card rounded-xl p-6">
              <label className="block text-slate-700 font-medium mb-3">
                分类 <span className="text-red-500">*</span>
              </label>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>暂无分类，请先</p>
                  <Link
                    href="/admin/categories"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    创建分类
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        category === cat.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="ml-2">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Input */}
            <div className="glass-card rounded-xl p-6">
              <label className="block text-slate-700 font-medium mb-2">标签</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分隔，如：工具, 免费, 推荐"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-slate-500 text-sm mt-2">多个标签用逗号分隔</p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${message.includes('成功') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>添加中...</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>添加链接</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
