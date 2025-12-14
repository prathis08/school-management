# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Copy workspace package.json files for better caching
COPY modules/*/package*.json ./modules/*/

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Install module dependencies using workspaces
RUN npm run install-modules

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose the port the app runs on
EXPOSE 50501

# Set environment variables
ENV NODE_ENV=production
ENV PORT=50501

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:50501/health || exit 1

# Command to run the application
CMD ["npm", "start"]