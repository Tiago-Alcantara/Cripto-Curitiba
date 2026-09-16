import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'Quais dados o Cripto Curitiba coleta e como pedir remoção.',
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <header>
        <h1 className="font-display text-4xl">Privacidade</h1>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Dados de estabelecimentos</h2>
        <p className="text-muted">
          O site publica apenas informações comerciais públicas: nome, endereço, contato divulgado
          pelo próprio estabelecimento e formas de pagamento aceitas. Nenhum dado pessoal de
          proprietários ou funcionários é publicado.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Dados de quem envia sugestão</h2>
        <p className="text-muted">
          O formulário de sugestão coleta, opcionalmente, nome e e-mail — usados só para esclarecer
          dúvidas sobre o envio. Guardamos também um hash do endereço IP (não o IP em si) para
          conter spam. Nada disso é publicado nem compartilhado.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Remoção</h2>
        <p className="text-muted">
          É dono de um estabelecimento listado e quer sair do diretório, ou quer apagar uma sugestão
          que enviou? Peça pelo formulário de contato ou por e-mail e a remoção é feita sem
          perguntas.
        </p>
      </section>
    </div>
  );
}
