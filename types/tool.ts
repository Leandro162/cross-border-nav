import { Document } from 'mongoose';
import { Category } from './category';

export interface Tool {
  _id: string;
  name: string;
  description: string;
  url: string;
  logoUrl?: string | null;
  categoryId: string;
  category?: Category;
  order: number;
  hasDeal: boolean;
  dealCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolDocument extends Omit<Tool, '_id'>, Document {}

export interface CreateToolInput {
  name: string;
  description: string;
  url: string;
  logoUrl?: string;
  categoryId: string;
  hasDeal?: boolean;
  dealCount?: number;
}

export interface UpdateToolInput extends Partial<CreateToolInput> {
  order?: number;
}
