import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Página não encontrada</h1>
      <p className="mt-3 text-muted">
        O link pode estar errado, ou o lugar saiu do diretório por ter parado de aceitar cripto.
      </p>
      <Link
        href="/estabelecimentos"
        className="mt-6 inline-flex rounded-control bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover"
      >
        Ver todos os lugares
      </Link>
    </div>
  );
}
