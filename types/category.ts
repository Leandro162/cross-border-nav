export interface Category {
  id: string;
  name: string;
  slug: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}
