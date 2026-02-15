-- Database Update: Support for Custom SKUs
-- Run this in your Supabase SQL Editor

-- 1. Add SKU column if it doesn't exist
alter table products add column if not exists sku text unique;

-- 2. Optional: Populate SKU with ID for existing products
update products set sku = id::text where sku is null;
