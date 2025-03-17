FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g ember-cli

COPY . .

EXPOSE 4200

CMD ["ember", "serve", "--host", "0.0.0.0"]