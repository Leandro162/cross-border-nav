'use client';

import React, { useState } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableCategoryItem from './SortableCategoryItem';
import { Category } from '@/types/category';

interface CategoryListProps {
  categories: Category[];
  onReorder: (items: { id: string; order: number }[]) => Promise<void>;
  onDelete: (id: string, name: string) => void;
  onEdit: (category: Category) => void;
}

export default function CategoryList({
  categories,
  onReorder,
  onDelete,
  onEdit,
}: CategoryListProps) {
  const [items, setItems] = useState(categories);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Reorder items with new order values
      const reorderData = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      setIsReordering(true);
      try {
        await onReorder(reorderData);
      } catch (error) {
        console.error('Failed to reorder:', error);
        // Revert on error
        setItems(categories);
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    await onDelete(id, name);
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {isReordering && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          保存排序中...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((category) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
