FROM node:lts-bookworm-slim
RUN mkdir -p /usr/app/src
WORKDIR /usr/app/src
COPY "./express" "."
COPY "./api/src/db/kafka/shared/" "./kafka/shared/"
RUN \
    npm i && \
    chown -R node /usr/app/src
USER node
EXPOSE 3000
CMD ["npm", "start"]
