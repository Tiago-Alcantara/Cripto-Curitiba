import type { Metadata } from 'next';
import Link from 'next/link';
import { Curadoria } from '@/components/registro/curadoria';
import { EstufaCta } from '@/components/registro/estufa-cta';
import { Calcada, Cornija, linkTexto, Rotulo, Selo } from '@/components/registro/ui';

export const metadata: Metadata = {
  title: 'Sobre o projeto',
  description:
    'O que é a CriptoCuritiba, como funciona a verificação dos estabelecimentos e como falar com a gente.',
};

const h2 = 'mt-0 mb-3.5 font-display font-medium text-[27px]';
const paragrafo = 'mt-0 text-[15.5px] text-tinta-suave leading-[1.7]';

export default function SobrePage() {
  // So ilustra o selo (confirmado ha um mes): nao e dado de nenhum local.
  const exemploVerificado = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  return (
    <div className="animate-entrada">
      <article className="mx-auto w-full max-w-[720px] px-7 pt-12 pb-14">
        <Rotulo className="mb-2.5">Expediente</Rotulo>
        <h1 className="mt-0 mb-5 font-display font-medium text-[clamp(32px,5vw,50px)] leading-none">
          Sobre a CriptoCuritiba
        </h1>
        <Cornija className="mb-7" />

        <p className="mt-0 mb-[18px] text-[16.5px] text-tinta-suave leading-[1.72]">
          <span className="float-left pt-[7px] pr-3 font-display text-[74px] text-verde leading-[0.74]">
            A
          </span>{' '}
          CriptoCuritiba é um guia da cidade que, por acaso, fala de cripto. Não somos corretora,
          não movimentamos dinheiro e não custodiamos nada — só indicamos onde, em Curitiba, você
          pode pagar com Bitcoin e outras criptomoedas.
        </p>
        <p className="mt-0 mb-[18px] text-[16px] text-tinta-suave leading-[1.72]">
          O projeto é mantido pela comunidade: qualquer pessoa pode indicar um local novo ou apontar
          uma correção. Um pequeno time confirma cada informação antes de publicar.
        </p>

        <Calcada className="my-9" />

        <h2 className={h2}>Como verificamos</h2>
        <p className={`${paragrafo} mb-[22px]`}>
          Cada local recebe um dos dois selos abaixo, sempre visível — nunca escondido em letra
          miúda.
        </p>
        <div className="mb-5 flex flex-wrap gap-[26px]">
          <div className="flex items-center gap-3">
            <Selo status="verificado" confirmadoEm={exemploVerificado} tamanho="md" />
            <span className="text-[13.5px] text-tinta-media">visita ou contato direto</span>
          </div>
          <div className="flex items-center gap-3">
            <Selo status="comunidade" tamanho="md" />
            <span className="text-[13.5px] text-tinta-media">informado, ainda não checado</span>
          </div>
        </div>
        <p className={`${paragrafo} mb-[30px]`}>
          Informação confirmada há mais de um ano continua no registro, mas ganha o aviso{' '}
          <em>confirmar informação</em> — pode ter mudado.
        </p>

        <h2 className={h2}>O primeiro da lista</h2>
        <p className={`${paragrafo} mb-[30px]`}>
          A Tartuferia San Paulo está entre os primeiros estabelecimentos de Curitiba a aceitar
          bitcoin — por isso é a semente de conteúdo do registro. Se você conhece a história de
          outros pioneiros locais,{' '}
          <Link href="/indicar" className={linkTexto}>
            conte pra gente
          </Link>
          .
        </p>

        <div className="mb-[30px] border-regua border-t" />

        <h2 className={h2}>O que este site não faz</h2>
        <ul className="mt-0 mb-[30px] pl-[19px] text-[15.5px] text-tinta-suave leading-[1.85]">
          <li>Não intermedia pagamentos nem movimenta cripto</li>
          <li>Não custodia fundos de ninguém</li>
          <li>Não é recomendação financeira</li>
          <li>Não recebe para listar ninguém</li>
        </ul>

        <h2 className={h2}>Fale com a gente</h2>
        <p className={`${paragrafo} mb-0`}>
          Encontrou um dado errado, um local que fechou, ou quer contribuir com a curadoria? Use a{' '}
          <Link href="/indicar" className={linkTexto}>
            ficha de indicação
          </Link>{' '}
          ou nos encontre no Instagram, X e Discord. Dúvidas sobre dados pessoais estão em{' '}
          <Link href="/privacidade" className={linkTexto}>
            Privacidade
          </Link>
          .
        </p>
      </article>

      <Curadoria />
      <EstufaCta />
    </div>
  );
}
