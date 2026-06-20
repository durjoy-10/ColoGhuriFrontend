# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SERVER_BASE_URL
ARG VITE_FRONTEND_URL

# Set environment variables for build time
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Build the app
RUN npm run build

# Stage 2: Nginx (alpine is the lighter version of Nginx)
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]