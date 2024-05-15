import { createClient} from "@supabase/supabase-js";
import {Database} from "./database.types.ts";
// @ts-ignore
const supabaseUrl = (import.meta as unknown).env.VITE_SUPABASE_API_URL;
// @ts-ignore
const supabaseKey = (import.meta as unknown).env.VITE_SUPABASE_API_ANON_KEY;

export const supaClient = createClient<Database>(supabaseUrl, supabaseKey);

supaClient.from('user_profiles').select('*').then(console.log);