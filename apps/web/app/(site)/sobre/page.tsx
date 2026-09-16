import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre o projeto',
  description:
    'O que é o Cripto Curitiba, como funciona a verificação dos estabelecimentos e como falar com a gente.',
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <header>
        <h1 className="font-display text-4xl">Sobre o Cripto Curitiba</h1>
        <p className="mt-3 text-lg text-muted">
          Um diretório independente dos lugares de Curitiba que aceitam criptomoedas.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Por que existe</h2>
        <p className="text-muted">
          Os mapas globais e nacionais de estabelecimentos cripto têm dois problemas: cobertura rasa
          em Curitiba e dado velho. Aqui o foco é uma cidade só, com curadoria local e a data da
          última confirmação sempre à vista.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Como funciona a verificação</h2>
        <ul className="space-y-3 text-muted">
          <li>
            <strong className="text-verified">Verificado</strong> — alguém da equipe confirmou
            diretamente com o estabelecimento, por telefone, mensagem ou visita. A data da
            confirmação fica registrada em cada forma de pagamento.
          </li>
          <li>
            <strong className="text-community">Reportado pela comunidade</strong> — a informação
            chegou pelo formulário público e passou por moderação, mas ainda não foi confirmada
            diretamente.
          </li>
          <li>
            <strong>Confirmar informação</strong> — passou de um ano sem nova confirmação. Continua
            listado, mas com o aviso de que pode ter mudado.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">O que este site não faz</h2>
        <p className="text-muted">
          O Cripto Curitiba não intermedia pagamentos, não custodia fundos, não vende nem compra
          cripto e não recebe para listar. É um diretório de informação. Confirme as condições
          diretamente com o estabelecimento antes de pagar.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Participe</h2>
        <p className="text-muted">
          Conhece um lugar que aceita cripto? Viu algo errado?{' '}
          <Link href="/sugerir" className="text-primary hover:underline">
            Use o formulário
          </Link>{' '}
          — toda sugestão passa por moderação antes de entrar no ar.
        </p>
      </section>
    </div>
  );
}
