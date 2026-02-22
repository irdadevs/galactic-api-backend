# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src
COPY types ./types
RUN npm run build

FROM node:22-bookworm-slim AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY src/infra/db/migrations ./src/infra/db/migrations
COPY package*.json ./

USER node
EXPOSE 8080

CMD ["node", "dist/server.js"]
