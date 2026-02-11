
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://rgdhlezdnioegetsbbht.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGhsZXpkbmlvZWdldHNiYmh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc5NzYwNCwiZXhwIjoyMDg2MzczNjA0fQ.i9NgvCLflcgEW8LSTl6mGeow5UByuowF9Bz5sMToql4";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("É necessário definir SUPABASE_URL e SUPABASE_KEY no .env ou no Render");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = { supabase };
