# Usamos una imagen ligera de Node.js
FROM node:20-alpine

# Creamos el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos solo las dependencias de producción
RUN npm install --production

# Copiamos el resto del código de la aplicación
COPY . .

# Exponemos el puerto en el que corre la API
EXPOSE 3001

# El comando para iniciar el servidor
CMD [ "node", "index.js" ]