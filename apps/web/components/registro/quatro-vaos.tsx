/*
 * "Os quatro vaos": arcada de vidracas sobre verde-pinheiro. Cada vao tem tres
 * registros que nao se sobrepoem — pedra-chave (y14–30), motivo 64px
 * (y40–104) e pastilha do numeral (y124–182). Motivos so com `fill`, nunca
 * traco, para casar com a linguagem chapada do heroi.
 */

function Araucaria() {
  return (
    <svg viewBox="0 0 96 96" width="64" height="64" fill="none" aria-hidden="true">
      <rect x="43" y="56" width="10" height="38" fill="#8c2f1b" />
      <path d="M34 42h28L48 14 34 42z" fill="#c9902c" />
      <path d="M22 62h52L62 40H34L22 62z" fill="#8c2f1b" />
      <path d="M10 84h76L70 60H26L10 84z" fill="#c9902c" />
      <rect x="28" y="88" width="40" height="6" fill="#8c2f1b" />
    </svg>
  );
}

function RelogioPaco() {
  return (
    <svg viewBox="0 0 96 96" width="64" height="64" fill="none" aria-hidden="true">
      <rect x="26" y="56" width="44" height="38" fill="#8c2f1b" />
      <rect x="20" y="88" width="56" height="6" fill="#c9902c" />
      <circle cx="48" cy="44" r="32" fill="#c9902c" />
      <circle cx="48" cy="44" r="23" fill="#efe9dd" />
      <rect x="45" y="24" width="6" height="22" fill="#8c2f1b" />
      <rect x="45" y="41" width="19" height="6" fill="#8c2f1b" />
      <rect x="42" y="4" width="12" height="10" fill="#c9902c" />
    </svg>
  );
}

function EstacaoTubo() {
  return (
    <svg viewBox="0 0 96 96" width="64" height="64" fill="none" aria-hidden="true">
      <rect x="8" y="24" width="80" height="46" rx="23" fill="#c9902c" />
      <path d="M36 70V48a12 12 0 0 1 24 0v22H36z" fill="#efe9dd" />
      <rect x="45" y="48" width="6" height="22" fill="#8c2f1b" />
      <rect x="4" y="70" width="88" height="8" fill="#8c2f1b" />
      <rect x="18" y="78" width="12" height="14" fill="#8c2f1b" />
      <rect x="66" y="78" width="12" height="14" fill="#8c2f1b" />
    </svg>
  );
}

function FarolSaber() {
  return (
    <svg viewBox="0 0 96 96" width="64" height="64" fill="none" aria-hidden="true">
      <path d="M36 88h24l-4-54H40l-4 54z" fill="#c9902c" />
      <path d="M30 36h36L48 8 30 36z" fill="#8c2f1b" />
      <rect x="42" y="46" width="12" height="16" fill="#efe9dd" />
      <rect x="44" y="0" width="8" height="10" fill="#c9902c" />
      <rect x="26" y="88" width="44" height="6" fill="#8c2f1b" />
    </svg>
  );
}

const VAOS = [
  {
    numeral: 'I',
    motivo: <Araucaria />,
    vidro: '#20382f',
    titulo: 'Selo de verificação',
    texto: 'Verificado pela equipe ou reportado pela comunidade — nunca escondemos a diferença.',
  },
  {
    numeral: 'II',
    motivo: <RelogioPaco />,
    vidro: '#244136',
    titulo: 'Data de confirmação',
    texto: 'Diretório de cripto morre de desatualização. Cada selo diz quando foi checado.',
  },
  {
    numeral: 'III',
    motivo: <EstacaoTubo />,
    vidro: '#20382f',
    titulo: 'Curadoria de vizinho',
    texto: 'Qualquer pessoa indica um lugar novo. Um admin confirma antes de publicar.',
  },
  {
    numeral: 'IV',
    motivo: <FarolSaber />,
    vidro: '#244136',
    titulo: 'Só Curitiba',
    texto: 'Nada de base nacional genérica. Só as ruas e bairros que você caminha.',
  },
];

export function QuatroVaos() {
  return (
    <section
      id="painel-pastilha"
      aria-labelledby="painel-titulo"
      className="mt-[74px] bg-pinheiro pt-[70px] pb-[74px]"
    >
      <div className="mx-auto max-w-[1140px] px-7">
        <div className="font-mono text-[10px] text-ocre uppercase tracking-[0.2em]">
          Painel de pastilha · os quatro vãos
        </div>
        <h2
          id="painel-titulo"
          className="mt-4 mb-0 max-w-[740px] text-pretty font-display font-medium text-[clamp(26px,3.4vw,40px)] text-papel leading-[1.06]"
        >
          Por que este registro é diferente de um diretório qualquer
        </h2>
        <div className="mt-7 h-[3px] bg-[#3c5046]" />
        <div className="mt-[3px] h-px bg-[#27362e]" />

        <div className="mt-[38px] grid grid-cols-[repeat(auto-fit,minmax(176px,1fr))] gap-[3px]">
          {VAOS.map((vao) => (
            <article key={vao.numeral} className="flex flex-col gap-[3px]">
              <div
                className="vidraca relative flex h-[196px] items-end justify-center overflow-hidden rounded-[86px_86px_2px_2px] border-2 border-papel"
                style={{ backgroundColor: vao.vidro }}
                aria-hidden
              >
                <div className="-translate-x-1/2 absolute top-3.5 left-1/2 h-4 w-4 rotate-45 bg-ocre" />
                <div className="absolute inset-x-0 top-10 flex h-16 items-center justify-center">
                  {vao.motivo}
                </div>
                <div className="mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-[2px] bg-papel">
                  <span className="font-display font-medium text-[27px] text-pinheiro leading-none">
                    {vao.numeral}
                  </span>
                </div>
              </div>
              <div className="flex-1 rounded-[2px] bg-papel px-5 pt-5 pb-[22px]">
                <h3 className="m-0 font-display font-medium text-[20px] text-tinta leading-[1.16]">
                  {vao.titulo}
                </h3>
                <p className="mt-2.5 mb-0 text-pretty text-[14.5px] text-tinta-suave leading-[1.62]">
                  {vao.texto}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-[34px]">
          <div className="calcada-escura" aria-hidden />
          <div className="mt-3 font-mono text-[#b9c4bd] text-[10px] uppercase tracking-[0.14em]">
            calçada portuguesa · largo da ordem
          </div>
        </div>
      </div>
    </section>
  );
}
