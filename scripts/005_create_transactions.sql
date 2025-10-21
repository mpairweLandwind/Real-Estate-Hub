-- Create transactions table for payments
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  maintenance_request_id uuid references public.maintenance_requests(id) on delete set null,
  amount decimal(12, 2) not null,
  currency text default 'USD',
  payment_method text check (payment_method in ('paypal', 'mtn_mobile_money', 'bank_transfer', 'cash')) not null,
  transaction_type text check (transaction_type in ('rent', 'sale', 'maintenance', 'deposit', 'refund')) not null,
  status text check (status in ('pending', 'completed', 'failed', 'refunded')) default 'pending',
  payment_reference text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

-- Users can view their own transactions
create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Users can create their own transactions
create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- Users can update their own transactions
create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id);
