# --- Build Stage ---
FROM node:22.14.0-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# NEXT_PUBLIC_* vars are baked at build time, so we pass them as build args
ARG NEXT_PUBLIC_API_URL=http://localhost:9092/rosterloop/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# --- Production Stage ---
FROM node:22.14.0-alpine
WORKDIR /app

# Copy standalone server and static assets
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]
