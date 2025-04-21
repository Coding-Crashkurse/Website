# ---------- Build‑Stage ----------
FROM node:20-slim AS build
WORKDIR /app

# Paket‑Infos
COPY package*.json ./
RUN npm ci            # reproduzierbarer Install

# Quellcode
COPY . .
RUN npm run build     # Vite‑Build erzeugt /app/dist

# ---------- Runtime‑Stage ----------
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]