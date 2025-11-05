import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  images: any;
  rating: number;
  gender?: string;
  variants?: ProductVariant[];
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_modifier?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  created_at: string;
}
