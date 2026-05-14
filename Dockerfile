FROM node:20-slim

# Install system dependencies for sharp (native module)
RUN apt-get update && apt-get install -y \
    libvips-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies (allow build scripts for native modules)
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild sharp

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
