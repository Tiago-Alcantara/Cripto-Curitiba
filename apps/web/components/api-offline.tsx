import Link from 'next/link';

/**
 * A API vive na VPS; a Vercel nao pode ficar refem dela. Quando a listagem nao
 * carrega, a pagina diz isso em vez de mostrar "0 lugares" — numero errado e
 * pior que aviso de erro num diretorio que vende confianca no dado.
 */
export function ApiOffline({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      className={`rounded-[2px] border border-regua border-dashed bg-papel-claro text-center ${
        compacto ? 'px-4 py-6' : 'px-6 py-12'
      }`}
    >
      <h2 className="m-0 font-display font-medium text-[21px]">
        Não conseguimos carregar o registro agora
      </h2>
      <p className="mx-auto mt-2 mb-0 max-w-md text-[14px] text-tinta-media">
        A lista fica fora do ar por alguns instantes quando o servidor é atualizado. Recarregue a
        página em um minuto.
      </p>
      <Link
        href="/indicar"
        className="mt-4 inline-block font-bold text-[11.5px] text-verde uppercase tracking-[0.11em] hover:text-verde-escuro"
      >
        Enquanto isso, indique um local →
      </Link>
    </div>
  );
}
