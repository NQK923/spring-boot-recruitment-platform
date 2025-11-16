# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE_URL=http://gateway-service:8080
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ARG NEXT_PUBLIC_SUPABASE_PROJECT_URL=https://npynwsukvsxrsmxssikx.supabase.co
ENV NEXT_PUBLIC_SUPABASE_PROJECT_URL=${NEXT_PUBLIC_SUPABASE_PROJECT_URL}
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ARG NEXT_PUBLIC_API_BASE_URL=http://gateway-service:8080
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ARG NEXT_PUBLIC_SUPABASE_PROJECT_URL=https://npynwsukvsxrsmxssikx.supabase.co
ENV NEXT_PUBLIC_SUPABASE_PROJECT_URL=${NEXT_PUBLIC_SUPABASE_PROJECT_URL}
COPY --from=build /app/package*.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
