# Finance Buddy

Controle financeiro pessoal e empresarial.

## Deploy no Vercel

### Opção 1 — Arrastar e soltar (mais fácil)
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Arraste a pasta `finance-buddy` (ou faça upload do ZIP)
4. O Vercel detecta automaticamente: **Framework = Vite**
5. Clique **Deploy** — pronto!

### Opção 2 — Via terminal
```bash
npm install
npm run build     # gera a pasta /dist
npx vercel        # faz deploy
```

### Opção 3 — GitHub + Vercel (recomendado para atualizações)
1. Suba o projeto para um repositório GitHub
2. No Vercel, conecte o repositório
3. Cada `git push` faz deploy automático

## Desenvolvimento local
```bash
npm install
npm run dev       # abre em http://localhost:5173
```

## Stack
- React 18 + Vite
- Tailwind CSS
- Recharts
- Dados salvos no localStorage por usuário
