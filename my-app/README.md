## Recruitment Platform Frontend

Next.js 16.0.0 + React 19.2.0 client for the recruitment platform. All HTTP calls go through the Spring Cloud Gateway so authentication, rate limiting, and routing rules stay centralized.

### Prerequisites

- Node.js >= 20.x
- Backend stack running with the gateway exposed (default `http://localhost:8080`)

### Environment variables

Create a `.env.local` file using the provided example:

```bash
cp .env.local.example .env.local
```

| Key                        | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | Gateway base URL (e.g. `http://localhost:8080`). |

The helper in `lib/api.ts` throws if the variable is missing so misconfiguration is caught during development.

### Scripts

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run lint     # Run ESLint with the Next 16 config
npm run build    # Create production build
npm run start    # Serve the production build
```

### Project structure

- `app/page.tsx` – landing page with entry points for recruiters/admins and candidates.
- `app/(auth)/auth/*` – server actions + forms for login and registration.
- `app/dashboard`, `app/candidate` – secured segments guarded by cookie-aware layouts.
- `components/layout/*` – global navigation, navigation actions, account menu.
- `components/ui/*` – reusable UI primitives aligned with the design system.
- `lib/api.ts`, `lib/session.ts`, `lib/routes.ts` – gateway-aware fetch wrapper, cookie helpers, and route constants.
- `app/api/**` – proxy routes that forward to the gateway (e.g. `/api/jobs/public`, `/api/applications/my`).

### Server data fetching example

```ts
import { apiFetch } from "@/lib/api";

export async function getPublicJobs() {
  const response = await apiFetch("/api/jobs/public");
  return response.json();
}
```

> `apiFetch` is designed for server components, server actions, and route handlers. For client-side
> needs, use the provided `/api/**` proxies so HTTP-only cookies remain secure.

### Styling

Tailwind CSS v4 is configured in `app/globals.css`. Extend the inline theme or add component-level classes as new screens roll out.
