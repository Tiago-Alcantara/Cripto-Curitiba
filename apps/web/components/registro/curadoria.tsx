const PASSOS = [
  {
    numero: '01',
    titulo: 'A comunidade indica',
    texto: 'Qualquer pessoa envia um local novo ou uma correção pelo formulário.',
  },
  {
    numero: '02',
    titulo: 'A equipe confirma',
    texto: 'Um admin verifica por contato direto ou visita antes de aprovar.',
  },
  {
    numero: '03',
    titulo: 'O selo é publicado',
    texto: 'O local entra no mapa com a data da confirmação, visível pra todo mundo.',
  },
];

/** Regua "Como a curadoria funciona": tres colunas numeradas sobre papel quente. */
export function Curadoria() {
  return (
    <section className="border-regua border-y bg-papel-quente">
      <div className="mx-auto max-w-[1140px] px-7 py-[52px]">
        <h2 className="mt-0 mb-[30px] font-display font-medium text-[clamp(26px,3.2vw,34px)] leading-none">
          Como a curadoria funciona
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-y-6 p-0">
          {PASSOS.map((passo, indice) => (
            <li
              key={passo.numero}
              className={`pr-6 ${indice > 0 ? 'sm:pl-6' : ''} ${
                indice < PASSOS.length - 1 ? 'sm:border-regua sm:border-r' : ''
              }`}
            >
              <div className="mb-2.5 font-mono text-[11px] text-ocre-escuro tracking-[0.16em]">
                № {passo.numero}
              </div>
              <h3 className="mt-0 mb-2 font-display font-medium text-[20px]">{passo.titulo}</h3>
              <p className="m-0 text-[14px] text-tinta-media leading-[1.55]">{passo.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
