FROM node:lts-bookworm-slim

# Installing dependencies
WORKDIR /usr/app/src
COPY [ "./express/package.json", "./express/package-lock.json*", "./express/npm-shrinkwrap.json*", "./" ]
RUN npm i

# Copying source files
COPY "./express" "."
COPY "./backend/src/db/kafka/shared/" "./kafka/shared/"

# Running app
RUN chown -R node /usr/app/src
USER node
EXPOSE 3000
CMD [ "npm", "start" ]
