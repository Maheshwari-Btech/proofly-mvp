# Proofly Launch Audit — 27 Aug 2026

## Fixed in this release

### Authentication
- Removed the fake `token_verified` access token.
- Auth success now reads the real Supabase session token.
- Registration/login mode now follows the requested modal mode.
- Added real Supabase password-reset email flow.
- Missing Supabase configuration is labeled as Demo Mode instead of pretending to be a live backend.

### Data isolation & persistence
- Authenticated localStorage writes are now user-namespaced.
- Empty Supabase collections no longer fall back to demo records for authenticated users.
- Career Trials are fetched only for the authenticated user.
- Trial submissions and skill progress are persisted.
- User workspace reset clears cloud-owned records while preserving the profile.
- Supabase profile creation is repaired if the auth trigger did not create it.

### Supabase / RLS
- Removed the conflicting legacy 2024 migration from the canonical migration folder.
- Current app schema is now the single 2026 architecture.
- Removed broad profile visibility for SkillSwap.
- SkillSwap reads only intended peer fields.
- SkillSwap visibility is persisted.
- Trial submission policies verify the referenced trial belongs to the same user.
- Opportunity requirement updates verify ownership of the destination opportunity.
- Mentor request table + RLS policies were added.
- Demo seed function execution is restricted to `service_role`.
- Security-definer functions use a controlled search path.
- Career Trial auto-evidence creation is idempotent.

### File storage
- Failed evidence uploads no longer return a temporary browser URL as if it were permanent cloud storage.

### Contact / mentorship
- Contact messages use Zod validation and real Supabase submission.
- Contact failures no longer report false success.
- Mentor requests require authentication and report failures honestly.

### AI backend
- AI endpoint has request-size validation.
- Public AI endpoints have a dependency-free per-IP rate limit.
- Security headers were added.
- Server now respects the hosting provider's `PORT`.
- Gemini API key remains server-side.
- Gemini 3.7 Flash is the configured production model.

### Product integrity
- Removed prefilled fake Career Trial submission content.
- Career Trial submission now requires actual candidate code and implementation notes.
- Hidden the local-only Admin Console from the public user menu.
- Updated misleading demo/sample wording.

## Validation performed

- JSON configuration files parse successfully.
- All relative TypeScript/TSX imports resolve to existing local files.
- Static audit confirms the fake `token_verified` token is gone.
- Static audit confirms `skillswap_profiles` and `anonymous_student` references are gone.
- The build could not be executed inside this environment because the npm registry is not available and dependencies are not cached. The project must therefore run `npm install`, `npm run lint`, and `npm run build` on the user's machine or CI before deployment.

## Launch blocker

A Supabase project that already contains the old 2024 schema should **not** receive the new migrations blindly. The old and new architectures use conflicting table names (`requirements` vs `opportunity_requirements`, `evidence` vs `evidence_items`, etc.). Use a fresh Supabase project for the canonical schema, or perform a deliberate database migration.
