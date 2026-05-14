import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Brain,
  FileText,
  Ghost,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function MarketingHome() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-heading text-xl tracking-tight">
              Explainer
            </span>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
              beta
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ variant: "accent", size: "sm" })}
            >
              Começar grátis
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center px-6 py-32 text-center max-w-3xl mx-auto fade-in">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/5 text-accent text-xs tracking-wide mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Chega de respostas inventadas
        </span>

        <h1 className="font-heading text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-3xl">
          Sua IA está{" "}
          <span className="line-through text-destructive opacity-70">
            inventando
          </span>{" "}
          respostas. A nossa{" "}
          <em className="text-accent not-italic font-heading">não.</em>
        </h1>

        <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Faça upload dos seus próprios materiais — PDFs, apostilas, anotações —
          e tenha uma IA que estuda{" "}
          <strong className="text-foreground font-medium">exclusivamente</strong>{" "}
          do que você confia. Sem delírio, sem achismo.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className={buttonVariants({ size: "lg", variant: "accent" })}
          >
            Testar agora — é grátis
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
          <Link
            href="#como-funciona"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Como funciona?
          </Link>
        </div>
      </section>

      <section className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <SectionLabel>// o problema</SectionLabel>
          <SectionTitle>Você pergunta. A IA inventa.</SectionTitle>
          <SectionDesc>
            IAs genéricas são treinadas para soar certas — não para estar
            certas. Sem fontes, você não tem como saber o que é real e o que é
            delírio.
          </SectionDesc>

          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <ChatWindow tone="bad" label="IA genérica — sem fontes">
              <ChatBubble side="user">
                Qual a taxa de filtração glomerular normal?
              </ChatBubble>
              <ChatBubble side="ai" tone="bad">
                A taxa de filtração glomerular normal é de{" "}
                <strong className="font-medium">180 mL/min</strong>, conforme o
                Tratado de Harrison, 21ª edição, capítulo 14.
              </ChatBubble>
              <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive leading-relaxed">
                <AlertTriangle
                  className="h-3.5 w-3.5 shrink-0 mt-0.5"
                  strokeWidth={1.75}
                />
                <span>
                  Informação plausível, mas{" "}
                  <strong className="font-semibold">fabricada</strong>. Valor,
                  edição e capítulo foram inventados com confiança absoluta.
                </span>
              </div>
            </ChatWindow>

            <ChatWindow tone="good" label="Explainer — suas fontes">
              <ChatBubble side="user">
                Qual a taxa de filtração glomerular normal?
              </ChatBubble>
              <ChatBubble side="ai" tone="good">
                De acordo com o material que você enviou, a TFG normal
                situa-se entre{" "}
                <strong className="font-medium">
                  90 e 120 mL/min/1,73 m²
                </strong>
                .
              </ChatBubble>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span className="font-mono text-[11px]">
                  Fisiologia_Renal_Guyton.pdf — página 34
                </span>
              </div>
            </ChatWindow>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <SectionLabel>// por que isso importa</SectionLabel>
          <SectionTitle>O custo invisível da alucinação</SectionTitle>
          <SectionDesc>
            Você não é ingênuo por confiar na IA. O problema é que ela foi
            treinada para soar certa — não para estar certa.
          </SectionDesc>

          <div className="mt-12 grid gap-px md:grid-cols-3 border border-border rounded-lg overflow-hidden bg-border">
            {PAIN_POINTS.map((p) => (
              <article
                key={p.title}
                className="bg-background p-8 space-y-4 transition-colors duration-200 hover:bg-muted/30"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border">
                  <p.icon
                    className="h-4 w-4 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </span>
                <h3 className="font-heading text-2xl tracking-tight leading-tight">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <blockquote className="font-heading italic text-3xl md:text-5xl leading-[1.2] tracking-tight">
            “Se a IA não tem fonte, ela tem imaginação. E imaginação não aprova
            ninguém.”
          </blockquote>
          <p className="mt-8 text-[10px] tracking-widest uppercase text-muted-foreground">
            — A filosofia por trás do Explainer
          </p>
        </div>
      </section>

      <section id="como-funciona" className="border-t bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <SectionLabel>// como funciona</SectionLabel>
          <SectionTitle>Três passos. Zero invenção.</SectionTitle>
          <SectionDesc>
            Em menos de 2 minutos você transforma qualquer material em um tutor
            que só responde com o que está no seu conteúdo.
          </SectionDesc>

          <ol className="mt-12 space-y-px border border-border rounded-lg overflow-hidden bg-border">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="bg-background flex flex-col sm:flex-row gap-6 sm:gap-10 p-8 transition-colors duration-200 hover:bg-muted/30"
              >
                <span className="font-heading text-4xl text-accent tracking-tight shrink-0 leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl tracking-tight leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {s.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <SectionLabel>// diferenciais</SectionLabel>
          <SectionTitle>Feito para quem leva estudo a sério</SectionTitle>

          <div className="mt-12 grid gap-px md:grid-cols-2 border border-border rounded-lg overflow-hidden bg-border">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="bg-background p-8 space-y-3 transition-colors duration-200 hover:bg-muted/30"
              >
                <span className="inline-block text-[10px] tracking-widest uppercase text-accent border border-accent/30 rounded-sm px-2 py-0.5 font-mono">
                  {f.tag}
                </span>
                <h3 className="font-heading text-2xl tracking-tight leading-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-b bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 py-20 grid gap-12 md:grid-cols-3 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-3">
              <p className="font-heading text-6xl tracking-tight text-accent leading-none">
                {s.value}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <SectionLabel className="justify-center">// comece agora</SectionLabel>
          <h2 className="font-heading text-3xl md:text-5xl tracking-tight leading-[1.15]">
            Pare de estudar com uma IA que{" "}
            <em className="text-destructive not-italic line-through opacity-70 font-heading">
              inventa
            </em>
            .{" "}
            Comece com uma que{" "}
            <em className="text-accent not-italic font-heading">comprova</em>.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            Upload do primeiro material grátis. Sem cartão. Sem compromisso.
            Só você, seus materiais e respostas em que você pode confiar.
          </p>
          <div className="pt-4">
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", variant: "accent" })}
            >
              Criar minha conta grátis
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t px-8 py-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
        <span className="font-heading text-lg tracking-tight text-foreground">
          Explainer
        </span>
        <span className="tracking-wide">
          © {new Date().getFullYear()} Explainer · IA que estuda do que você
          confia.
        </span>
      </footer>
    </main>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2 text-[11px] tracking-widest uppercase text-accent font-mono ${className}`}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 font-heading text-3xl md:text-5xl tracking-tight leading-[1.1]">
      {children}
    </h2>
  );
}

function SectionDesc({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
      {children}
    </p>
  );
}

function ChatWindow({
  tone,
  label,
  children,
}: {
  tone: "bad" | "good";
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b text-xs font-medium tracking-wide">
        <span
          className={`h-2 w-2 rounded-full ${
            tone === "bad" ? "bg-destructive" : "bg-accent"
          }`}
        />
        {label}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function ChatBubble({
  side,
  tone,
  children,
}: {
  side: "user" | "ai";
  tone?: "bad" | "good";
  children: React.ReactNode;
}) {
  const isUser = side === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-muted text-foreground rounded-br-sm"
            : tone === "bad"
              ? "bg-destructive/5 border border-destructive/20 text-foreground rounded-bl-sm"
              : "bg-accent/5 border border-accent/20 text-foreground rounded-bl-sm",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

const PAIN_POINTS = [
  {
    icon: AlertTriangle,
    title: "Confiança falsa",
    description:
      "IAs respondem com a mesma convicção quando sabem e quando inventam. Você perde horas estudando algo que nunca existiu — e descobre na prova.",
  },
  {
    icon: Ghost,
    title: "Fontes fantasma",
    description:
      "Ela cita um autor, um livro, uma página. Você vai conferir e… não existe. A IA fabricou a referência inteira para parecer confiável.",
  },
  {
    icon: Brain,
    title: "Aprendizado contaminado",
    description:
      "Cada resposta errada que você absorve se torna um conhecimento base. Você constrói raciocínios inteiros sobre fundações inventadas.",
  },
];

const STEPS = [
  {
    title: "Suba seus materiais",
    description:
      "PDFs, apostilas, slides, anotações. Arraste e solte. O sistema indexa tudo em segundos e cria uma base de conhecimento exclusivamente sua.",
  },
  {
    title: "Converse com seu conteúdo",
    description:
      "Pergunte qualquer coisa. A IA responde usando apenas o que está nos seus materiais — e mostra exatamente de onde tirou cada informação. Se não encontrar, ela diz que não sabe.",
  },
  {
    title: "Teste seu conhecimento",
    description:
      "O sistema gera questões inteligentes sobre o que você estudou, avalia respostas e mostra seu progresso real. Treino cirúrgico no que você precisa dominar.",
  },
];

const FEATURES = [
  {
    tag: "rastreabilidade",
    title: "Cada resposta tem endereço",
    description:
      'Toda informação vem com a fonte exata: arquivo, página, trecho. Você verifica em 2 cliques. Acabou a era do "confia em mim".',
  },
  {
    tag: "avaliação",
    title: "Questões que te desafiam de verdade",
    description:
      "Identifica lacunas no seu aprendizado e gera perguntas focadas nos pontos fracos. Não desperdiça tempo com o que você já sabe.",
  },
  {
    tag: "progresso",
    title: "Veja sua evolução — com dados",
    description:
      "Dashboard de desempenho por tema, por material, por período. Você sabe exatamente onde está e o que falta para chegar lá.",
  },
  {
    tag: "honestidade",
    title: '"Não sei" é uma resposta válida',
    description:
      "Quando a informação não está nos seus materiais, o sistema avisa. Não inventa, não improvisa, não alucina. Uma IA que admite limites é mais útil que uma que finge.",
  },
];

const STATS = [
  { value: "0%", label: "de alucinação com suas fontes" },
  { value: "3×", label: "mais retenção vs. IA genérica" },
  { value: "2min", label: "para começar a estudar" },
];
