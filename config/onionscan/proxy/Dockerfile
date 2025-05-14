# Patches https://github.com/s-rah/onionscan/issues/191
# by responding to HTTP requests with a special 501 error status message,
# as well as proxying SOCKS5 requests to tor

FROM nginx:1.27.5-bookworm

# Installing dependencies
RUN \
    apt-get update && \
    apt-get install socat -y --no-install-recommends && \
    apt-get clean

# Copying nginx config
COPY "./conf.d/" "/etc/nginx/conf.d/"

# Running container
RUN mkdir -p /usr/home/app
WORKDIR /usr/home/app
COPY "./entrypoint.sh" "./entrypoint.sh"
EXPOSE 80 443

ENTRYPOINT [ "./entrypoint.sh" ]
