FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto
COPY services/user/package*.json ./
RUN npm install

COPY services/user .
RUN npm run build

EXPOSE 50054

CMD ["npm", "start"]
