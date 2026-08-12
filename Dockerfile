# ============================================================
# Stage 1: Build Stage (using nginx-alpine for minimal image)
# ============================================================
FROM nginx:1.27-alpine AS final

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy application source files
COPY index.html /usr/share/nginx/html/
COPY index.css  /usr/share/nginx/html/
COPY app.js     /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requires the container to listen on PORT env var (default: 8080)
ENV PORT=8080
EXPOSE 8080

# Use sh to substitute PORT env var at runtime, then start nginx
CMD ["/bin/sh", "-c", "sed -i \"s/__PORT__/$PORT/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
