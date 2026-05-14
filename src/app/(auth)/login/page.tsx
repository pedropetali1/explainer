import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-6 pt-6 pb-2 space-y-1.5">
        <h1 className="font-heading text-2xl tracking-tight leading-tight">
          Entrar
        </h1>
        <p className="text-sm text-muted-foreground">
          Acesse sua conta para continuar estudando.
        </p>
      </div>
      <div className="px-6 pb-6 pt-4">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-sm text-center text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="text-foreground font-medium hover:text-accent transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
