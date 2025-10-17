FROM nginx:alpine

# Copy static OpenAPI specs
COPY specs /usr/share/nginx/html/specs

# Copy Scalar HTML page
COPY public /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
