export default function QuestionsPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <header className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Prática
        </p>
        <h1 className="font-heading text-3xl md:text-4xl tracking-tight leading-tight">
          Questões
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Banco de questões geradas a partir do seu material, com correção
          inteligente e feedback detalhado.
        </p>
      </header>

      <div className="border border-dashed border-border rounded-lg px-6 py-12 text-center">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Em breve
        </p>
        <p className="font-heading text-xl tracking-tight">
          Disponível na Fase 4
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Geração e correção de questões personalizadas pela IA.
        </p>
      </div>
    </div>
  );
}
