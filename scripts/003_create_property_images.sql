-- Create property images table
create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  image_url text not null,
  is_primary boolean default false,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.property_images enable row level security;

-- Anyone can view property images
create policy "property_images_select_all"
  on public.property_images for select
  using (true);

-- Only property owners can insert images
create policy "property_images_insert_own"
  on public.property_images for insert
  with check (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );

-- Only property owners can delete images
create policy "property_images_delete_own"
  on public.property_images for delete
  using (
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );
