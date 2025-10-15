## Getting Started




deploiement de la DB via fichier prisma : 

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db push

```

demarrage projet :

```bash
npm run dev

```

creation utilisateur admin :

```bash
node scripts/seed-admin.js
```

creation fausse data  : 
```bash
npx tsx scripts/seed-data.js
```
