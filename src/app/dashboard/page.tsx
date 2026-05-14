import Link from "next/link";
import { ArrowUpRight, BookOpen, FileText, ListChecks, TrendingUp } from "lucide-react";

const QUICK_LINKS = [
  {
    href: "/dashboard/materials",
    title: "Adicionar material",
    description: "Faça upload de PDFs para a IA aprender com eles.",
    icon: FileText,
    number: "01",
  },
  {
    href: "/dashboard/study",
    title: "Conversar com a IA",
    description: "Tire dúvidas usando o seu próprio material.",
    icon: BookOpen,
    number: "02",
  },
  {
    href: "/dashboard/questions",
    title: "Praticar questões",
    description: "Gere e responda questões personalizadas.",
    icon: ListChecks,
    number: "03",
  },
  {
    href: "/dashboard/progress",
    title: "Ver progresso",
    description: "Acompanhe acertos por tópico.",
    icon: TrendingUp,
    number: "04",
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-12 max-w-5xl">
      <header className="space-y-3">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Painel
        </p>
        <h1 className="font-heading text-4xl md:text-5xl tracking-tight leading-tight">
          Bem-vindo de volta.
        </h1>
        <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
          Continue de onde parou ou comece uma nova sessão. Cada material que
          você adiciona deixa a IA mais afiada no seu conteúdo.
        </p>
      </header>

      <section className="grid gap-px sm:grid-cols-2 border border-border rounded-lg overflow-hidden bg-border">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group relative bg-background p-6 transition-colors duration-200 hover:bg-muted/40 flex flex-col gap-6 min-h-[180px]"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border">
                <link.icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span className="text-[10px] tracking-widest">{link.number}</span>
            </div>
            <div className="mt-auto space-y-1.5">
              <h2 className="font-heading text-2xl tracking-tight leading-tight">
                {link.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {link.description}
              </p>
            </div>
            <ArrowUpRight className="absolute top-6 right-6 h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-accent transition-all duration-200" />
          </Link>
        ))}
      </section>
    </div>
  );
}
