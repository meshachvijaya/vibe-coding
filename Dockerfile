FROM node:20-alpine

WORKDIR /app

# Step 1: Install dependencies
COPY package*.json ./
RUN npm install

# Step 2: Copy the rest of the source code
COPY . .

EXPOSE 3000

# Step 3: Runtime
# We generate the client, push the schema, and start the app in dev mode
# This avoids build-time issues with Prisma and environment variables
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && npm run start:dev"]
