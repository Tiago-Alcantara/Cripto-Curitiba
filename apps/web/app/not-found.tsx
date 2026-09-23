import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-7 py-24 text-center">
      <h1 className="m-0 font-display font-medium text-[40px] leading-none">
        Página não encontrada
      </h1>
      <p className="mt-4 mb-0 text-[15.5px] text-tinta-media leading-[1.65]">
        O link pode estar errado, ou o lugar saiu do diretório por ter parado de aceitar cripto.
      </p>
      <Link
        href="/mapa"
        className="mt-6 inline-flex cursor-pointer rounded-[2px] border-0 bg-verde px-6 py-3.5 font-bold text-[12.5px] text-creme uppercase tracking-[0.11em] hover:bg-verde-escuro hover:text-creme"
      >
        Voltar ao mapa
      </Link>
    </div>
  );
}
