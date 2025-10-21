import type { Category } from "./category-model";

export interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category_id: number;
  category: Category;
  country_id: number;
  supplier_id: number;
  brand_id: number;
  attributes: Object;
  location: string,
  images: string[];
  seller: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    phone_number: string;
  }
}
