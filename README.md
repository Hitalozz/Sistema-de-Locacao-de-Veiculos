# Curva — Sistema de Locação de Veículos
Aluno: Hitalo Augusto Lourenço Guedes · Ciência da Computação, PUC Goiás

Etapa 1: Home responsiva em React e TypeScript, com Bootstrap, React Router e animações GSAP. Categorias, modelos, marcas e veículos são consultados via Axios no JSON Server. As rotas dos módulos exibem uma página provisória.

## Executar no WSL
Na pasta que contém package.json:
```bash
npm install
npm run server
```
Em outro terminal, na mesma pasta:
```bash
npm run dev
```
Abra a URL Local do Vite. A API atende em http://localhost:3001. Para verificar TypeScript e gerar a aplicação, execute `npm run build`.

## Integrar ao projeto existente
Extraia o ZIP em uma pasta temporária. Copie src/, public/coupe.webp, db.json, index.html e README.md para o seu projeto, incorporando as alterações aos arquivos que já editou. Os arquivos de configuração da raiz também acompanham o pacote para execução independente. No seu projeto existente, use:
```bash
npm install react-router-dom bootstrap axios gsap @gsap/react
npm install -D json-server@0.17.4
npm pkg set 'scripts.dev=vite' 'scripts.server=json-server --watch db.json --port 3001'
```
Ative `"strict": true` em compilerOptions de tsconfig.app.json, como no arquivo fornecido. Para começar do zero, o comando de criação é `npm create vite@latest locadora-veiculos -- --template react-ts`.

## Estrutura desta etapa
- public/coupe.webp — imagem editorial original do hero
- src/main.tsx, App.tsx, modules.ts — entrada, rotas e menu dos módulos
- src/pages/Home.tsx — seções, carregamento e animações de entrada e rolagem
- src/components/ — Navbar, Button, Card, Preloader
- src/models/ — Marca, Categoria, Modelo, Veiculo
- src/service/ — api e serviços de listagem de cada uma das quatro entidades
- src/index.css — estilos da Home e fontes Barlow Condensed e DM Sans (Google Fonts, com alternativas locais)
- db.json — onze coleções; três exemplos em cada uma das cinco coleções de cadastro solicitadas

## Ajustes
O preloader combina uma espera mínima (850 ms em Home.tsx) com a conclusão da consulta. O progresso visual avança até 90% enquanto aguarda, completa 100% e a cortina sobe. Em falha, libera a Home com um botão para tentar de novo. O Axios tem timeout de 8 segundos. Preloader.tsx controla a duração do contador e da cortina.
Home.tsx controla textos, stagger das linhas do título e gatilhos de rolagem. useGSAP e matchMedia removem as animações ao sair da rota. Com movimento reduzido, a espera mínima e as transições visuais são desativadas.
A paleta fica em :root de src/index.css. Os valores exibidos nas seções de catálogo vêm de db.json. Os IDs de modelo, marca e categoria conectam os registros. Todos os clientes são fictícios.

## Commit sugerido
`feat: cria home da locadora com catálogo da API e animações GSAP`

