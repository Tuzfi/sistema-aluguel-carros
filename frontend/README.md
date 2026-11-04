# Interface ViaCar

React + TypeScript + Vite. Instruções completas no [README principal](../README.md).

```powershell
npm ci
npm run dev
npm test
npm run build
npm run lint
npx playwright install chromium
npm run test:e2e
```

O Vite encaminha `/api` ao back-end na porta 8080 (configurável por VIACAR_API_PROXY).
O E2E inicia servidores isolados e PostgreSQL temporário. Para demonstração local sem
Docker, defina VIACAR_DEMO_PASSWORD e execute `npm run demo:api` em outro terminal.
