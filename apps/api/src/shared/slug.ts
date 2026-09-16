/** "Tartuferia San Paulo" -> "tartuferia-san-paulo" */
export function gerarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

/** Acrescenta sufixo numerico enquanto o slug ja existir. */
export async function slugDisponivel(
  base: string,
  existe: (slug: string) => Promise<boolean>,
): Promise<string> {
  const raiz = gerarSlug(base) || 'estabelecimento';

  if (!(await existe(raiz))) return raiz;

  for (let sufixo = 2; sufixo < 100; sufixo += 1) {
    const candidato = `${raiz}-${sufixo}`;
    if (!(await existe(candidato))) return candidato;
  }

  return `${raiz}-${Date.now()}`;
}
