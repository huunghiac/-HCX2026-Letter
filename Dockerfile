# Sử dụng Nginx nhẹ nhất (Alpine)
FROM nginx:alpine

# Copy toàn bộ file tĩnh (html, css, js, json,...) vào thư mục phục vụ mặc định của Nginx
COPY . /usr/share/nginx/html

# Mở port 80 để phục vụ web
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
