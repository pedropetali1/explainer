import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QUICK_LINKS = [
  {
    href: "/dashboard/materials",
    title: "Adicionar material",
    description: "Faça upload de PDFs para a IA aprender com eles.",
  },
  {
    href: "/dashboard/study",
    title: "Conversar com a IA",
    description: "Tire dúvidas usando o seu próprio material.",
  },
  {
    href: "/dashboard/questions",
    title: "Praticar questões",
    description: "Gere e responda questões personalizadas.",
  },
  {
    href: "/dashboard/progress",
    title: "Ver progresso",
    description: "Acompanhe acertos por tópico.",
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Início</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Continue de onde parou ou comece uma nova sessão.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:bg-muted/40 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base">{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
