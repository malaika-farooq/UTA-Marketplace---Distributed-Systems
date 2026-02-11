FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto
COPY services/analytics/package*.json ./
RUN npm install

COPY services/analytics .
RUN npm run build

EXPOSE 50056

CMD ["npm", "start"]
