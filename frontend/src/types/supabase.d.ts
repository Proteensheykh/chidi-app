declare module '@supabase/ssr' {
  import { SupabaseClient } from '@supabase/supabase-js';
  
  export function createServerClient(
    supabaseUrl: string,
    supabaseKey: string,
    options: {
      cookies: {
        get(name: string): string | undefined;
        set(name: string, value: string, options: any): void;
        remove(name: string, options: any): void;
      };
    }
  ): SupabaseClient;
  
  export function createBrowserClient(
    supabaseUrl: string,
    supabaseKey: string
  ): SupabaseClient;
}
