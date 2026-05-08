-- Run this in the Supabase SQL editor

-- Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  brand text not null,
  model text not null,
  variant text,
  size text,
  colors text,
  category text not null,
  created_at timestamp default now()
);

-- Specs table
create table if not exists specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  category text not null,
  spec_name text not null,
  spec_value text,
  verified boolean default false,
  updated_at timestamp default now(),
  unique(product_id, category, spec_name)
);

-- Known spec columns table
create table if not exists spec_columns (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  spec_name text not null unique,
  spec_type text not null,
  created_at timestamp default now()
);

-- App state table
create table if not exists app_state (
  key text primary key,
  value text not null
);

-- Enable realtime on all tables
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table specs;
alter publication supabase_realtime add table spec_columns;
alter publication supabase_realtime add table app_state;
