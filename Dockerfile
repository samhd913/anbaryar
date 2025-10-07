FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist ./dist
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
