-- Create indexes for better query performance
create index if not exists idx_properties_owner_id on public.properties(owner_id);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_listing_type on public.properties(listing_type);
create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_properties_location on public.properties(latitude, longitude);

create index if not exists idx_property_images_property_id on public.property_images(property_id);

create index if not exists idx_maintenance_requests_property_id on public.maintenance_requests(property_id);
create index if not exists idx_maintenance_requests_requester_id on public.maintenance_requests(requester_id);
create index if not exists idx_maintenance_requests_provider_id on public.maintenance_requests(provider_id);
create index if not exists idx_maintenance_requests_status on public.maintenance_requests(status);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_property_id on public.transactions(property_id);
create index if not exists idx_transactions_status on public.transactions(status);
