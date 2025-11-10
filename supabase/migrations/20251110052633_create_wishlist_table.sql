/*
  # Create Wishlist Table

  1. New Tables
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on wishlist_items table
    - Add policy for users to read own wishlist items
    - Add policy for users to insert own wishlist items
    - Add policy for users to delete own wishlist items

  3. Indexes
    - Add index on user_id for faster queries
    - Add unique constraint on user_id + product_id
*/

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own wishlist"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
