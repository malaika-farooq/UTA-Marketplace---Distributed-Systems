FROM node:20-alpine

WORKDIR /app

# Copy frontend files
COPY frontend/index.html .
COPY frontend/styles.css .
COPY frontend/app.js .
COPY frontend/serve.js .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "serve.js"]
