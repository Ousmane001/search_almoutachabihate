# Search — Al-Moutachabihate (recherche vocale)

Mini app web minimaliste : un bouton micro central pour dicter un verset,
un champ texte éditable affichant la transcription, et la liste des
versets correspondants (lecture seule, pas de navigation vers le lecteur).

S'appuie entièrement sur l'API existante (`/v1/search`, `/v1/tarteel/transcribe`)
— aucune logique de recherche ou de transcription côté client.

## Démarrage en local

```bash
npm install
npm run dev -- --host
```

Le micro nécessite HTTPS (sauf sur `localhost`). Pour tester depuis un autre
appareil sur le réseau local, générer un certificat avec
[mkcert](https://github.com/FiloSottile/mkcert) dans `certs/cert.pem` /
`certs/key.pem` — `vite.config.ts` les détecte automatiquement.

## Production

Construit en image Docker (`Dockerfile`) servie par nginx, qui proxy en
interne `/v1/*` et `/health` vers le conteneur `api` du même réseau
docker-compose — pas de configuration CORS ni d'URL d'API à exposer
publiquement.
