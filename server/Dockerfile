FROM node:16

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn

COPY . .

EXPOSE 10000
CMD ["node", "index.js"]