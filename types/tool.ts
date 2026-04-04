import { Category } from './category';

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  logo_url: string | null;
  category_id: string;
  categories?: Category;
  order_num: number;
  has_deal: boolean;
  deal_count: number | null;
  created_at: string;
  updated_at: string;
}

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
