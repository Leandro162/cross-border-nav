import mongoose, { Schema, models } from 'mongoose';
import { ToolDocument } from '@/types/tool';

const ToolSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Tool name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    order: {
      type: Number,
      default: 0,
    },
    hasDeal: {
      type: Boolean,
      default: false,
    },
    dealCount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ToolSchema.index({ categoryId: 1, order: 1 });
ToolSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to ensure order is set
ToolSchema.pre('save', async function () {
  if (this.isNew && this.order === 0) {
    const count = await mongoose.model('Tool').countDocuments({ categoryId: this.categoryId });
    this.order = count;
  }
});

const Tool = models.Tool || mongoose.model<ToolDocument>('Tool', ToolSchema);

export default Tool;
