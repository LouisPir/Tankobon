import { createClient } from '@supabase/supabase-js';
import ENV from '../config/env';

const supabaseUrl = ENV.supabaseUrl;
const supabaseAnonKey = ENV.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);