'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-bold text-white">CB</span>
            </div>
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              CrossBorder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-700 transition-colors hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
            >
              首页
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
