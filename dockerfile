# Utiliser l'image debian officielle comme image parent
FROM debian:latest

# Installer des services et des packages
RUN apt update && apt install -y apache2 apache2-utils

# Copier les fichiers de l'hôte vers l'image
COPY ./html/ /var/www/html/
COPY files/ /var/www/html/files/

# création du system de sécurité
# le login = sae203
# le password = crokeur2pied67
RUN htpasswd -bc /etc/apache2/.htpasswd sae203 crokeur2pied67


# Exposer le port 80
EXPOSE 80

# Lancer le service apache au démarrage du conteneur
# Le -D FOREGROUND permet de ne pas lancer appache en arriere plan pour éviter le crash du docker
CMD ["apachectl", "-D", "FOREGROUND"]
