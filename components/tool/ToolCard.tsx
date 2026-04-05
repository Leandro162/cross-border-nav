'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tool } from '@/types/tool';

interface ToolCardProps {
  tool: Tool;
}

function getFaviconFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.host;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return '';
  }
}

export default function ToolCard({ tool }: ToolCardProps) {
  const logoSrc = tool.logo_url || getFaviconFromUrl(tool.url);

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
        className="group block h-full rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900"
      >
        <div className="flex h-full flex-col">
          {/* Logo and Name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={tool.name}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'flex h-full w-full items-center justify-center text-xl font-bold text-zinc-400';
                      fallback.textContent = tool.name.charAt(0).toUpperCase();
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-zinc-400">
                  {tool.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3 className="text-base font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400 line-clamp-1">
              {tool.name}
            </h3>
          </div>

          {/* Description */}
          <p className="mb-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
            {tool.description}
          </p>

          {/* Deal Badge */}
          {tool.has_deal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {tool.deal_count ? `${tool.deal_count} ` : ''}deal
              {tool.deal_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
