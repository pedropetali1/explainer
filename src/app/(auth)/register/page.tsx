import Link from "next/link";
import { RegisterForm } from "./register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Comece a estudar com sua IA personalizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-sm text-center text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-foreground font-medium">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
