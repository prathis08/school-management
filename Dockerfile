# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Copy all workspace files (needed for npm workspaces)
COPY modules/ ./modules/

# Install all dependencies (including workspaces)
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

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