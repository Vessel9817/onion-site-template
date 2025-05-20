FROM node:lts-bookworm-slim
RUN mkdir -p /usr/app/src
WORKDIR /usr/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "tsconfig.json", "./"]
RUN npm i
WORKDIR /usr/app/src
COPY "./src" "."
RUN chown -R node /usr/app/src
USER node
CMD ["npm", "start"]
