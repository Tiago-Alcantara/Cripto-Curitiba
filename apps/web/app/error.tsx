'use client';

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-7 py-24 text-center">
      <h1 className="m-0 font-display font-medium text-[36px] leading-none">Algo deu errado</h1>
      <p className="mt-4 mb-0 text-[15.5px] text-tinta-media leading-[1.65]">
        Não conseguimos carregar esta página agora. Pode ser instabilidade momentânea.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 cursor-pointer rounded-[2px] border-0 bg-verde px-6 py-3.5 font-bold text-[12.5px] text-creme uppercase tracking-[0.11em] hover:bg-verde-escuro hover:text-creme"
      >
        Tentar de novo
      </button>
    </div>
  );
}
