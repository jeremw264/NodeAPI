# NodeAPI

Création d'une API REST avec nodeJS et Express

Outils :

-   nodeJS
-   ExpressJS
-   MongoDB (moogoose)

## Routes

### Users

| METHOD | URL              | Description                                      |
| ------ | ---------------- | ------------------------------------------------ |
| GET    | /api/users/      | Renvoie la liste de tous les utilisateurs        |
| GET    | /api/users/:id   | Renvoie l'utilisateur qui corresponds à l'id     |
| POST   | /api/users/login | Connetion d'un utilisateur                       |
| POST   | /api/users/      | Créé un utilisateur                              |
| PUT    | /api/users/      | Modifie un utilisateur                           |
| DELETE | /api/users/:id   | Supprime un utilisateur grâce à son identifiant. |



## Modele pour .env

```.env
NODE_ENV= <production ou development>
PORT= <Port du serveur>

SECRET_KEY= <Clé pour token jwt>
TTL_TOKEN= <Temps de validité du token>

DB_HOST= <Adresse de la base de donnée>
DB_PORT= <Port de la base de donnée>
DB_NAME= <Nom de la base de donnée>
```
