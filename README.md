# FisioSystem Frontend

Interface web para gestão de pacientes, encaminhamentos, consultas, fisioterapeutas e indicadores clínicos.

## Arquitetura

```text
src/
├── api/          Configuração do cliente HTTP
├── components/   Componentes reutilizáveis por domínio e de interface
├── lib/          Funções puras de formatação e regras compartilhadas
├── pages/        Páginas agrupadas por módulo do sistema
├── routes/       Definição central das rotas
├── services/     Comunicação com os endpoints do Spring
└── types/        Contratos TypeScript da API
```

As páginas coordenam os dados e a navegação. Regras de comunicação ficam nos serviços, contratos
ficam em `types` e comportamentos reutilizáveis são extraídos para componentes ou funções de
domínio.

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
npm run quality
```

Esse comando verifica a formatação, executa a análise estática e gera a compilação de produção.

## Padrão de código

O projeto utiliza TypeScript em modo estrito, ESLint e Prettier. Antes de enviar uma alteração,
execute:

```bash
npm run format
npm run quality
```

As configurações compartilhadas de editor estão em `.editorconfig` e as regras de formatação em
`.prettierrc.json`.
