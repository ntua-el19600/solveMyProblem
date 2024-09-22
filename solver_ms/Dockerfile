# Use a Debian-based Node.js image instead of Alpine
ARG NODE_VERSION=20.13.1
FROM node:${NODE_VERSION}-bullseye-slim as base

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-venv python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory for all build stages.
WORKDIR /usr/src/app



################################################################################
# Create a stage for installing production dependencies.
FROM base as deps

# Install Node.js dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Install Python dependencies using a virtual environment
COPY requirements.txt .

# Create and activate a virtual environment
RUN python3 -m venv /venv \
    && . /venv/bin/activate \
    && pip install --no-cache-dir -r requirements.txt

################################################################################
# Create a stage for building the application.
FROM deps as build

# Install development dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .

# Run the build script for the Node.js project.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the deps stage
# and the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Copy the Python virtual environment from the deps stage
COPY --from=deps /venv /venv
COPY ./src/py ./dist/utilities/py
# Expose the port that the application listens on.
EXPOSE 3003

# Activate virtual environment and run the application.
CMD . /venv/bin/activate && npm start
