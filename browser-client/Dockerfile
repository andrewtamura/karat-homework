FROM node:latest AS install-requirements
WORKDIR /code
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci
COPY src/ src/
COPY public/ public/
EXPOSE 3000

FROM node:latest as build
WORKDIR /code
COPY --from=install-requirements /code/ /code/
RUN npm run build

FROM nginx:latest AS production
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /code/build .