-- Secure the Customer Requests table
alter table customer_requests enable row level security;

-- 1. Allow anyone (anon) to submit an inquiry
create policy "Allow public submissions"
on customer_requests
for insert
to anon, authenticated
with check (true);

-- 2. Allow admins (authenticated) to view all inquiries
create policy "Allow admins to view inquiries"
on customer_requests
for select
to authenticated
using (true);

-- 3. Allow admins to update status (e.g. Mark as Resolved)
create policy "Allow admins to update inquiries"
on customer_requests
for update
to authenticated
using (true);

-- 4. Allow admins to delete spam
create policy "Allow admins to delete inquiries"
on customer_requests
for delete
to authenticated
using (true);
