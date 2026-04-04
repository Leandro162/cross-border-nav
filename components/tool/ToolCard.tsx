'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tool } from '@/types/tool';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
    >
      <Link
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-200 hover:border-blue-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900"
      >
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {tool.logo_url ? (
              <Image
                src={tool.logo_url}
                alt={tool.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-400">
                {tool.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
              {tool.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {tool.description}
            </p>

            {/* Deal Badge */}
            {tool.has_deal && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {tool.deal_count ? `${tool.deal_count} ` : ''}deal
                {tool.deal_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
