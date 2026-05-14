export default function ProgressPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <header className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Análise
        </p>
        <h1 className="font-heading text-3xl md:text-4xl tracking-tight leading-tight">
          Progresso
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Estatísticas e heatmap por tópico — entenda onde você está forte e o
          que precisa revisar.
        </p>
      </header>

      <div className="border border-dashed border-border rounded-lg px-6 py-12 text-center">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Em breve
        </p>
        <p className="font-heading text-xl tracking-tight">
          Disponível na Fase 5
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Heatmap de tópicos, mastery level e streak de estudo.
        </p>
      </div>
    </div>
  );
}
