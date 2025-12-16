# Use node image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy all backend files
COPY . .

# Expose port
EXPOSE 8080

# Start the backend
CMD ["npm", "run", "dev"]
