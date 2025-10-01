/*
  # Initial E-commerce Schema

  1. New Tables
    - `profiles` - User profiles with role management
    - `products` - Product catalog with merchant ownership
    - `favorites` - Client favorite products
    - `cart_items` - Shopping cart items
    - `orders` - Order management system
    - `messages` - Real-time messaging system
    
  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure messaging between users
    
  3. Storage
    - Create bucket for product images and avatars
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  role text DEFAULT 'client' CHECK (role IN ('client', 'merchant')),
  phone text,
  whatsapp_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, product_id)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  merchant_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  total decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Merchants can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Clients can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = client_id);

-- Cart policies
CREATE POLICY "Clients can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = client_id);

-- Orders policies
CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = merchant_id);

CREATE POLICY "Clients can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Merchants can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = merchant_id);

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user);

-- Create indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_messages_from_user ON messages(from_user);
CREATE INDEX idx_messages_to_user ON messages(to_user);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('products', 'avatars'));

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('products', 'avatars'));

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[1]);