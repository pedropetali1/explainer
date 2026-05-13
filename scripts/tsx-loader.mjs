// Node ESM loader que neutraliza o pacote `server-only` durante scripts de teste.
// O pacote lança erro fora de bundle do Next; aqui o substituímos por um módulo vazio.

const SERVER_ONLY = "server-only";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === SERVER_ONLY) {
    return { url: "data:text/javascript,export%20%7B%7D;", shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
