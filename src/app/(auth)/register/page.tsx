import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-6 pt-6 pb-2 space-y-1.5">
        <h1 className="font-heading text-2xl tracking-tight leading-tight">
          Criar conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Comece a estudar com sua IA personalizada.
        </p>
      </div>
      <div className="px-6 pb-6 pt-4">
        <RegisterForm />
        <p className="mt-6 text-sm text-center text-muted-foreground">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium hover:text-accent transition-colors"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
