// ─────────────────────────────────────────────
//  SUPABASE CONFIG
//  Remplace les deux valeurs ci-dessous
//  par celles de ton projet Supabase
// ─────────────────────────────────────────────
const SUPABASE_URL = 'https://XXXXXXXXXXXXXXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXX';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
