import { Button } from "@/components/ui/button";

interface HeaderProps {
  userEmail?: string;
  userName?: string;
}

export function Header({ userEmail, userName }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-8">
      <div className="text-sm text-muted-foreground">
        {userName ? (
          <span>
            <span className="text-muted-foreground/70">Olá,</span>{" "}
            <span className="text-foreground font-medium">{userName}</span>
          </span>
        ) : (
          userEmail
        )}
      </div>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="sm">
          Sair
        </Button>
      </form>
    </header>
  );
}
