-- Security review, 13 October 2026.

-- 1. A refund is final. If a late or concurrent checkout.session.completed upserts 'paid' over a stored refund,
--    keep 'refunded', so the webhook's reconcile step can never re-grant access for refunded money.
create or replace function public.keep_refund_final() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.status = 'refunded' then
    new.status := 'refunded';
  end if;
  return new;
end;
$$;
create trigger purchases_refund_final before update on public.purchases
  for each row execute function public.keep_refund_final();
revoke execute on function public.keep_refund_final() from public, anon, authenticated;

-- 2. Buyers read only the purchase columns the account page shows. `raw` holds the whole Checkout Session
--    (billing address, phone) and Stripe ids, which the browser has no use for.
revoke select on public.purchases from authenticated;
grant select (id, product_id, amount_cents, currency, status, created_at) on public.purchases to authenticated;
