import Link from "next/link";
import { ArrowUpRight, Sparkles, FileText, MessagesSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function MarketingHome() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-xl tracking-tight">Explainer</span>
          <span className="text-xs text-muted-foreground tracking-wider uppercase">
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
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center max-w-3xl mx-auto fade-in">
        <span className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-muted-foreground mb-8">
          <span className="h-px w-8 bg-border" />
          Tutor de IA por nicho
          <span className="h-px w-8 bg-border" />
        </span>

        <h1 className="font-heading text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-2xl">
          Estude com uma IA que conhece o{" "}
          <em className="text-accent not-italic font-heading">seu</em> material.
        </h1>

        <p className="mt-8 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Faça upload das suas apostilas, PDFs e editais. A IA explica, gera
          questões e corrige com feedback — tudo baseado no conteúdo que você
          está estudando.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className={buttonVariants({ size: "lg", variant: "accent" })}
          >
            Criar conta grátis
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      <section className="border-t border-b">
        <div className="max-w-5xl mx-auto px-6 py-24 grid gap-12 md:grid-cols-3">
          <FeatureBlock
            icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}
            number="01"
            title="Seu material indexado"
            description="A IA aprende com seus PDFs e cita a página exata em cada resposta."
          />
          <FeatureBlock
            icon={<MessagesSquare className="h-4 w-4" strokeWidth={1.5} />}
            number="02"
            title="Conversa contextual"
            description="Pergunte, peça resumos, conecte conceitos — sempre dentro do seu conteúdo."
          />
          <FeatureBlock
            icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />}
            number="03"
            title="Questões e correção"
            description="Gere questões a partir do material e receba feedback detalhado."
          />
        </div>
      </section>

      <footer className="px-8 py-8 flex items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Explainer</span>
        <span className="tracking-wider uppercase">Feito para quem estuda fundo</span>
      </footer>
    </main>
  );
}

function FeatureBlock({
  icon,
  number,
  title,
  description,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border">
          {icon}
        </span>
        <span className="text-xs tracking-widest">{number}</span>
      </div>
      <h3 className="font-heading text-2xl tracking-tight leading-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
