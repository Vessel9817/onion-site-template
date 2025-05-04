FROM node:lts-bookworm-slim
RUN mkdir -p /usr/app/src
WORKDIR /usr/app/src
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN \
    npm i && \
    mv ./node_modules/ ../
COPY . .
EXPOSE 3000
RUN chown -R node /usr/app/src
USER node
EXPOSE 3000
CMD ["npm", "start"]
