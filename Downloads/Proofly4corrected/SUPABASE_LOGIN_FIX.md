# Proofly4 — Supabase Login Fix

This version keeps Supabase Email/Password authentication and improves the post-confirmation flow.

## Before running
Create `.env.local` in the project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

## Supabase settings
Authentication → Providers → Email: enable Email/Password.

For fastest demo submission, you may turn OFF **Confirm email**. Then registration signs the user in immediately.

If Confirm email is ON, the registration email redirects back to the current app origin. Make sure the app origin is allowed in:
Authentication → URL Configuration → Redirect URLs.

For localhost, add your actual URL, e.g.:
http://localhost:5173/

## What was fixed
- Email signup now sends users back to the running Proofly app after confirmation.
- Existing Supabase sessions are restored automatically.
- Login uses Supabase `signInWithPassword`.
- If the auth trigger did not create a profile, Proofly creates the missing profile automatically after login.
- No Supabase secret keys are included in this ZIP.
