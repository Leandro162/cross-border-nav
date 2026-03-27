'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Check,
  X,
  LogOut,
  GripVertical,
  Save
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category } from '@/lib/types';

interface SortableCategory extends Category {
  tempId?: string;
}

function SortableItem({
  category,
  onEdit,
  onDelete,
}: {
  category: SortableCategory;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.tempId || category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card rounded-xl p-5 hover:border-slate-300 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1"
          >
            <GripVertical size={20} />
          </button>
          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-3xl">
            {category.icon}
          </div>
          <div>
            <h3 className="text-slate-800 font-medium text-lg">{category.name}</h3>
            <p className="text-slate-500 text-sm mt-1">
              {category.description || '暂无描述'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<SortableCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      setAuthChecked(true);
      fetchCategories();
    } catch (error) {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchCategories();
    }
  }, [authChecked]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', icon: '', description: '' });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage(editingId ? '✓ 分类更新成功' : '✓ 分类添加成功');
        resetForm();
        fetchCategories();
      } else {
        const data = await response.json();
        setMessage('操作失败：' + (data.error || '未知错误'));
      }
    } catch (error) {
      setMessage('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      description: category.description,
    });
    setEditingId(category.id);
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        '确定要删除这个分类吗？如果该分类下有链接，将无法删除。'
      )
    )
      return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✓ 分类删除成功');
        fetchCategories();
      } else {
        const data = await response.json();
        setMessage('删除失败：' + (data.error || '未知错误'));
      }
    } catch (error) {
      setMessage('删除失败，请重试');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(
          (item) => (item.tempId || item.id) === active.id
        );
        const newIndex = items.findIndex(
          (item) => (item.tempId || item.id) === over.id
        );

        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
    }
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    setMessage('');

    try {
      const categoriesData = categories.map((cat, index) => ({
        id: cat.id,
        sortOrder: index,
      }));

      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: categoriesData }),
      });

      if (response.ok) {
        setMessage('✓ 排序保存成功');
        setHasChanges(false);
        fetchCategories();
      } else {
        const data = await response.json();
        setMessage('保存失败：' + (data.error || '未知错误'));
      }
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setSavingOrder(false);
    }
  };

  const commonEmojis = [
    '🌐',
    '🔧',
    '📢',
    '💳',
    '💰',
    '📦',
    '🛒',
    '🚀',
    '⚡',
    '🎯',
    '📊',
    '🔍',
    '🌟',
    '💡',
    '🔔',
    '📱',
    '💼',
    '🏪',
    '🎨',
    '📈',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {!authChecked ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="border-b border-slate-200 bg-white/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors inline-flex"
                >
                  <ArrowLeft size={20} />
                  <span>返回添加链接</span>
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">分类管理</h1>
                <div className="flex items-center gap-3">
                  {hasChanges && (
                    <button
                      onClick={handleSaveOrder}
                      disabled={savingOrder}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {savingOrder ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>保存中...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          <span>保存排序</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    <span>添加分类</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span>登出</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.includes('成功')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            {/* Hint for drag and drop */}
            {categories.length > 0 && !showAddForm && !editingId && (
              <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center gap-3">
                <GripVertical size={20} />
                <span>
                  提示：拖拽分类左侧的手柄可以调整排序，调整后点击"保存排序"按钮保存更改
                </span>
              </div>
            )}

            {/* Add/Edit Form */}
            {(showAddForm || editingId) && (
              <div className="glass-card rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  {editingId ? '编辑分类' : '添加新分类'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      分类名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="例如：跨境电商"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      分类图标 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        placeholder="选择或输入 emoji"
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-4 text-2xl">
                        {formData.icon || '🔖'}
                      </div>
                    </div>
                    {/* Quick Emoji Picker */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, icon: emoji })
                          }
                          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg text-xl flex items-center justify-center transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      分类描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="简要描述这个分类的内容"
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>保存中...</span>
                        </>
                      ) : (
                        <>
                          <Check size={20} />
                          <span>
                            {editingId ? '更新分类' : '添加分类'}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X size={20} />
                      <span>取消</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={40} />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20 text-slate-400 glass-card rounded-xl">
                <p>暂无分类，点击右上角添加第一个分类吧！</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categories.map((c) => c.tempId || c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <SortableItem
                        key={category.tempId || category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </main>
        </>
      )}
    </div>
  );
}
