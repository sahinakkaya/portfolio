# Use the official Node.js image with Alpine Linux
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm and configure global directory
RUN npm install -g pnpm && \
    pnpm config set global-bin-dir /usr/local/bin

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Command to start the Next.js application
CMD ["pnpm", "start"]
