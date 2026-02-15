-- 🚨 RUN THIS SCRIPT TO ENABLE ORDER TRACKING IN ACTIVITY LOG 🚨

-- 1. Update the Constraint to allow Order events
alter table product_history drop constraint if exists product_history_change_type_check;
alter table product_history add constraint product_history_change_type_check 
check (change_type in (
    'Price Change', 
    'Status Change', 
    'Name Change', 
    'Category Change', 
    'SKU Change', 
    'Creation', 
    'Update', 
    'Deletion',
    'Order Status Change' -- New permitted value
));

-- 2. Create Function to Track Order Changes
create or replace function track_order_updates()
returns trigger as $$
begin
  -- Track Status Changes
  if (old.status is distinct from new.status) then
    insert into product_history (
        product_id, 
        product_name, 
        change_type, 
        old_value, 
        new_value
    )
    values (
        null, -- No product ID for orders
        'Order #' || substring(new.id::text, 1, 8) || ' (' || new.customer_name || ')', 
        'Order Status Change', 
        old.status, 
        new.status
    );
  end if;
  return new;
end;
$$ language plpgsql;

-- 3. Attach Trigger to Orders Table
drop trigger if exists on_order_status_update on orders;
create trigger on_order_status_update
  after update on orders
  for each row
  execute function track_order_updates();
