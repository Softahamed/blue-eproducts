-- Run this once in Supabase Dashboard > SQL Editor.
-- The publish error means these tables do not exist in the connected project.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  category text not null check (category in ('ebook', 'template', 'tshirt', 'calendar')),
  price numeric(12, 2) not null default 0 check (price >= 0),
  image text not null,
  description text not null,
  file_url text
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_email text not null,
  amount numeric(12, 2) not null default 0,
  slip_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  item_name text not null
);

-- Add fields when an older version of either table already exists.
alter table public.products add column if not exists file_url text;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists amount numeric(12, 2) default 0;
alter table public.orders add column if not exists slip_url text;
alter table public.orders add column if not exists status text default 'pending';
alter table public.orders add column if not exists item_name text;

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
on public.products for select to anon, authenticated using (true);

drop policy if exists "Public can submit orders" on public.orders;
create policy "Public can submit orders"
on public.orders for insert to anon, authenticated with check (true);

drop policy if exists "Public can view orders for admin demo" on public.orders;
create policy "Public can view orders for admin demo"
on public.orders for select to anon, authenticated using (true);

drop policy if exists "Public can update orders for admin demo" on public.orders;
create policy "Public can update orders for admin demo"
on public.orders for update to anon, authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('payment-slips', 'payment-slips', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('product-assets', 'product-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can upload payment slips" on storage.objects;
create policy "Public can upload payment slips"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'payment-slips');

drop policy if exists "Public can view payment slips" on storage.objects;
create policy "Public can view payment slips"
on storage.objects for select to anon, authenticated
using (bucket_id = 'payment-slips');

drop policy if exists "Public can upload product assets" on storage.objects;
create policy "Public can upload product assets"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'product-assets');

drop policy if exists "Public can view product assets" on storage.objects;
create policy "Public can view product assets"
on storage.objects for select to anon, authenticated
using (bucket_id = 'product-assets');

-- Refresh PostgREST's schema cache after creating the tables.
notify pgrst, 'reload schema';
