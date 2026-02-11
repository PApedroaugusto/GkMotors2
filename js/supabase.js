

// SUPABASE FRONTEND CONFIG

const SUPABASE_URL = "https://rgdhlezdnioegetsbbht.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGhsZXpkbmlvZWdldHNiYmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTc2MDQsImV4cCI6MjA4NjM3MzYwNH0.JwkcqOaEcRmO1N5SHJdN0lfjKurVIKrPE-XKMNWHyjk";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("✅ Supabase FRONT inicializado");
