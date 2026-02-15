-- Drop existing policies to ensure a clean slate
drop policy if exists "Public can create orders" on orders;
drop policy if exists "Public can add items" on order_items;
drop policy if exists "Admins view orders" on orders;
drop policy if exists "Admins view items" on order_items;

-- Enable RLS (idempotent)
alter table orders enable row level security;
alter table order_items enable row level security;

-- 1. Allow Public (Anon) and Authenticated users to INSERT
create policy "Public can create orders" 
on orders for insert 
to anon, authenticated 
with check (true);

create policy "Public can add items" 
on order_items for insert 
to anon, authenticated 
with check (true);

-- 2. Allow Admins (Authenticated) to SELECT (View)
create policy "Admins view orders" 
on orders for select 
to authenticated 
using (true);

create policy "Admins view items" 
on order_items for select 
to authenticated 
using (true);
