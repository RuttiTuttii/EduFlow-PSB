FROM node:20-alpine

WORKDIR /app

# Set NODE_ENV to development for installing all dependencies
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Switch to production
ENV NODE_ENV=production

# Install serve to serve the built application
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start the application
CMD ["serve", "-s", "build", "-l", "5173"]