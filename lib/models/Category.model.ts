import mongoose, { Schema, models } from 'mongoose';
import { CategoryDocument } from '@/types/category';

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
CategorySchema.index({ order: 1 });
CategorySchema.index({ slug: 1 });

const Category = models.Category || mongoose.model<CategoryDocument>('Category', CategorySchema);

export default Category;
