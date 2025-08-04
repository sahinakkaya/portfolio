# Dockerfile for Next.js site
# Stage 1: Build Next.js site
FROM node:18-alpine as site-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install all dependencies (needed for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js application
RUN yarn build

# Remove dev dependencies after build
RUN yarn install --production --frozen-lockfile

# Stage 2: Production runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy Next.js build output
COPY --from=site-builder --chown=nextjs:nodejs /app/.next ./.next
# Public files are served by Next.js from .next build output
COPY --from=site-builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=site-builder --chown=nextjs:nodejs /app/yarn.lock ./
COPY --from=site-builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start"]
