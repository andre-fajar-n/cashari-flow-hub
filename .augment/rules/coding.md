---
type: "always_apply"
---

# Coding Context: Cashari

## Frontend
- React functional components with hooks.  
- TypeScript strict mode enabled.  
- TanStack Query for server state.  
- TailwindCSS for styling.  
- Icons: Lucide React.  

## Folder Structure
- `/src/lib` → shared utilities (`cn`, formatters, etc.)  
- `/src/hooks` → reusable React hooks  
- `/src/features/*` → feature-based foldering (transactions, goals, etc.)  
- `/src/components` → UI components  

## Mutations & Queries
- Wrap in React Query hooks.  
- Always handle errors with toast notification.  
- Invalidate related queries after success.  

## Supabase Client
- `.from().select().eq()` for simple queries.  
- `.rpc()` for calling Postgres functions.  
- Use typed responses for safety.  

## Code Style
- ESLint + Prettier enforced.  
- Prefer clarity over clever hacks.  
- Reusable components for forms, modals, and lists.  
