FROM node:lts-bookworm-slim

# Installing dependencies
WORKDIR /usr/app
COPY [ "package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./" ]
RUN npm i

# Running app
COPY "." "."
RUN chown -R node ./
USER node
CMD ["npm", "start"]
