FROM nginx:1.29.0-alpine

# Copying NGINX config and overwriting default config
RUN [ "rm", "-rf", "/usr/share/nginx" ]
COPY [ "./conf/", "/etc/nginx/" ]
RUN [ "nginx", "-t" ]
COPY [ "./html/", "/usr/share/nginx/html/" ]
