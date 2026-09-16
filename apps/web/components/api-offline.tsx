import Link from 'next/link';

/**
 * A API vive na VPS; a Vercel nao pode ficar refem dela. Quando a listagem nao
 * carrega, a pagina diz isso em vez de mostrar "0 lugares" — numero errado e
 * pior que aviso de erro num diretorio que vende confianca no dado.
 */
export function ApiOffline({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      className={`rounded-card border border-border border-dashed bg-surface text-center ${
        compacto ? 'px-4 py-6' : 'px-6 py-12'
      }`}
    >
      <h2 className="font-medium text-lg">Não conseguimos carregar os lugares agora</h2>
      <p className="mx-auto mt-2 max-w-md text-muted text-sm">
        A lista fica fora do ar por alguns instantes quando o servidor é atualizado. Recarregue a
        página em um minuto.
      </p>
      <Link href="/sugerir" className="mt-4 inline-block text-primary text-sm hover:underline">
        Enquanto isso, você pode sugerir um lugar
      </Link>
    </div>
  );
}
