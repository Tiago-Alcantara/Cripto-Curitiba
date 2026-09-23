/** Pinhao minimalista: corpo terracota e coroa marrom, duas cores chapadas. */
function Pinhao({ escala }: { escala: number }) {
  return (
    <div
      className="relative h-[82px] w-[38px] shrink-0"
      style={{ transform: `scale(${escala})` }}
      aria-hidden
    >
      <div className="absolute top-[11px] left-0 h-[71px] w-[38px] rounded-[44%_44%_50%_50%/30%_30%_70%_70%] bg-terracota" />
      <div className="absolute top-0 left-1 h-5 w-[30px] rounded-[44%_44%_46%_46%/62%_62%_38%_38%] bg-[#4a2013]" />
    </div>
  );
}

export function Pinhoes({ total }: { total: number | null }) {
  return (
    <section className="mx-auto grid max-w-[1140px] grid-cols-[repeat(auto-fit,minmax(270px,1fr))] items-center gap-11 px-7 py-[52px]">
      <div>
        <div className="mb-3 font-mono text-[10.5px] text-tinta-fraca uppercase tracking-[0.2em]">
          Araucaria angustifolia
        </div>
        <h2 className="mt-0 mb-4 font-display font-medium text-[clamp(26px,3.2vw,34px)] leading-[1.08]">
          O pinhão é o nosso pin
        </h2>
        <p className="mt-0 mb-3.5 max-w-[460px] text-[15.5px] text-tinta-media leading-[1.65]">
          Cada marcador do mapa tem a forma de um pinhão — a semente da araucária, árvore-símbolo do
          Paraná e sombra de toda praça da cidade. Quando alguém da comunidade indica um lugar novo,
          um pinhão é plantado no mapa.
        </p>
        {total !== null ? (
          <p className="m-0 font-mono text-[11px] text-tinta-fraca uppercase tracking-[0.1em]">
            {total} {total === 1 ? 'pinhão plantado' : 'pinhões plantados'} até agora
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-end justify-center gap-[30px]">
        <Pinhao escala={0.78} />
        <Pinhao escala={1} />
        <Pinhao escala={0.9} />
      </div>
    </section>
  );
}
