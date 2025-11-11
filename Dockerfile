# Usar una imagen base de Node.js LTS
FROM node:18-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema si son necesarias
RUN apk add --no-cache tini

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar el resto del código de la aplicación
COPY . .

# Crear directorio para uploads si no existe
RUN mkdir -p uploads

# Exponer el puerto de la aplicación
EXPOSE 3000

# Usar tini para manejar señales correctamente
ENTRYPOINT ["/sbin/tini", "--"]

# Ejecutar la aplicación
CMD ["node", "app.js"]
