FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --ignore-scripts

COPY . .
RUN npx prisma generate
RUN npm run build

# Producción: usar una imagen optimizada
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
