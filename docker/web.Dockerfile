FROM node:20-bullseye AS build
WORKDIR /app

ARG APP_DIR
ARG EXPO_PUBLIC_API_URL=http://localhost:8080
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

COPY ${APP_DIR}/package*.json ./
RUN npm ci --legacy-peer-deps

COPY ${APP_DIR}/ ./
COPY shared/ /shared/
RUN npx expo export --platform web

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

EXPOSE 80
