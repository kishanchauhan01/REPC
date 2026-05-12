FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && apt-get install -y postgresql-client

RUN chmod +x start.sh

EXPOSE 3000

CMD ["sh", "./start.sh"]