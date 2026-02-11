FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto
COPY services/listing/package*.json ./
RUN npm install

COPY services/listing .
RUN npm run build

EXPOSE 50052

CMD ["npm", "start"]
