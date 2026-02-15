-- 🚨 RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX ORDER STATUS ISSUES 🚨

-- 1. Remove ANY existing status constraints (to be safe against auto-generated names)
do $$ 
declare 
    r record;
begin 
    for r in (select constraint_name from information_schema.check_constraints where constraint_name like 'orders_status_%') loop
        execute 'alter table orders drop constraint ' || quote_ident(r.constraint_name);
    end loop;
end $$;

-- 2. Add the NEW, correct constraint allowing all our new statuses
alter table orders add constraint orders_status_check 
check (status in (
  'Processing', 
  'Confirmed', 
  'Packing', 
  'Ready for Shipping', 
  'Shipped', 
  'Delivered', 
  'Cancelled', 
  'Rejected'
));

-- 3. Ensure columns exist (just in case)
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists tracking_id text;
alter table orders add column if not exists rejection_reason text;
