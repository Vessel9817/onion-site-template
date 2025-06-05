FROM node:lts-bookworm-slim
RUN mkdir -p /usr/app/src
WORKDIR /usr/app
COPY "." "."
RUN \
    npm i && \
    chown -R node ./src && \
    chown node ./package.json
USER node
CMD ["npm", "start"]
