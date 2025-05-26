# Installing dependencies
FROM node:lts-bookworm-slim AS build
WORKDIR /docker-entrypoint-initdb.d
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm i

# Running MongoDB
FROM mongo:8.0.9 AS mongo
WORKDIR /docker-entrypoint-initdb.d
COPY . .
COPY --from=0 "/docker-entrypoint-initdb.d/node_modules/" "."
