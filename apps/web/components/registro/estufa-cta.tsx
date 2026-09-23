import Link from 'next/link';

/*
 * Elevacao em traco fino da Estufa do Jardim Botanico (1991) apoiando a caixa
 * de CTA. E a unica peca em line-art do site — foi pedida assim; nao converter
 * para massa cheia (docs/05-design.md).
 */

const MONTANTES = Array.from({ length: 35 }, (_, i) => 45 + i * 15);
const TRAVESSAS = [178, 196, 214, 232];
// Arcada de 10 vaos: quatro de cada lado + o portico central de dois vaos fundidos.
const VAOS_ARCADA = [75, 121, 167, 213, 351, 397, 443, 489];

/** Cupula com arcos concentricos, meridiano, tres latitudes e pinaculo. */
function Cupula({
  cx,
  rx,
  ry,
  latitudes,
}: {
  cx: number;
  rx: number;
  ry: number;
  latitudes: [number, number][];
}) {
  const base = 160;
  const topo = base - ry;

  return (
    <>
      <path d={`M${cx - rx} ${base}A${rx} ${ry} 0 0 1 ${cx + rx} ${base}`} />
      <path
        d={`M${cx - rx * 0.3} ${base}A${rx * 0.3} ${ry} 0 0 1 ${cx + rx * 0.3} ${base}`}
        opacity="0.6"
      />
      <path
        d={`M${cx - rx * 0.6} ${base}A${rx * 0.6} ${ry} 0 0 1 ${cx + rx * 0.6} ${base}`}
        opacity="0.6"
      />
      <path d={`M${cx} ${base}V${topo}`} opacity="0.6" />
      {latitudes.map(([y, meia]) => (
        <path key={y} d={`M${cx - meia} ${y}A${meia} 10 0 0 0 ${cx + meia} ${y}`} opacity="0.6" />
      ))}
      <circle cx={cx} cy={topo - 6} r="3.5" />
      <path d={`M${cx - rx} ${base}H${cx + rx}`} opacity="0.6" />
    </>
  );
}

function ElevacaoEstufa() {
  return (
    <svg
      viewBox="0 0 600 262"
      width="100%"
      className="mx-auto block h-auto max-w-[620px]"
      fill="none"
      stroke="#0f6b4f"
      strokeWidth="1.1"
      strokeLinecap="round"
      role="img"
      aria-label="Elevação da Estufa do Jardim Botânico de Curitiba"
    >
      {MONTANTES.map((x) => (
        <path key={`v${x}`} d={`M${x} 166V250`} opacity="0.35" />
      ))}
      {TRAVESSAS.map((y) => (
        <path key={`h${y}`} d={`M32 ${y}H568`} opacity="0.35" />
      ))}
      <path d="M30 250V200Q30 160 70 160H530Q570 160 570 200V250Z" />

      <Cupula
        cx={165}
        rx={78}
        ry={66}
        latitudes={[
          [140, 74],
          [124, 65],
          [109, 49],
        ]}
      />
      <Cupula
        cx={300}
        rx={100}
        ry={86}
        latitudes={[
          [134, 95],
          [113, 84],
          [93, 63],
        ]}
      />
      <Cupula
        cx={435}
        rx={78}
        ry={66}
        latitudes={[
          [140, 74],
          [124, 65],
          [109, 49],
        ]}
      />

      {VAOS_ARCADA.map((x) => (
        <g key={`a${x}`}>
          <path d={`M${x} 250V206A18 18 0 0 1 ${x + 36} 206V250`} />
          <path d={`M${x + 6} 250V208A12 12 0 0 1 ${x + 30} 208V250`} opacity="0.55" />
        </g>
      ))}
      <path d="M256 250V198A44 44 0 0 1 344 198V250" />
      <path d="M263 250V200A37 37 0 0 1 337 200V250" opacity="0.55" />
      <path d="M300 250V163" opacity="0.45" />
      <path d="M38 250V222A14 14 0 0 1 66 222V250" />
      <path d="M536 250V222A14 14 0 0 1 564 222V250" />
      <path d="M18 250H582" />
      <path d="M30 160H570" opacity="0.55" />
    </svg>
  );
}

export function EstufaCta() {
  return (
    <section className="mx-auto max-w-[1140px] px-7 pt-14 pb-[72px]">
      <ElevacaoEstufa />
      <div className="mt-[18px] h-[7px] bg-verde" aria-hidden />

      <div className="flex flex-wrap items-center justify-between gap-6 border-[3px] border-verde bg-verde px-[34px] py-[30px]">
        <div>
          <p className="mt-0 mb-[5px] font-display font-medium text-[25px] text-creme leading-[1.15]">
            Conhece um lugar que aceita cripto?
          </p>
          <p className="m-0 font-mono text-[#b9cfc4] text-[11px] uppercase tracking-[0.1em]">
            Leva 2 minutos · a equipe confirma antes de publicar
          </p>
        </div>
        <Link
          href="/indicar"
          className="whitespace-nowrap rounded-[2px] bg-creme px-[26px] py-3.5 font-bold text-[12.5px] text-verde uppercase tracking-[0.11em] transition-colors hover:bg-ocre hover:text-tinta hover:no-underline"
        >
          Indicar local
        </Link>
      </div>
      <div className="h-[11px] bg-verde" aria-hidden />

      <div className="flex items-center justify-center gap-3.5 pt-4" aria-hidden>
        <div className="h-[11px] w-[11px] rotate-45 border-[1.5px] border-verde" />
        <div className="h-[11px] w-[11px] rotate-45 bg-verde" />
        <div className="h-[13px] w-[13px] rounded-full bg-ocre" />
        <div className="h-[11px] w-[11px] rotate-45 bg-verde" />
        <div className="h-[11px] w-[11px] rotate-45 border-[1.5px] border-verde" />
      </div>
      <p className="mt-3 mb-0 text-center font-mono text-[9.5px] text-tinta-fraca uppercase tracking-[0.16em]">
        estufa de três naves · Jardim Botânico de Curitiba, 1991
      </p>
    </section>
  );
}
