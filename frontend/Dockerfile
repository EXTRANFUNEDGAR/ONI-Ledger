# --- Fase 1: Construcción (Build) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los archivos de dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Construimos la aplicación de Next.js para producción
RUN npm run build

# --- Fase 2: Producción (Runner) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copiamos solo los archivos necesarios desde la fase de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Exponemos el puerto en el que corre Next.js
EXPOSE 3000

# El comando para iniciar el servidor de Next.js en modo producción
CMD ["node", "server.js"]