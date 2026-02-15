-- GNVI COLLECTIONS - FIX DATABASE PERMISSIONS
-- Run this SQL in your Supabase SQL Editor to fix "Unable to view catalog" and "Order status lost" issues.

-- 1. FIX CATALOG VISIBILITY (Allow everyone to view products)
alter table products disable row level security;
alter table categories disable row level security;

-- 2. FIX ORDER UPDATES (Allow Owner Mode to update order status)
-- Since the "Owner Mode" (password 1995) does not fully authenticate with Supabase,
-- we must allow the public (anon) role to update orders for the dashboard to work.
alter table orders disable row level security;
alter table order_items disable row level security;

-- 3. ENSURE CUSTOMER REQUESTS WORK
alter table customer_requests disable row level security;

-- 4. VERIFY TABLES EXIST (Safety check)
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  original_price numeric not null,
  current_price numeric not null,
  image_url text,
  category_id uuid references categories(id),
  stock_status text default 'In Stock',
  rating numeric default 5.0,
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  total_amount numeric,
  status text default 'Processing',
  rejection_reason text,
  courier_name text,
  tracking_id text,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid, -- loose reference to keep history even if product deleted
  product_name text,
  quantity integer,
  price_at_time numeric,
  created_at timestamptz default now()
);

create table if not exists customer_requests (
  id uuid default gen_random_uuid() primary key,
  customer_name text,
  customer_email text,
  message text,
  status text default 'Pending',
  created_at timestamptz default now()
);
