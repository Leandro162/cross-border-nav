import { Document } from 'mongoose';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDocument extends Omit<Category, '_id'>, Document {}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}
