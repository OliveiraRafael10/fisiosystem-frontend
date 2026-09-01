# FisioSystem Frontend

Interface web para gestão de pacientes, encaminhamentos, consultas, fisioterapeutas e indicadores clínicos.

## Desenvolvimento

Com o backend Spring em execução em `http://localhost:8080`:

```bash
npm install
npm run dev
```

O Vite encaminha as chamadas de `/backend` para o Spring, portanto não é necessário liberar CORS durante o desenvolvimento local.

## Configuração da API

O valor padrão local é `VITE_API_URL=/backend`. Para uma versão publicada, crie `.env.production` com a URL HTTPS pública do backend:

```env
VITE_API_URL=https://api.seudominio.com
```

O frontend usa os contratos reais de `Paciente`, `Fisioterapeuta`, `Encaminhamento` e `Consulta`, incluindo as ações de assumir, retirar, dar alta, realizar, reagendar, cancelar e registrar falta.

## Validação

```bash
npm run build
npm run lint
```
