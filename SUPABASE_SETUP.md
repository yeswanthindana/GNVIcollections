# GNVI Collections - Supabase Setup

Run the following SQL in your Supabase SQL Editor to prepare the database for the luxury ecommerce platform.

## 1. Tables Setup

```sql
-- CRITICAL: Run these to fix "403 Unauthorized / RLS Policy" errors
alter table products disable row level security;
alter table categories disable row level security;
alter table invoices disable row level security;

-- 1. Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- 2. Create products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  original_price numeric not null,
  current_price numeric not null,
  discount_percent numeric generated always as (
    case 
      when original_price > 0 
      then ((original_price - current_price) / original_price) * 100 
      else 0 
    end
  ) stored,
  image_url text,
  available boolean default true,
  category_id uuid references categories(id),
  stock_status text default 'In Stock' check (stock_status in ('In Stock', 'Out of Stock')),
  created_at timestamptz default now()
);

-- 3. Create invoices table
create table invoices (
  id uuid default gen_random_uuid() primary key,
  file_name text not null,
  file_url text not null,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 4. Initial categories
insert into categories (name) values 
('Rings'), 
('Necklaces'), 
('Bracelets'), 
('Earrings'), 
('Watches');

-- 5. Performance Indexes
create index idx_products_category on products(category_id);
create index idx_products_created_at on products(created_at desc);

-- 6. Storage Policies (Fixes "403 Unauthorized" on Image/Invoice Upload)
-- Run this if you get RLS errors during upload
insert into storage.buckets (id, name, public) 
values ('products', 'products', true), ('invoices', 'invoices', true)
on conflict (id) do update set public = true;

create policy "Public Access" on storage.objects for select using ( bucket_id in ('products', 'invoices') );
create policy "Public Upload" on storage.objects for insert with check ( bucket_id in ('products', 'invoices') );
create policy "Public Update" on storage.objects for update with check ( bucket_id in ('products', 'invoices') );
create policy "Public Delete" on storage.objects for delete using ( bucket_id in ('products', 'invoices') );
```

> **Join Error Fix**: If you encounter `Could not find the 'categories' column`, ensure the foreign key relationship is active by running:
> `alter table products add foreign key (category_id) references categories(id);`


## 2. Storage Setup
Create two public buckets in **Storage**:
1. `products`: For product images.
2. `invoices`: For bills/invoices.

Make sure to set public access policies for these buckets so images can be displayed on the frontend.

## 3. Authentication
Ensure **Email Auth** is enabled in Supabase. Your Admin user will be the email/password account you create in the Supabase Dashboard.
