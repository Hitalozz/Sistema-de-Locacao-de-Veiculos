<div align="center">

# 🚗 MEGA MOTORS

### Sistema de Locação de Veículos

Aplicação web para gerenciar a frota, os clientes e todo o ciclo de locação, da retirada do veículo à devolução, ao pagamento e à emissão da nota fiscal simulada.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white&style=for-the-badge)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black&style=for-the-badge)
![JSON Server](https://img.shields.io/badge/JSON_Server-API_REST-000000?logo=json&logoColor=white&style=for-the-badge)

</div>

---

##  Hitalo Augusto Lourenço Guedes 
Ciência da Computação · PUC Goiás  
Atividade de laboratório — Sistema de Locação de Veículos

| MEGA MOTORS |
| :---: |
| ![Home da MEGA MOTORS](./src/assets/image.png) |

##  Status do projeto

O MEGA MOTORS reúne os cadastros de marcas, categorias, modelos, veículos, manutenções e clientes. O módulo de locações conecta esses dados para calcular o valor previsto, acompanhar o contrato, registrar vistorias e pagamentos e controlar quando o veículo pode ser alugado novamente.

| Etapa | Conteúdo | Status |
| :---: | --- | :---: |
| 1 | Home, preloader, navegação e catálogo integrado à API | ✅ Implementada |
| 2 | Cadastros de marcas, categorias e modelos | ✅ Implementada |
| 3 | Cadastros de veículos, manutenções e clientes | ✅ Implementada |
| 4 | Locação, contrato, vistorias, pagamentos e nota fiscal simulada | ✅ Implementada |
| 5 | Consultas, filtros e controle de disponibilidade | ✅ Implementada |

## Como executar

**Versão recomendada:** Node.js 22.13 ou mais recente da linha 22 LTS, com npm.

Na pasta que contém o `package.json`, instale as dependências na primeira execução:

```bash
npm install
```

Para iniciar o sistema:

```bash
npm start
```

O `concurrently` inicia a API e o Vite no mesmo terminal. A API usa a porta `3001` e o Vite abre a Home no navegador. Se precisar abrir a aplicação manualmente, use o endereço **Local** exibido no terminal, geralmente [http://localhost:5173](http://localhost:5173).

Para encerrar os dois processos, pressione `Ctrl+C` no terminal. Se a Home exibir **“Não foi possível carregar a frota”**, confira se a API iniciou e clique em **Tentar novamente**.

### Scripts disponíveis

| Comando | Função |
| --- | --- |
| `npm start` | Inicia a API e a interface no mesmo terminal |
| `npm run server` | Executa a API pelo arquivo `servidor.cjs` |
| `npm run dev` | Inicia o Vite em modo de desenvolvimento e abre o navegador |
| `npm run build` | Verifica o TypeScript e gera a versão de produção em `dist/` |
| `npm run preview` | Abre uma prévia do build. Para consultar os dados, execute a API também |
| `npm run lint` | Verifica o código com ESLint |

##  O que tem na Home

- **Preloader “Largada”.** Um velocímetro acompanha o carregamento enquanto o nome MEGA MOTORS ganha preenchimento. Quando os dados ficam prontos, o ponteiro acelera, a tela dá um flash e as duas metades se abrem para revelar a Home.
- **Hero imersivo.** O título entra letra por letra. Ao rolar a página, a seção fica fixa por um momento enquanto o carro cresce em direção à tela.
- **Catálogo vindo da API.** A Home mostra as categorias com os valores das diárias e os destaques da frota. Para montar cada destaque, relaciona o veículo ao modelo, à marca e à categoria.
- **Seções animadas.** O ScrollTrigger controla as animações das seções Sobre, Categorias e diárias, Destaques da frota e Como funciona a locação.
- **Navegação compartilhada.** O cabeçalho reúne a identidade MEGA MOTORS, a logo da PUC Goiás, o menu de módulos e o acesso a Locações.
- **Responsividade e acessibilidade.** O layout se adapta do celular ao desktop. As animações respeitam `prefers-reduced-motion`, e as imagens informativas têm texto alternativo.

##  Funcionalidades implementadas

| Módulo | O que o usuário pode fazer |
| --- | --- |
| **Marcas** | Cadastrar a marca e escolher visualmente sua logo |
| **Categorias** | Cadastrar categorias e definir o valor da diária de cada uma |
| **Modelos** | Vincular cada modelo à sua marca e categoria |
| **Veículos** | Cadastrar placa, chassi, cor e modelo e selecionar uma foto da galeria da frota |
| **Manutenções** | Registrar e consultar manutenções vinculadas aos veículos |
| **Clientes** | Cadastrar os clientes e seus dados de identificação e habilitação |
| **Locações** | Selecionar cliente, veículo e período, consultar o contrato e acompanhar vistorias, pagamentos e nota fiscal simulada |
| **Consultas** | Filtrar locações por cliente e status, consultar detalhes e acompanhar a disponibilidade da frota |

##  Fluxo de uma locação

1. **Escolha do veículo.** Selecione o cliente, o veículo disponível e o período da locação. A tela apresenta a foto do carro, a logo da marca e o valor da diária.
2. **Cálculo e registro.** O sistema calcula o valor previsto multiplicando a quantidade de diárias pela tarifa da categoria. Com a locação registrada, o contrato fica disponível para consulta e o veículo passa a constar como alugado.
3. **Retirada e devolução.** Registre a vistoria de retirada e, quando receber o carro de volta, a vistoria final.
4. **Pagamento e liberação.** Registre os pagamentos e acompanhe o saldo. O veículo volta a ficar disponível quando **as duas condições** forem atendidas: **vistoria de devolução registrada** e **saldo quitado**.
5. **Nota fiscal simulada.** Com a devolução registrada e o pagamento concluído, é possível emitir o documento com os dados do cliente, do veículo, do período e do valor da locação. A nota tem finalidade acadêmica e não possui valor fiscal.

##  Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| **React + Vite** | Interface da aplicação, ambiente de desenvolvimento e build |
| **TypeScript** | Tipagem das propriedades dos componentes, entidades e serviços |
| **React Router** | Navegação entre as páginas |
| **Bootstrap** | Layout e responsividade |
| **Axios** | Requisições HTTP concentradas na camada de serviços |
| **JSON Server 0.17.4** | API REST com persistência em `db.json` |
| **GSAP, ScrollTrigger e `@gsap/react`** | Animações do preloader, do hero e das seções da Home |
| **concurrently** | Execução da API e do Vite com um único comando |

## 🗂️ Estrutura de pastas

```text
locadora-veiculos/
├── db.json                 # Coleções e dados da aplicação
├── servidor.cjs            # API e regras do ciclo de locação
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração do TypeScript
├── README.md
└── src/
    ├── assets/             # Imagens da Home, fotos da frota e logos
    ├── components/         # Navegação, preloader e componentes reutilizáveis
    ├── models/             # Interfaces das entidades
    ├── pages/
    │   ├── Home.tsx
    │   ├── MegaHome.css
    │   ├── marcas/
    │   ├── categorias/
    │   ├── modelos/
    │   ├── veiculos/
    │   ├── manutencoes/
    │   ├── clientes/
    │   └── locacoes/
    ├── service/            # Instância do Axios e serviços por entidade
    ├── Cadastros.css       # Estilos compartilhados pelas telas de cadastro
    ├── App.tsx             # Rotas da aplicação
    └── main.tsx            # Ponto de entrada
```

### Arquitetura em camadas

As **páginas** apresentam os dados e recebem as ações do usuário. Os **componentes** concentram elementos reutilizáveis, como campos, tabelas, alertas, modais e navegação. Os **serviços** fazem as requisições à API. Os **models** descrevem as entidades e seus relacionamentos em TypeScript.

O arquivo `servidor.cjs` usa o JSON Server para acessar o `db.json` e aplicar regras nas operações de locação, vistoria, pagamento e emissão da nota simulada.

##  Modelo de dados

| Relacionamento | Significado |
| --- | --- |
| Marca → Modelo | Uma marca pode ter vários modelos |
| Categoria → Modelo | A categoria do modelo determina o valor da diária |
| Modelo → Veículo | Vários veículos da frota podem pertencer ao mesmo modelo |
| Veículo → Manutenção | Um veículo pode reunir vários registros de manutenção |
| Cliente → Locação | Um cliente pode realizar várias locações |
| Veículo → Locação | Um veículo pode ter várias locações ao longo do tempo |
| Locação → Contrato | Cada locação possui um contrato para consulta |
| Locação → Vistoria | A locação reúne os registros de retirada e devolução |
| Locação → Pagamento | Uma locação pode receber vários pagamentos até a quitação |
| Locação → Nota fiscal | Cada locação pode gerar uma nota fiscal simulada |

O `db.json` organiza os dados em coleções. As chaves estrangeiras seguem o formato `<entidade>Id`, como `marcaId`, `categoriaId`, `modeloId` e `veiculoId`.

##  Detalhes de implementação

- **Preloader sincronizado com a API.** O indicador avança enquanto o catálogo carrega. Quando a consulta termina e o tempo mínimo da animação é atingido, o velocímetro completa o percurso e as cortinas se abrem.
- **Ciclo das animações.** `useGSAP` e `gsap.matchMedia()` organizam as animações e sua limpeza ao sair da rota.
- **Dados da Home.** O hook `useCatalogo` busca os dados com suporte a cancelamento por `AbortController`. A Home usa `useMemo` para relacionar veículos, modelos, marcas e categorias.
- **Identidade visual.** O azul do hero e o laranja dos detalhes aparecem na Home e orientam o visual das demais telas. Na locação, a foto do carro e a logo da marca ajudam a identificar o veículo selecionado.

##  Checklist do projeto

- [x] Projeto criado com Vite, React e TypeScript
- [x] React Router, Bootstrap e Axios integrados
- [x] API com JSON Server e persistência em `db.json`
- [x] Execução da interface e da API com `npm start`
- [x] Organização em `components`, `models`, `pages` e `service`
- [x] Componentes reutilizáveis e propriedades tipadas
- [x] Acesso à API concentrado nos serviços
- [x] Cadastros de marcas, categorias, modelos, veículos, manutenções e clientes
- [x] Locação com cálculo de diárias, contrato, vistorias e pagamentos
- [x] Liberação do veículo após a devolução e a quitação
- [x] Emissão de nota fiscal simulada
- [x] Consultas e filtros de locações



<div align="center">

Feito por <strong>Hitalo Augusto L. Guedes</strong> · Ciência da Computação · PUC Goiás

</div>