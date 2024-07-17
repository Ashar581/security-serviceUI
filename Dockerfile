# Use the official Nginx image from the Docker Hub
FROM nginx:alpine

# Copy the content of the site_root directory to the Nginx html directory
COPY public_html /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container has provisioned.
CMD ["nginx", "-g", "daemon off;"]
