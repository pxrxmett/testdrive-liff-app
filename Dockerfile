FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4000

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

# Start command
CMD ["npm", "run", "start"]
