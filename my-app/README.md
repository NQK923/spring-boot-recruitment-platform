## Recruitment Platform Frontend

Next.js 16.0.0 + React 19.2.0 client for the recruitment platform. All HTTP calls go through the Spring Cloud Gateway so authentication, rate limiting, and routing rules stay centralized.

### Prerequisites

- Node.js ≥ 20.x
- Backend stack running with the gateway exposed (default `http://localhost:8080`)

### Environment variables

Create a `.env.local` file using the provided example:

```bash
cp .env.local.example .env.local
```

| Key                        | Description                           |
| -------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Gateway base URL (e.g. http://localhost:8080). |

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
- `components/ui/button.tsx`, `components/ui/input.tsx` – reusable UI primitives aligned with the design system.
- `lib/api.ts` – gateway-aware fetch wrapper (`credentials: "include"`) for both server and client calls.
- `app/(routes)` – add feature-specific layouts and pages (auth, dashboard, candidate portal, etc.).

### Data fetching example

```ts
import { apiFetch } from "@/lib/api";

export async function getPublicJobs() {
  const response = await apiFetch("/api/jobs/public");
  return response.json();
}
```

### Styling

Tailwind CSS v4 is configured in `app/globals.css`. Extend the inline theme or add component-level classes as new screens roll out.
