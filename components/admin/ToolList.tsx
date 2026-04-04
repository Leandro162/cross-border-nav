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
import SortableToolItem from './SortableToolItem';
import { Tool } from '@/types/tool';

interface ToolListProps {
  tools: Tool[];
  onReorder: (items: { id: string; order: number }[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (tool: Tool) => void;
}

export default function ToolList({
  tools,
  onReorder,
  onDelete,
  onEdit,
}: ToolListProps) {
  const [items, setItems] = useState(tools);
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
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Reorder items with new order values
      const reorderData = newItems.map((item, index) => ({
        id: item._id,
        order: index,
      }));

      setIsReordering(true);
      try {
        await onReorder(reorderData);
      } catch (error) {
        console.error('Failed to reorder:', error);
        // Revert on error
        setItems(tools);
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setItems(items.filter((item) => item._id !== id));
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
          items={items.map((item) => item._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((tool) => (
              <SortableToolItem
                key={tool._id}
                tool={tool}
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
