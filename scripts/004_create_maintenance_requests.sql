-- Create maintenance requests table
create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  provider_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  category text check (category in ('plumbing', 'electrical', 'hvac', 'carpentry', 'painting', 'cleaning', 'landscaping', 'other')) not null,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) default 'pending',
  estimated_cost decimal(10, 2),
  actual_cost decimal(10, 2),
  scheduled_date timestamp with time zone,
  completed_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.maintenance_requests enable row level security;

-- Requesters and property owners can view their requests
create policy "maintenance_requests_select_own"
  on public.maintenance_requests for select
  using (
    auth.uid() = requester_id or
    auth.uid() = provider_id or
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );

-- Anyone can create maintenance requests
create policy "maintenance_requests_insert_all"
  on public.maintenance_requests for insert
  with check (auth.uid() = requester_id);

-- Requesters, providers, and property owners can update
create policy "maintenance_requests_update_own"
  on public.maintenance_requests for update
  using (
    auth.uid() = requester_id or
    auth.uid() = provider_id or
    exists (
      select 1 from public.properties
      where id = property_id and owner_id = auth.uid()
    )
  );
