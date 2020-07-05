# build stage
FROM nginx:stable-alpine
COPY ./app /usr/share/nginx/html
COPY ./conf/docker/nginx.conf /etc/nginx/nginx.conf
