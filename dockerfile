# --- Step 1: Build the Vite app ---
    FROM node:18-alpine AS builder

    # Create app directory
    WORKDIR /app
    
    # Copy dependency files
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy source code
    COPY . .
    
    # Build for production
    RUN npm run build
    
    
    # --- Step 2: Serve built app using lightweight Nginx ---
    FROM nginx:stable-alpine
    
    # Copy the build output to Nginx html directory
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Copy custom Nginx config (optional but recommended for routing)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose port 80
    EXPOSE 80
    
    # Start Nginx
    CMD ["nginx", "-g", "daemon off;"]
    