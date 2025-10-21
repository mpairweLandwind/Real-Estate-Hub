-- Create properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  property_type text check (property_type in ('apartment', 'house', 'commercial', 'land', 'office')) not null,
  listing_type text check (listing_type in ('rent', 'sale', 'both')) not null,
  price decimal(12, 2) not null,
  bedrooms integer,
  bathrooms integer,
  area_sqft decimal(10, 2),
  address text not null,
  city text not null,
  state text,
  country text not null,
  postal_code text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  status text check (status in ('available', 'rented', 'sold', 'pending')) default 'available',
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.properties enable row level security;

-- Anyone can view available properties
create policy "properties_select_all"
  on public.properties for select
  using (true);

-- Only owners can insert their own properties
create policy "properties_insert_own"
  on public.properties for insert
  with check (auth.uid() = owner_id);

-- Only owners can update their own properties
create policy "properties_update_own"
  on public.properties for update
  using (auth.uid() = owner_id);

-- Only owners can delete their own properties
create policy "properties_delete_own"
  on public.properties for delete
  using (auth.uid() = owner_id);
