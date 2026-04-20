import { createClient } from '@supabase/supabase-js';

// Supabase client for the browser (frontend)
// Uses the anon key — safe to expose publicly
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

export const getSupabase = () => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnon) {
      console.warn('Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
      return null;
    }
    supabase = createClient(supabaseUrl, supabaseAnon);
  }
  return supabase;
};

// ── Real-time subscription helpers ────────────────────────────────────────

// Listen for new orders (used in admin dashboard)
export const subscribeToOrders = (callback) => {
  const sb = getSupabase();
  if (!sb) return null;
  return sb
    .channel('orders-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .subscribe();
};

// Listen for product stock changes (used on product pages)
export const subscribeToProducts = (callback) => {
  const sb = getSupabase();
  if (!sb) return null;
  return sb
    .channel('products-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, callback)
    .subscribe();
};

// Listen for payment updates
export const subscribeToPayments = (callback) => {
  const sb = getSupabase();
  if (!sb) return null;
  return sb
    .channel('payments-channel')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payments' }, callback)
    .subscribe();
};

// Unsubscribe from a channel
export const unsubscribe = (channel) => {
  const sb = getSupabase();
  if (sb && channel) sb.removeChannel(channel);
};
