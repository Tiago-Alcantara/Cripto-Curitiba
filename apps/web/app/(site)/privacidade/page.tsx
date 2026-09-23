import type { Metadata } from 'next';
import { Cornija, Rotulo } from '@/components/registro/ui';

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'Quais dados o Cripto Curitiba coleta e como pedir remoção.',
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto w-full max-w-[720px] animate-entrada space-y-8 px-7 pt-12 pb-[84px]">
      <header>
        <Rotulo className="mb-2.5">Expediente</Rotulo>
        <h1 className="mt-0 mb-5 font-display font-medium text-[clamp(32px,5vw,50px)] leading-none">
          Privacidade
        </h1>
        <Cornija />
      </header>

      <section className="space-y-3">
        <h2 className="m-0 font-display font-medium text-[27px]">Dados de estabelecimentos</h2>
        <p className="m-0 text-[15.5px] text-tinta-suave leading-[1.7]">
          O site publica apenas informações comerciais públicas: nome, endereço, contato divulgado
          pelo próprio estabelecimento e formas de pagamento aceitas. Nenhum dado pessoal de
          proprietários ou funcionários é publicado.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="m-0 font-display font-medium text-[27px]">Dados de quem envia sugestão</h2>
        <p className="m-0 text-[15.5px] text-tinta-suave leading-[1.7]">
          O formulário de sugestão coleta, opcionalmente, nome e e-mail — usados só para esclarecer
          dúvidas sobre o envio. Guardamos também um hash do endereço IP (não o IP em si) para
          conter spam. Nada disso é publicado nem compartilhado.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="m-0 font-display font-medium text-[27px]">Remoção</h2>
        <p className="m-0 text-[15.5px] text-tinta-suave leading-[1.7]">
          É dono de um estabelecimento listado e quer sair do diretório, ou quer apagar uma sugestão
          que enviou? Peça pelo formulário de contato ou por e-mail e a remoção é feita sem
          perguntas.
        </p>
      </section>
    </div>
  );
}
