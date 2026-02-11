FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto
COPY gateway/package*.json ./
RUN npm install

COPY gateway .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
