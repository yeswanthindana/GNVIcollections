-- GNVI Order System Schema

-- 1. Create Orders Table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_email text not null,
  customer_address text not null,
  total_amount numeric not null,
  status text default 'Processing' check (status in ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
  created_at timestamptz default now()
);

-- 2. Create Order Items Table (Junction Table)
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null, -- Store name for history even if product deleted
  quantity integer default 1,
  price_at_time numeric not null
);

-- 3. Secure Orders (RLS)
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public can verify orders (insert)
create policy "Public can create orders" on orders for insert with check (true);
create policy "Public can add items" on order_items for insert with check (true);

-- Only Admins can view orders
create policy "Admins view orders" on orders for select to authenticated using (true);
create policy "Admins view items" on order_items for select to authenticated using (true);
