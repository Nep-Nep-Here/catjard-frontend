# --- Build (Vite) ---
FROM node:20-alpine AS build
WORKDIR /app

# URL pública del API Gateway; se inyecta en build (Vite lee VITE_*).
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime (nginx sirviendo el SPA) ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
