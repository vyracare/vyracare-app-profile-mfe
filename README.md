# Vyracare App Profile MFE

Micro-frontend da plataforma Vyracare responsavel pelos fluxos de cadastro e consulta de funcionarios.

## Objetivo

O `vyracare-app-profile-mfe` concentra a experiencia de gestao de funcionarios dentro do ecossistema federado do shell.

## Integracao com o shell

O shell espera:

- um `remoteEntry.js` publicado pelo MFE;
- uma rota principal exposta por `./Routes`;
- compatibilidade de versoes Angular e do `@vyracare/design-system`.

Em desenvolvimento local, o remoto roda na porta configurada pelo projeto e pode ser carregado pelo shell por meio do `environment.dev.ts`.

## Execucao local

```bash
npm install
npm start
```

## Testes

```bash
npm test
```

## Convencao de commits

Os commits deste repositorio devem ser escritos em portugues.

Padrao recomendado:

- `feat: adiciona cadastro de funcionario`
- `fix: corrige validacao de perfil profissional`
- `docs: atualiza explicacao do mfe de funcionarios`
