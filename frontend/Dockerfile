# --- Build Stage ---
FROM node:22.14.0-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build   # produces the /out directory

# --- Production Stage ---
FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
