FROM node:20-alpine

# Set timezone to Thailand
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Make sure uploads directory exists and is writable
RUN mkdir -p /app/public/uploads && chmod 777 /app/public/uploads

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
