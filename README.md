# Sistema de Chamados de Suporte

Sistema web para abertura e acompanhamento de chamados de suporte.

## Front-end (`frontend/`)

Feito com React e Vite. Esta etapa cobre a base do projeto e o controle de acesso.

### O que já está pronto

- Estrutura de pastas, rotas e cliente HTTP.
- Componentes compartilhados: botão, campos de formulário, modal, tabela e badges de status, prioridade e perfil.
- Layout geral com menu lateral que muda conforme o perfil do usuário.
- Login, cadastro e rotas protegidas por perfil.
- Telas do administrador: gestão de usuários e de categorias.

### Como rodar

Requisitos: [Node.js](https://nodejs.org) (versão LTS).

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

No Windows PowerShell, troque `cp` por `Copy-Item`. O sistema abre em `http://localhost:5173`.

O arquivo `.env` define o endereço da API:

```
VITE_API_URL=http://localhost:3000/api
```

### Estrutura

```
frontend/src/
├── components/
│   ├── layout/      # layout geral e itens do menu por perfil
│   └── ui/          # Button, Input, Modal, Table, Badge
├── constants/       # perfis, status e prioridades
├── contexts/        # AuthContext (usuário logado)
├── pages/           # Login, Register e telas do admin
├── routes/          # rotas e ProtectedRoute
├── services/        # cliente HTTP e chamadas à API
└── styles/          # CSS global
```

### Perfis e acesso

| Perfil | Código | Acesso |
|---|---|---|
| Administrador | `admin` | Usuários e categorias |
| Técnico | `tecnico` | Telas de atendimento |
| Cliente | `cliente` | Telas dos próprios chamados |

O cadastro público cria sempre um usuário `cliente`. Outros perfis são criados pelo administrador.

Para proteger uma rota por perfil, use o `ProtectedRoute` em `src/routes/AppRoutes.jsx`:

```jsx
<Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
  <Route path="/admin/usuarios" element={<Users />} />
</Route>
```

O menu lateral é definido em `src/components/layout/navItems.js`: cada item informa quais perfis o enxergam.

### Contrato esperado da API

O front assume estas rotas. Se o back-end for diferente, ajuste os arquivos em `src/services/`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Recebe `{email, senha}` e devolve `{token, user: {id, nome, email, perfil}}` |
| POST | `/auth/register` | Recebe `{nome, email, senha}` |
| GET, POST | `/users` | Lista e cria usuários |
| PUT, DELETE | `/users/:id` | Edita e exclui um usuário |
| GET, POST | `/categories` | Lista e cria categorias |
| PUT, DELETE | `/categories/:id` | Edita e exclui uma categoria |

As requisições autenticadas enviam o cabeçalho `Authorization: Bearer <token>`. Se a API responder 401, o usuário volta para a tela de login. Erros devem trazer o texto em `message`.

### Para quem for continuar o front

- Registre as novas rotas em `src/routes/AppRoutes.jsx`, dentro do `AppLayout`.
- Use `useAuth()` para saber o perfil do usuário logado.
- Reaproveite os componentes de `src/components/ui/` e as chamadas HTTP de `src/services/api.js`.
