FROM node:8-alpine

WORKDIR /server

COPY package.json dist /server/
RUN npm install

EXPOSE 3000
CMD [ "npm", "run", "start.prod" ]
