FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto
COPY services/search/package*.json ./
RUN npm install

COPY services/search .
RUN npm run build

EXPOSE 50053

CMD ["npm", "start"]
