'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/types/category';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <motion.button
        key="all"
        onClick={() => onSelectCategory('all')}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selectedCategory === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        全部
      </motion.button>
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  );
}
