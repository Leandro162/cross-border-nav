'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ToolCard from './ToolCard';
import { Tool } from '@/types/tool';

interface ToolGridProps {
  tools: Tool[];
}

export default function ToolGrid({ tools }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">No tools found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </motion.div>
  );
}
