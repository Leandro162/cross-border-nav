'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, ExternalLink, Loader2 } from 'lucide-react';
import { LinkItem, Category } from '@/lib/types';

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCategoryIds, setVisibleCategoryIds] = useState<Set<string>>(new Set());

  // 分类标题的引用，用于滚动监听
  const categorySectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLinks();
  }, [links, selectedCategory, searchQuery]);

  // 滚动监听 - 自动高亮当前可见的分类
  useEffect(() => {
    const handleScroll = () => {
      const categorySections = Array.from(categorySectionRefs.current.entries());
      const newVisibleIds = new Set<string>();

      categorySections.forEach(([categoryId, element]) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        // 当分类区域进入视口中心时高亮
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          newVisibleIds.add(categoryId);
        }
      });

      // 如果有可见的分类，高亮第一个
      if (newVisibleIds.size > 0) {
        const firstVisible = Array.from(newVisibleIds)[0];
        if (firstVisible !== selectedCategory) {
          setSelectedCategory(firstVisible);
        }
      }

      setVisibleCategoryIds(newVisibleIds);
    };

    // 使用节流优化性能
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // 初始检查

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [linksRes, categoriesRes] = await Promise.all([
        fetch('/api/links'),
        fetch('/api/categories'),
      ]);
      const linksData = await linksRes.json();
      const categoriesData = await categoriesRes.json();
      setLinks(linksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLinks = () => {
    let filtered = links;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(link => link.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        link =>
          link.title.toLowerCase().includes(query) ||
          link.description.toLowerCase().includes(query) ||
          link.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredLinks(filtered);
  };

  // 按分类分组链接
  const getLinksByCategory = () => {
    const grouped: Record<string, LinkItem[]> = {};
    links.forEach(link => {
      if (!grouped[link.category]) {
        grouped[link.category] = [];
      }
      grouped[link.category].push(link);
    });
    return grouped;
  };

  // 搜索时显示过滤结果，否则显示按分类分组的结果
  const displayLinks = searchQuery ? filteredLinks : null;
  const groupedLinks = searchQuery ? null : getLinksByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">跨境工具导航</h1>
            <p className="text-slate-500 text-sm mt-0.5">分享最实用的跨境工具和资源</p>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索工具、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧分类边栏 */}
          <aside className="flex-shrink-0 w-56">
            <div className="glass-card rounded-2xl p-4 sticky top-36">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">分类</h2>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                    selectedCategory === 'all'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <span className="text-lg">🏠</span>
                  <span className="font-medium">全部</span>
                </button>
                {categories.map(cat => {
                  const count = links.filter(link => link.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        const section = categorySectionRefs.current.get(cat.id);
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                        selectedCategory === cat.id
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium text-sm">{cat.name}</span>
                      {count > 0 && (
                        <span className="ml-auto text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{count}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* 右侧内容区域 */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={40} />
              </div>
            ) : displayLinks ? (
              // 搜索结果
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayLinks.map(link => (
                  <LinkCard key={link.id} link={link} categories={categories} />
                ))}
              </div>
            ) : Object.keys(groupedLinks || {}).length === 0 ? (
              <div className="text-center py-20 text-slate-400 glass-card rounded-2xl">
                <p className="text-lg">暂无链接</p>
              </div>
            ) : (
              // 按分类显示
              <div className="space-y-8">
                {categories.map(cat => {
                  const catLinks = groupedLinks?.[cat.id] || [];
                  if (catLinks.length === 0) return null;

                  return (
                    <div
                      key={cat.id}
                      ref={el => {
                        if (el) categorySectionRefs.current.set(cat.id, el);
                      }}
                      className="category-section"
                    >
                      {/* 分类标题 */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{cat.icon}</span>
                        <h2 className="text-xl font-bold text-slate-800">{cat.name}</h2>
                        <span className="text-sm text-slate-400">({catLinks.length})</span>
                      </div>

                      {/* 该分类的链接 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {catLinks.map(link => (
                          <LinkCard key={link.id} link={link} categories={categories} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        <p>Cross-Border Tools Navigator © 2024</p>
      </footer>
    </div>
  );
}

function LinkCard({ link, categories }: { link: LinkItem; categories: Category[] }) {
  const category = categories.find(c => c.id === link.category);
  const [thumbUrl, setThumbUrl] = useState<string>(link.image || link.icon);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 滚动动画 - 使用 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setThumbUrl(link.image || link.icon);
    setImageError(false);
  }, [link.image, link.icon]);

  const hasThumbnail = link.image && !imageError;

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* 横向布局 */}
      <div className="flex">
        {/* 左侧缩略图区域 */}
        <div className="flex-shrink-0 w-28 h-28 bg-slate-100 relative overflow-hidden">
          {hasThumbnail ? (
            <img
              src={thumbUrl}
              alt={link.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : link.icon && !imageError ? (
            <div className="w-full h-full flex items-center justify-center p-3">
              <img
                src={link.icon}
                alt={link.title}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-100">
              {category?.icon || '🔗'}
            </div>
          )}
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div className="min-w-0">
            {/* 标题 */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-800 font-medium hover:text-blue-600 transition-colors"
            >
              <span className="truncate text-sm">{link.title}</span>
              <ExternalLink size={12} className="flex-shrink-0 opacity-0 group-hover:opacity-100" />
            </a>

            {/* 描述 */}
            <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">{link.description || '暂无描述'}</p>
          </div>

          {/* 底部：标签 */}
          <div className="flex items-center justify-between mt-2">
            {/* 标签 */}
            {link.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {link.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
                {link.tags.length > 2 && (
                  <span className="text-xs text-slate-400 px-1">+{link.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
