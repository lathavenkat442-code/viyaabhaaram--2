# Supabase Setup Instructions

To use the cloud features of Viyabaari, you need to set up your Supabase database.

1.  **Go to the SQL Editor** in your Supabase dashboard.
2.  **Copy and Run** the following SQL commands to create the necessary tables and policies.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create stock_items table
create table if not exists stock_items (
  id uuid primary key,
  user_id uuid references auth.users not null,
  content jsonb not null,
  last_updated bigint
);

-- 2. Create transactions table
create table if not exists transactions (
  id uuid primary key,
  user_id uuid references auth.users not null,
  content jsonb not null
);

-- 3. Enable Row Level Security (RLS)
alter table stock_items enable row level security;
alter table transactions enable row level security;

-- 4. Create Policies for stock_items
create policy "Users can view their own stock items"
on stock_items for select
using (auth.uid() = user_id);

create policy "Users can insert their own stock items"
on stock_items for insert
with check (auth.uid() = user_id);

create policy "Users can update their own stock items"
on stock_items for update
using (auth.uid() = user_id);

create policy "Users can delete their own stock items"
on stock_items for delete
using (auth.uid() = user_id);

-- 5. Create Policies for transactions
create policy "Users can view their own transactions"
on transactions for select
using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
on transactions for insert
with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
on transactions for update
using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
on transactions for delete
using (auth.uid() = user_id);

-- 6. Create Storage Bucket for Images
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 7. Storage Policies
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated users can update"
on storage.objects for update
with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete"
on storage.objects for delete
using ( bucket_id = 'products' and auth.role() = 'authenticated' );
```
