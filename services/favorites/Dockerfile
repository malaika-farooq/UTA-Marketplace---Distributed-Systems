FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto
COPY services/favorites/package*.json ./
RUN npm install

COPY services/favorites .
RUN npm run build

EXPOSE 50057

CMD ["npm", "start"]
