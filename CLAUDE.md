# Explainer — SaaS de aprendizado com IA por nicho

## Visão geral do produto

Explainer é uma plataforma SaaS onde estudantes de nichos específicos (concursos, OAB, medicina, vestibular, etc.) estudam com uma IA especializada no conteúdo daquele nicho. A IA não é genérica — ela responde com base no material real do aluno (apostilas, PDFs, editais) e gera questões personalizadas com correção inteligente.

### Proposta de valor

O aluno faz upload do seu material, a IA processa e indexa o conteúdo, e a partir daí:

- Explica qualquer trecho do material com profundidade
- Gera questões com base no conteúdo real
- Corrige respostas com feedback detalhado
- Rastreia progresso e identifica pontos fracos
- Adapta a dificuldade conforme o desempenho

---

## Arquitetura

### Princípio: monolito bem organizado

Tudo roda em um único projeto Next.js. Sem microserviços, sem complexidade desnecessária. A estrutura de pastas antecipa separação futura, mas no v1 tudo fica junto.

### Stack

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Framework | Next.js 14+ (App Router) | SSR, API routes, deploy fácil |
| Linguagem | TypeScript (strict mode) | Tipagem, DX, menos bugs |
| UI | Tailwind CSS + shadcn/ui | Componentes prontos, customizáveis |
| Auth | Supabase Auth | Google, email/senha, magic link |
| Banco de dados | Supabase (PostgreSQL) | Gerenciado, grátis no início |
| Vetorial | pgvector (extensão do Postgres) | Sem serviço extra |
| Storage | Supabase Storage | PDFs dos alunos |
| ORM | Drizzle ORM | Type-safe, leve, bom com Supabase |
| LLM | API Anthropic (Claude) ou OpenAI (GPT-4o) | Via Vercel AI SDK |
| Embeddings | OpenAI text-embedding-3-small | Barato, boa qualidade |
| Deploy | Vercel | Zero config, serverless |

### Estrutura de pastas

```
explainer/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── (marketing)/              # Landing page, pricing (público)
│   │   │   ├── page.tsx              # Home / landing
│   │   │   └── pricing/page.tsx
│   │   ├── (auth)/                   # Rotas de autenticação
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx            # Layout sem sidebar
│   │   ├── (dashboard)/              # Área logada (protegida)
│   │   │   ├── layout.tsx            # Layout com sidebar
│   │   │   ├── page.tsx              # Dashboard principal
│   │   │   ├── study/                # Chat com IA
│   │   │   │   └── page.tsx
│   │   │   ├── questions/            # Banco de questões
│   │   │   │   ├── page.tsx          # Lista de sessões
│   │   │   │   └── [sessionId]/page.tsx  # Sessão ativa
│   │   │   ├── materials/            # Gestão de materiais
│   │   │   │   └── page.tsx
│   │   │   └── progress/             # Progresso e stats
│   │   │       └── page.tsx
│   │   └── api/                      # API Routes
│   │       ├── chat/route.ts         # Streaming de respostas da IA
│   │       ├── documents/
│   │       │   ├── upload/route.ts   # Upload de PDF
│   │       │   └── process/route.ts  # Processar e indexar
│   │       ├── questions/
│   │       │   ├── generate/route.ts # Gerar questões
│   │       │   └── evaluate/route.ts # Corrigir respostas
│   │       └── progress/route.ts     # Buscar stats
│   ├── lib/                          # Lógica de negócio (core)
│   │   ├── ai/
│   │   │   ├── prompts.ts            # System prompts por nicho
│   │   │   ├── rag.ts                # Pipeline RAG (busca + contexto)
│   │   │   ├── embeddings.ts         # Gerar e buscar embeddings
│   │   │   └── question-generator.ts # Lógica de geração de questões
│   │   ├── db/
│   │   │   ├── schema.ts             # Schema Drizzle
│   │   │   ├── client.ts             # Instância do Drizzle
│   │   │   └── queries/              # Queries organizadas por domínio
│   │   │       ├── documents.ts
│   │   │       ├── questions.ts
│   │   │       └── progress.ts
│   │   ├── services/
│   │   │   ├── document-processor.ts # Parse PDF → chunks → embeddings
│   │   │   ├── study-session.ts      # Lógica de sessão de estudo
│   │   │   └── analytics.ts          # Cálculos de progresso
│   │   ├── supabase/
│   │   │   ├── client.ts             # Client-side Supabase
│   │   │   ├── server.ts             # Server-side Supabase
│   │   │   └── middleware.ts         # Auth middleware
│   │   └── utils/
│   │       ├── pdf-parser.ts         # Extração de texto de PDFs
│   │       └── chunker.ts            # Dividir texto em chunks semânticos
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (gerado)
│   │   ├── chat/
│   │   │   ├── chat-interface.tsx    # Interface principal do chat
│   │   │   ├── message-bubble.tsx
│   │   │   └── source-reference.tsx  # Referência ao trecho do PDF
│   │   ├── questions/
│   │   │   ├── question-card.tsx     # Card de questão
│   │   │   ├── answer-input.tsx      # Input de resposta
│   │   │   └── feedback-panel.tsx    # Feedback da correção
│   │   ├── materials/
│   │   │   ├── upload-zone.tsx       # Drag & drop de PDF
│   │   │   └── document-list.tsx     # Lista de materiais
│   │   ├── progress/
│   │   │   ├── stats-overview.tsx    # Cards de resumo
│   │   │   └── topic-heatmap.tsx     # Mapa de calor por tema
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── mobile-nav.tsx
│   ├── hooks/
│   │   ├── use-chat.ts               # Hook para streaming de chat
│   │   ├── use-upload.ts             # Hook para upload com progresso
│   │   └── use-questions.ts          # Hook para sessão de questões
│   └── types/
│       └── index.ts                  # Tipos compartilhados
├── supabase/
│   └── migrations/                   # Migrations SQL
│       └── 001_initial.sql
├── public/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                         # Este arquivo
```

---

## Schema do banco de dados

### Tabelas principais

```sql
-- Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Perfis de usuários (estende auth.users do Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  niche TEXT NOT NULL,                    -- 'oab', 'medicina', 'enem', etc.
  plan TEXT NOT NULL DEFAULT 'free',      -- 'free', 'pro'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos (PDFs enviados)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,                -- Caminho no Supabase Storage
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'ready', 'error'
  total_chunks INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks de documentos (com embeddings)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,                  -- Texto do chunk
  chunk_index INTEGER NOT NULL,           -- Posição no documento
  page_number INTEGER,                    -- Página de origem
  embedding VECTOR(1536) NOT NULL,        -- Embedding do texto
  metadata JSONB DEFAULT '{}',            -- Seção, título, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por similaridade
CREATE INDEX ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Sessões de estudo (chat com IA)
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens do chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',             -- Chunks referenciados na resposta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questões geradas
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'open_ended', 'true_false')),
  options JSONB,                          -- Para multiple_choice: [{label: "A", text: "..."}]
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,              -- Explicação da resposta correta
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source_chunks JSONB DEFAULT '[]',       -- IDs dos chunks de origem
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Respostas dos alunos
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  feedback TEXT NOT NULL,                 -- Feedback personalizado da IA
  time_spent_seconds INTEGER,             -- Tempo para responder
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso por tópico
CREATE TABLE topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  last_studied_at TIMESTAMPTZ,
  mastery_level REAL DEFAULT 0,           -- 0.0 a 1.0
  UNIQUE(user_id, topic)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuário só vê seus próprios dados
CREATE POLICY "Users see own data" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users see own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own chunks" ON document_chunks
  FOR ALL USING (
    document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
  );

CREATE POLICY "Users see own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own messages" ON messages
  FOR ALL USING (
    session_id IN (SELECT id FROM study_sessions WHERE user_id = auth.uid())
  );

CREATE POLICY "Users see own questions" ON questions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own answers" ON answers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own progress" ON topic_progress
  FOR ALL USING (auth.uid() = user_id);
```

### Função SQL para busca por similaridade (RAG)

```sql
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1536),
  match_count INTEGER DEFAULT 5,
  filter_document_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  chunk_index INTEGER,
  page_number INTEGER,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.chunk_index,
    dc.page_number,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE (filter_document_id IS NULL OR dc.document_id = filter_document_id)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## Funcionalidades — v1 (MVP)

### 1. Upload e processamento de PDFs

**Fluxo:**

1. Aluno faz drag & drop de PDF no `<UploadZone />`
2. Frontend envia para `/api/documents/upload`
3. API salva o arquivo no Supabase Storage
4. Cria registro em `documents` com status `pending`
5. Dispara processamento em `/api/documents/process`
6. Pipeline: extrair texto → dividir em chunks → gerar embeddings → salvar no `document_chunks`
7. Atualiza status para `ready`

**Regras de processamento:**

- Chunking semântico: dividir por parágrafos/seções, não por tamanho fixo
- Tamanho alvo do chunk: 500-800 tokens
- Overlap entre chunks: 100 tokens
- Preservar metadados: número da página, título da seção
- Limite v1: 50 páginas por PDF, 10 PDFs por usuário free

**Implementação do chunker (`lib/utils/chunker.ts`):**

```typescript
interface Chunk {
  content: string;
  index: number;
  pageNumber?: number;
  metadata: {
    section?: string;
    [key: string]: unknown;
  };
}

// Dividir por parágrafos duplos, respeitando limites de token
// Se um parágrafo > 800 tokens, dividir por sentenças
// Manter overlap de ~100 tokens entre chunks adjacentes
```

### 2. Chat com IA (estudo guiado)

**Fluxo RAG:**

1. Aluno envia pergunta
2. Gerar embedding da pergunta
3. Buscar top 5 chunks mais similares via `match_chunks()`
4. Montar prompt com contexto dos chunks
5. Chamar LLM com streaming
6. Retornar resposta com referências aos trechos usados

**System prompt base (`lib/ai/prompts.ts`):**

```typescript
export function getSystemPrompt(niche: string): string {
  return `Você é um tutor especialista em ${nicheLabels[niche]}.

Seu papel é explicar conceitos usando EXCLUSIVAMENTE o material fornecido pelo aluno.

Regras:
- Sempre cite a fonte (página, seção) quando referenciar o material
- Se a pergunta não puder ser respondida com o material disponível, diga isso claramente
- Use linguagem acessível mas tecnicamente precisa
- Dê exemplos práticos quando possível
- Se o aluno demonstrar confusão, reformule com analogias simples
- Ao final de explicações longas, faça um resumo em tópicos

Formato das referências: [Fonte: {nome_documento}, p. {pagina}]`;
}
```

**API route (`app/api/chat/route.ts`):**

- Usar Vercel AI SDK (`ai` package) para streaming
- `StreamingTextResponse` para SSE
- Guardar mensagem no banco após streaming completo

### 3. Banco de questões com correção inteligente

**Geração de questões:**

1. Aluno clica "Gerar questões" e escolhe o documento/tópico
2. API seleciona chunks relevantes do tópico
3. LLM gera questões com base nos chunks
4. Salva em `questions` com a resposta correta e explicação

**Prompt de geração:**

```
Com base no seguinte conteúdo, gere {n} questões de {tipo}.

Conteúdo:
{chunks}

Para cada questão, forneça em JSON:
- question_text: o enunciado
- options: array de alternativas (se múltipla escolha)
- correct_answer: resposta correta
- explanation: explicação detalhada de por que essa é a resposta certa
- topic: tópico principal abordado
- difficulty: easy | medium | hard
```

**Correção inteligente:**

1. Aluno responde a questão
2. Se múltipla escolha: comparação direta
3. Se discursiva: LLM avalia a resposta comparando com a resposta esperada
4. Gera feedback personalizado: o que acertou, o que faltou, como melhorar
5. Atualiza `topic_progress`

**Prompt de correção (discursiva):**

```
Avalie a resposta do aluno comparando com a resposta esperada.

Questão: {question}
Resposta esperada: {correct_answer}
Resposta do aluno: {user_answer}

Forneça:
1. Se está correta, parcialmente correta ou incorreta
2. O que o aluno acertou (seja específico)
3. O que faltou ou está errado
4. Uma explicação clara do conceito para ajudar o aluno a entender
```

### 4. Dashboard de progresso

**Dados exibidos:**

- Total de questões respondidas
- Taxa de acerto geral e por tópico
- Tópicos fortes vs. fracos (baseado em `mastery_level`)
- Streak de estudo (dias consecutivos)
- Horas estudadas (estimativa baseada em sessões)

**Cálculo de mastery_level:**

```typescript
// Fórmula simples de média ponderada com decaimento temporal
// Respostas recentes pesam mais que antigas
// mastery = (acertos_recentes * 0.7 + acertos_antigos * 0.3) / total
// Atualizar a cada resposta
```

---

## MCPs (Model Context Protocol) sugeridos

Para expandir as capacidades do Claude Code durante o desenvolvimento, considere instalar os seguintes MCP servers:

### Para o desenvolvimento

| MCP | Uso | Instalação |
|-----|-----|------------|
| `@anthropic/mcp-server-filesystem` | Navegar e editar arquivos do projeto | `npx @anthropic/mcp-server-filesystem /path/to/explainer` |
| `@anthropic/mcp-server-postgres` | Inspecionar e testar queries no Supabase | Conectar à database URL do Supabase |
| `supabase-mcp` | Gerenciar Supabase (migrations, storage, auth) | `npx supabase-mcp` |

### Para o produto (futuro)

| MCP | Uso |
|-----|-----|
| Supabase MCP | Integrar com banco/auth/storage direto na pipeline de IA |
| Browser MCP | Scraping de editais e conteúdos públicos para enriquecer a base |

### Configuração do Claude Code

Adicione ao arquivo `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem", "/path/to/explainer"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:PASSWORD@db.XXXX.supabase.co:5432/postgres"
      }
    }
  }
}
```

---

## Variáveis de ambiente

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LLM
OPENAI_API_KEY=sk-...            # Para embeddings
ANTHROPIC_API_KEY=sk-ant-...     # Para o chat (ou usar OpenAI)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Ordem de implementação

Construa na seguinte sequência, validando cada etapa antes de avançar:

### Fase 1 — Fundação (dia 1-2)

1. Inicializar projeto Next.js com TypeScript, Tailwind, shadcn/ui
2. Configurar Supabase: criar projeto, habilitar pgvector
3. Rodar migration inicial (SQL acima)
4. Configurar autenticação (login com email/senha + Google)
5. Criar layout do dashboard com sidebar
6. Implementar middleware de auth (redirecionar não-logados)

### Fase 2 — Upload e processamento (dia 3-4)

1. Criar componente `<UploadZone />` com drag & drop
2. Implementar `/api/documents/upload` (salvar no Supabase Storage)
3. Implementar `pdf-parser.ts` (extrair texto de PDFs)
4. Implementar `chunker.ts` (dividir em chunks semânticos)
5. Implementar `embeddings.ts` (gerar embeddings via OpenAI)
6. Implementar `/api/documents/process` (pipeline completo)
7. Criar página de materiais com lista de documentos e status

### Fase 3 — Chat com IA (dia 5-6)

1. Implementar `rag.ts` (busca de chunks similares)
2. Implementar `/api/chat/route.ts` com streaming (Vercel AI SDK)
3. Criar interface de chat com mensagens e referências
4. Conectar seleção de documento ao contexto do chat
5. Salvar mensagens no banco

### Fase 4 — Banco de questões (dia 7-8)

1. Implementar `question-generator.ts`
2. Implementar `/api/questions/generate`
3. Implementar `/api/questions/evaluate`
4. Criar interface de sessão de questões
5. Implementar feedback panel com explicação da IA
6. Atualizar `topic_progress` a cada resposta

### Fase 5 — Progresso e polimento (dia 9-10)

1. Criar dashboard de progresso com stats e gráficos
2. Implementar cálculo de mastery_level
3. Adicionar heatmap de tópicos
4. Landing page com proposta de valor
5. Testes manuais end-to-end
6. Deploy na Vercel

---

## Padrões de código

### Convenções

- Componentes React: PascalCase, um por arquivo
- Hooks: `use-nome.ts`, sempre com `use` prefix
- API routes: usar `NextRequest` e `NextResponse`
- Queries: funções puras em `lib/db/queries/`, nunca SQL inline nos componentes
- Erros: tratar no nível da API route, retornar JSON consistente `{ error: string }`
- Validação: usar `zod` para validar input de todas as API routes

### Formato de resposta das APIs

```typescript
// Sucesso
{ data: T }

// Erro
{ error: string, details?: unknown }
```

### Streaming de chat

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: NextRequest) {
  const { messages, documentId } = await req.json();

  // 1. Buscar contexto RAG
  const context = await getRelevantChunks(messages.at(-1).content, documentId);

  // 2. Stream com contexto
  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: getSystemPrompt(user.niche) + '\n\nContexto:\n' + context,
    messages,
  });

  return result.toDataStreamResponse();
}
```

---

## Limites e restrições (v1)

| Recurso | Free | Pro (futuro) |
|---------|------|-------------|
| PDFs por conta | 10 | Ilimitado |
| Páginas por PDF | 50 | 200 |
| Questões por dia | 20 | Ilimitadas |
| Mensagens de chat por dia | 50 | Ilimitadas |
| Armazenamento | 100MB | 2GB |

---

## Decisões futuras (não implementar no v1)

- Repetição espaçada (Anki-style) para questões
- Gamificação (XP, badges, ranking)
- Compartilhamento de materiais entre alunos
- App mobile (React Native ou PWA)
- Painel admin para cursinhos
- Plano para instituições
- Cache de respostas frequentes da LLM
- Fine-tuning de modelo por nicho
- Websockets para colaboração real-time
