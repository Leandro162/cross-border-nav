'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/layout/SearchBar';
import CategoryFilter from '@/components/category/CategoryFilter';
import ToolGrid from '@/components/tool/ToolGrid';
import { Tool } from '@/types/tool';
import { Category } from '@/types/category';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Build query params
  const queryParams = new URLSearchParams();
  if (selectedCategory !== 'all') {
    queryParams.append('category', selectedCategory);
  }
  if (searchQuery) {
    queryParams.append('search', searchQuery);
  }

  const { data: toolsData, isLoading: toolsLoading } = useSWR(
    `/api/tools?${queryParams.toString()}`,
    fetcher
  );

  const { data: categoriesData } = useSWR('/api/categories', fetcher);

  const tools: Tool[] = toolsData?.data || [];
  const categories: Category[] = categoriesData?.data || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-12 text-center sm:mb-16">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
            跨境出海工具导航
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            发现最好的跨境出海工具和资源，助力您的业务增长
          </p>
        </section>

        {/* Search and Filter Section */}
        <section className="mb-8 space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索工具..."
          />
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>

        {/* Tools Grid */}
        <section>
          {toolsLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
          ) : (
            <ToolGrid tools={tools} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-600 dark:text-zinc-400 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} CrossBorder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
