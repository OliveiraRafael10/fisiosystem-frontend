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
├── styles/       CSS complexo separado por responsabilidade
└── types/        Contratos TypeScript da API
```

As páginas coordenam os dados e a navegação. Regras de comunicação ficam nos serviços, contratos
ficam em `types` e comportamentos reutilizáveis são extraídos para componentes ou funções de
domínio.

## Estilização

O projeto adota uma arquitetura híbrida. Tailwind CSS concentra estilos comuns de layout,
espaçamento, tipografia, cores e responsividade diretamente nos componentes. Regras visuais mais
complexas, como superfícies especializadas, gráficos, animações e composições do dashboard, ficam
em arquivos temáticos dentro de `src/styles`.

`src/App.css` funciona apenas como ponto de entrada desses estilos e mantém a ordem da cascata.
Novos estilos genéricos devem ser escritos com utilitários Tailwind; CSS próprio deve ser reservado
para comportamentos que não ficam claros ou reutilizáveis com utilitários.

## Desenvolvimento

Com o backend Spring em execução em `http://localhost:8080`:

```bash
npm install
npm run dev
```

O Vite encaminha as chamadas de `/backend` para o Spring, portanto não é necessário liberar CORS durante o desenvolvimento local.

## Configuração da API

No desenvolvimento local, o valor padrão `VITE_API_URL=/backend` usa o proxy do Vite para o Spring em `http://localhost:8080`. Para produção, configure `VITE_API_URL` como variável de ambiente de build com a URL HTTPS pública do backend. O build de produção falha se essa variável não estiver configurada.

```env
VITE_API_URL=https://api.seudominio.com
```

Essa variável é incorporada ao JavaScript entregue ao navegador; não coloque segredos nela.

O frontend usa os contratos reais de `Paciente`, `Fisioterapeuta`, `Encaminhamento` e `Consulta`, incluindo as ações de assumir, retirar, dar alta, realizar, reagendar, cancelar e registrar falta.

## Deploy

O projeto gera um site estático com Vite. Em uma hospedagem compatível com aplicações SPA, configure:

- Instalação: `npm ci`
- Build: `npm run build`
- Diretório publicado: `dist`
- Variável de build: `VITE_API_URL`, apontando para o backend HTTPS
- Fallback de rotas: servir `/index.html` para caminhos da aplicação, como `/pacientes` e `/consultas`

Configure também o CORS do backend para permitir a origem HTTPS do site publicado. Após publicar, teste uma rota interna com recarga direta do navegador e valide as chamadas da API na aba Rede.

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
