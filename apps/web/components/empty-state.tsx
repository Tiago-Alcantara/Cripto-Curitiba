import Link from 'next/link';

type Props = {
  titulo: string;
  descricao: string;
  acao?: { href: string; texto: string };
};

export function EmptyState({ titulo, descricao, acao }: Props) {
  return (
    <div className="rounded-card border border-border border-dashed bg-surface px-6 py-12 text-center">
      <h3 className="font-medium text-lg">{titulo}</h3>
      <p className="mx-auto mt-2 max-w-md text-muted text-sm">{descricao}</p>
      {acao ? (
        <Link
          href={acao.href}
          className="mt-5 inline-flex rounded-control bg-primary px-4 py-2 font-medium text-sm text-white hover:bg-primary-hover"
        >
          {acao.texto}
        </Link>
      ) : null}
    </div>
  );
}
