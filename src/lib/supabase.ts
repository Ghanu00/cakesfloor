import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gbtoouoledljkpwhjtjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdidG9vdW9sZWRsamtwd2hqdGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTA1NzYsImV4cCI6MjEwNDc4NjU3Nn0.mr9pAdDrtoFADYS3SEQRhN7ggxHtBM38pymSB1-DEdQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
