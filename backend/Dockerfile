FROM php:8.2-apache

# Instalar extensiones de PHP necesarias
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Habilitar mod_rewrite para Apache
RUN a2enmod rewrite

# Configurar el directorio de trabajo
WORKDIR /var/www/html

# Copiar los archivos del proyecto
COPY . .

# Crear directorio de uploads y dar permisos
RUN mkdir -p uploads && \
    chown -R www-data:www-data uploads && \
    chmod -R 755 uploads

# Configurar Apache para servir archivos estáticos
RUN echo '\
<Directory /var/www/html/uploads>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride None\n\
    Require all granted\n\
    Header set Access-Control-Allow-Origin "*"\n\
</Directory>' >> /etc/apache2/apache2.conf

# Instalar y habilitar el módulo headers
RUN a2enmod headers

# Exponer el puerto 80
EXPOSE 80 