# SAÉ 2.03 : SafeShare

**Équipe V2 :**

- Rayan   AZAANOUNE   B2

- Kyle    FOREST      B2

- Alexis  WEY-RACADOT B2

- Gabriel BEAUFILS    B2


**Année :** 2025-2026

**IUT Le Havre Normandie**



## Instructions pour lancer l'application

- Clonez ou téléchargez le dépôt :
```shell
git clone git@github.com:Golden-r/docker-sae203.git
```

- Rendez vous dans le dossier du projet :
```shell
cd docker-sae203
```

- Construiser l'image décrite dans dockerfile avec docker build :
 ```shell
docker build -t sae203-safeshare
```

- Lancer le serveur de partage de fichiers  :
```shell
docker run --name SafeShare -d -p 8080:80 sae203-safeshare
```

- Vérifier que l'application est en cours d'exécution. Pour ce faire, ouvrez un navigateur et tapez ```localhost:8080```


- Vérifier que le conteneur associé est actif :
```shell
docker ps
```


- La sortie de ```docker ps``` doit être similaire à :
```shell
CONTAINER ID   IMAGE              COMMAND                  CREATED          STATUS          PORTS                                     NAMES
4d3d46d6570d   sae203-safeshare   "apachectl -D FOREGR…"   35 minutes ago   Up 35 minutes   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp   SafeShare
```



## Instruction pour arrêter l'application

- Arrêtez le conteneur avec la commande suivante :
```shell
docker stop SafeShare
```

- Encore, si on souhaite supprimer le conteneur, on peut taper :
```shell
docker rm SafeShare
```

