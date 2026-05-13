import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function MarketingHome() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b">
        <Link href="/" className="font-semibold text-lg">
          Explainer
        </Link>
        <nav className="flex gap-3">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Entrar
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Começar grátis
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Estude com uma IA que conhece o seu material.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Faça upload das suas apostilas, PDFs e editais. A IA explica, gera
          questões e corrige com feedback — tudo baseado no conteúdo que você
          está estudando.
        </p>
        <div className="mt-10 flex gap-3">
          <Link
            href="/register"
            className={buttonVariants({ size: "lg" })}
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Já tenho conta
          </Link>
        </div>
      </section>
    </main>
  );
}
