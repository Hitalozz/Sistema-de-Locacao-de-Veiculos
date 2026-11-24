<div align="center">

# 🚗 MEGA MOTORS

### Sistema de Locação de Veículos

Aplicação web para gerenciar uma locadora: frota, clientes e todo o ciclo de locação, da retirada à devolução.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white&style=for-the-badge)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black&style=for-the-badge)
![JSON Server](https://img.shields.io/badge/JSON_Server-API_REST-000000?logo=json&logoColor=white&style=for-the-badge)

</div>

---

## 👤 Autor

**Hitalo Augusto Lourenço Guedes**
Ciência da Computação · PUC Goiás
Atividade de laboratório: Sistema de Locação de Veículos (React · TypeScript · Bootstrap · JSON Server)

---
| MEGA MOTORS 
| :---: |
| ![Preloader](./src/assets/image.png) |
---


## 📌 Status do projeto

O projeto está sendo construído **passo a passo**. Esta é a **Etapa 1: a tela inicial (Home)**, já consumindo dados reais da API.

| Etapa | Conteúdo | Status |
| :---: | --- | :---: |
| 1 | Home imersiva, preloader, Navbar, serviços de leitura | ✅ Concluída |
| 2 | Cadastros básicos: marcas, categorias, modelos (RF01–RF03) | ⏳ Próxima |
| 3 | Veículos, manutenções e clientes (RF04–RF06) | ⬜ Planejada |
| 4 | Processo de locação, vistorias, pagamentos e nota fiscal (RF07–RF13) | ⬜ Planejada |
| 5 | Consultas, filtros e regras de negócio (RF14–RF16, RN01–RN06) | ⬜ Planejada |

---

## ✨ O que tem na Home

- **Preloader "Largada":** um velocímetro com o ponteiro tremendo em marcha lenta e o nome da marca se enchendo conforme o progresso. Quando os dados chegam, o ponteiro pisa fundo, estoura a zona vermelha, a tela dá um flash e as duas metades se abrem.
- **Hero imersivo:** o título "MEGA MOTORS" entra letra por letra. Ao rolar, o hero fica fixo (pin) enquanto o carro cresce em direção à tela e o título some atrás dele.
- **Catálogo vindo da API:** categorias com o valor da diária e os destaques da frota, ligando veículo → modelo → marca/categoria.
- **Seções animadas com ScrollTrigger:** Sobre, Categorias e diárias, Destaques da frota, Como funciona a locação e chamada final.
- **Tratamento de erro:** se o JSON Server estiver fora do ar, a Home avisa e oferece o botão "Tentar novamente".
- **Responsiva** com Bootstrap, do celular ao desktop.
- **Acessível:** respeita `prefers-reduced-motion` (sem pin, sem tremor, sem transições longas), com título legível por leitores de tela e imagens com `alt`.


## 🛠️ Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| **React + Vite** (template `react-ts`) | Interface da aplicação |
| **TypeScript** (modo `strict`, sem `any`) | Tipagem de props, models e serviços |
| **React Router** | Navegação entre as páginas |
| **Bootstrap** | Layout e responsividade |
| **Axios** | Requisições HTTP, concentradas na camada `service` |
| **JSON Server 0.17.4** | API REST simulada a partir do `db.json` |
| **GSAP, ScrollTrigger e @gsap/react** | Preloader, entrada do hero, parallax e revelação das seções |

---

## 🚀 Como executar

**Pré-requisito:** Node.js 20 ou superior.

Na pasta que contém o `package.json`:

```bash
# 1. instalar as dependências
npm install

# 2. subir a API (JSON Server em http://localhost:3001)
npm run server
```

Em **outro terminal**, na mesma pasta:

```bash
# 3. subir a aplicação
npm run dev
```

Abra a URL **Local** exibida pelo Vite (geralmente `http://localhost:5173`).

Para verificar o TypeScript e gerar a versão de produção:

```bash
npm run build
```

> ⚠️ Se a Home mostrar "Não foi possível carregar a frota", confira se `npm run server` está rodando.

### Scripts disponíveis

| Script | O que faz |
| --- | --- |
| `npm run dev` | Inicia o Vite em modo de desenvolvimento |
| `npm run server` | Inicia o JSON Server na porta 3001 |
| `npm run build` | Valida os tipos e gera o build de produção |

---

## 🗂️ Estrutura de pastas

```
locadora-veiculos/
├── db.json                  # API simulada: uma coleção por entidade do MER
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── assets/              # imagens do hero
    ├── components/          # componentes reutilizáveis (.tsx)
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── Navbar.tsx
    │   ├── Preloader.tsx    # preloader "Largada" (+ Preloader.css)
    │   └── Preloader.css
    ├── models/              # interfaces das entidades do MER (.ts)
    │   ├── Marca.ts
    │   ├── Categoria.ts
    │   ├── Modelo.ts
    │   └── Veiculo.ts
    ├── pages/               # telas da aplicação
    │   ├── Home.tsx
    │   └── MegaHome.css
    ├── service/             # comunicação com a API (.ts)
    │   ├── api.ts           # instância base do Axios
    │   └── *Service.ts      # um serviço por entidade
    ├── App.tsx
    └── main.tsx
```

### Arquitetura em camadas

```
 Página (pages)  ──►  Serviço (service)  ──►  API (JSON Server)
       │                     │
       └──── usa ────►  Models (models) e Componentes (components)
```

- As **páginas não fazem requisições HTTP**: todo acesso à API passa pelos serviços.
- As **páginas não usam `<button>`, `<input>` ou `<select>` diretamente**: usam os componentes de `src/components`.
- Os **models** tipam as entidades, incluindo as chaves estrangeiras (`marcaId`, `categoriaId`, `modeloId`).

---

## 🧩 Modelo de dados (resumo)

```
Marca ──1:N──► Modelo ◄──N:1── Categoria (define o valor da diária)
                 │
                1:N
                 ▼
              Veículo ──1:N──► Manutenção
                 │
                1:N
                 ▼
Cliente ──1:N──► Locação ──► Contrato (1:1)
                    ├──────► Vistoria (1:N)
                    ├──────► Pagamento (1:N)
                    └──────► Nota Fiscal (1:0..1)
```

O `db.json` já traz uma coleção para cada entidade, em `camelCase` e com chaves estrangeiras no formato `<entidade>Id`, e dados de exemplo nos cadastros básicos.

---

## ⚙️ Detalhes de implementação

- **Preloader com progresso real:** o ponteiro sobe até 92% enquanto os dados carregam. Quando a consulta termina e o tempo mínimo passou (850 ms), ele acelera até 100% e abre as cortinas. A Home começa a animar por baixo das cortinas, sem piscar.
- **Animações sem vazamento:** `useGSAP` e `gsap.matchMedia()` revertem todas as animações ao sair da rota.
- **Dados da Home:** a busca fica em um hook (`useCatalogo`) com `AbortController`, e o relacionamento veículo → modelo → marca/categoria é calculado uma vez com `useMemo`.
- **Paleta:** o azul do céu do hero e o laranja dos bancos do carro como cor de destaque. As cores ficam nas variáveis `:root` do `MegaHome.css`.

---

## ✅ Checklist do enunciado

- [x] Projeto criado com Vite (`react-ts`)
- [x] Todos os arquivos de `src/` em `.ts` / `.tsx`, sem `any`
- [x] React Router, Bootstrap e Axios
- [x] JSON Server com `db.json` na raiz e script `server`
- [x] Estrutura `components / models / pages / service`
- [x] Props dos componentes tipadas com `interface`
- [x] Páginas sem requisições HTTP diretas
- [ ] Componentes `Input`, `Select`, `TextArea`, `Table<T>`, `Modal` e `Alert` (próximas etapas)
- [ ] Cadastros (RF01–RF06), locação (RF07–RF13) e consultas (RF14–RF16)
- [ ] Regras de negócio RN01–RN06

---

## 🧭 Roadmap

1. Cadastros de **marcas**, **categorias** e **modelos**, com `Select` de marca e categoria.
2. Cadastros de **veículos**, **manutenções** e **clientes**, com validação de placa, chassi, CPF e CNH únicos.
3. **Locação**: valor previsto automático (diárias × valor da categoria), contrato gerado, vistorias, pagamentos e nota fiscal.
4. **Consultas**: filtro por status e cliente, detalhes da locação e disponibilidade dos veículos.
5. Regras de negócio e mensagens ao usuário (veículo já locado, CNH vencida, exclusão com dependentes).

---

## 📝 Histórico de commits

O desenvolvimento segue commits pequenos, no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
feat: cria home da locadora com catálogo da API e animações GSAP
feat: adiciona preloader com velocímetro
style: novo visual da home e hero com título animado
```

---

<div align="center">

Feito por **Hitalo Guedes** · PUC Goiás

</div>