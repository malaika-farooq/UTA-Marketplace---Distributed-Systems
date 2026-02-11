FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto
COPY services/messaging/package*.json ./
RUN npm install

COPY services/messaging .
RUN npm run build

EXPOSE 50055

CMD ["npm", "start"]
