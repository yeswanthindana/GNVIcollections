-- GNVI Admin Extensions
-- Run this to support History Tracking and Customer Requests

-- 1. Create product_history table for price/status changes
create table if not exists product_history (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  product_name text,
  change_type text check (change_type in ('Price Change', 'Status Change', 'Name Change', 'Category Change', 'SKU Change', 'Creation', 'Update')),
  old_value text,
  new_value text,
  changed_at timestamptz default now()
);

-- 2. Create customer_requests table
create table if not exists customer_requests (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_email text not null,
  request_type text default 'General Inquiry',
  message text not null,
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Resolved', 'Closed')),
  created_at timestamptz default now()
);

-- 3. Trigger for tracking all critical product changes automatically
create or replace function track_product_changes()
returns trigger as $$
begin
  -- Track Creation
  if (TG_OP = 'INSERT') then
    insert into product_history (product_id, product_name, change_type, old_value, new_value)
    values (new.id, new.name, 'Creation', null, 'Product added to inventory');
    return new;
  end if;

  -- Track Price Change
  if (old.current_price != new.current_price) then
    insert into product_history (product_id, product_name, change_type, old_value, new_value)
    values (new.id, new.name, 'Price Change', old.current_price::text, new.current_price::text);
  end if;

  -- Track Stock Status Change
  if (old.stock_status != new.stock_status) then
    insert into product_history (product_id, product_name, change_type, old_value, new_value)
    values (new.id, new.name, 'Status Change', old.stock_status, new.stock_status);
  end if;

  -- Track Name Change
  if (old.name != new.name) then
    insert into product_history (product_id, product_name, change_type, old_value, new_value)
    values (new.id, new.name, 'Name Change', old.name, new.name);
  end if;

  -- Track SKU Change
  if (old.sku is distinct from new.sku) then
    insert into product_history (product_id, product_name, change_type, old_value, new_value)
    values (new.id, new.name, 'SKU Change', coalesce(old.sku, 'None'), coalesce(new.sku, 'None'));
  end if;

  -- Track Category Change
  if (old.category_id is distinct from new.category_id) then
    insert into product_history (product_id, product_name, change_type, old_value, new_value)
    values (new.id, new.name, 'Category Change', 
      coalesce((select name from categories where id = old.category_id), 'No Category'),
      coalesce((select name from categories where id = new.category_id), 'No Category')
    );
  end if;

  return new;
end;
$$ language plpgsql;

-- 4. Attach the trigger to the products table
drop trigger if exists on_product_update on products;
create trigger on_product_update
  after update on products
  for each row
  execute function track_product_changes();

drop trigger if exists on_product_insert on products;
create trigger on_product_insert
  after insert on products
  for each row
  execute function track_product_changes();
