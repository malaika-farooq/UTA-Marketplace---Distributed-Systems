FROM node:20-alpine

WORKDIR /app

# Copy proto files from project root
COPY proto /proto

# Copy service-specific files
COPY services/auth/package*.json ./
RUN npm install

COPY services/auth .
RUN npm run build

EXPOSE 50051

CMD ["npm", "start"]
