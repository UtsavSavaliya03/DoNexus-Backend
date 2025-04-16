# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Start backend
CMD ["npm", "start"]
