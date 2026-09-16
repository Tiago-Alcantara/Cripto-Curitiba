'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">Algo deu errado</h1>
      <p className="mt-3 text-muted">
        Não conseguimos carregar esta página agora. Pode ser instabilidade momentânea.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-control bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover"
      >
        Tentar de novo
      </button>
    </div>
  );
}
