-- Enhance Orders Table
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists tracking_id text;
alter table orders add column if not exists rejection_reason text;

-- Update Status Constraint to include new statuses
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check 
check (status in ('Processing', 'Confirmed', 'Packing', 'Ready for Shipping', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'));
