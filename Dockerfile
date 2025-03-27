# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if you have them
COPY package*.json ./

# Install dependencies
RUN npm install next@latest react@latest react-dom@latest

# Copy the rest of the application
COPY . .

RUN npm run build

# Expose port 3000
EXPOSE 3000

# Run the Next.js production server
CMD ["npm", "run", "start"]