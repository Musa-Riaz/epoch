Seed scripts for local development

Prerequisites:
- A running MongoDB instance (default: mongodb://127.0.0.1:27017)
- `MONGO_URI` environment variable set if using a custom host

How to run:

1. Install dev deps (if not already):

   npm install

2. Run each seed in order from the repository root (PowerShell example):

```powershell
npx ts-node src/seed/users.seed.ts
npx ts-node src/seed/projects.seed.ts
npx ts-node src/seed/tasks.seed.ts
```

Notes:
- These scripts `deleteMany` collections — use only for local/dev databases.
- They rely on your models in `src/infrastructure/database/models` and the `hashPassword` util.
