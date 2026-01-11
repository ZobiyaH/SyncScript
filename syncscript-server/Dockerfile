# Use a Node.js base image
FROM node:18

# Install Python, C++ (build-essential), and Java (OpenJDK)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Set environment variable for Port
ENV PORT=1234
EXPOSE 1234

# Start the server
CMD ["node", "index.js"]