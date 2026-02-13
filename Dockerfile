# Stage 1: Build the Admin Panel
FROM node:20-alpine AS admin-builder
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci
COPY admin/ .
RUN npm run build

# Stage 2: Setup Backend and Serve
FROM node:20-alpine
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci

# Copy backend source code
COPY backend/ .

# Copy built admin assets from stage 1
# We place them in a directory that the backend server expects
# Based on server.js: path.join(__dirname, "../../admin/dist")
# If server.js is in /app/backend/src, then ../../admin/dist is /app/admin/dist
WORKDIR /app
COPY --from=admin-builder /app/admin/dist ./admin/dist

# Expose the port
ENV PORT=5000
EXPOSE 5000

# Start the server
WORKDIR /app/backend
CMD ["npm", "start"]
