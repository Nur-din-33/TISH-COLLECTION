const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const getSupabase = () => {
  if (!supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.warn('⚠️  Supabase env vars not set — add SUPABASE_URL and SUPABASE_SERVICE_KEY to .env');
      return null;
    }
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }
  return supabase;
};

module.exports = { getSupabase };
  