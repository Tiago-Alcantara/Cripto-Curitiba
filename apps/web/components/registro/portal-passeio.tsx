/**
 * Peca-heroi: Portal do Passeio Publico (1886) em formas chapadas — torres de
 * tijolo com pinaculo em losango, vaos laterais com grade e o arco central
 * com o mapa de pinhoes. Exclusivo do heroi; nao repetir como icone.
 */
function Torre() {
  return (
    <div className="flex w-[clamp(26px,3.4vw,40px)] flex-col items-center">
      <div className="-mb-1 h-[11px] w-[11px] rotate-45 bg-terracota" />
      <div
        className="h-[clamp(150px,20vw,214px)] w-full rounded-t-[2px] bg-terracota"
        style={{
          backgroundImage: 'linear-gradient(#efe9dd,#efe9dd)',
          backgroundSize: '100% 4px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0 22px',
        }}
      />
    </div>
  );
}

function VaoLateral() {
  return (
    <div className="grade-portal h-[clamp(112px,15vw,158px)] max-w-[96px] flex-1 rounded-t-[60px] border-[2.5px] border-pinheiro border-b-0 bg-papel" />
  );
}

function Pilar() {
  return <div className="h-[clamp(150px,20vw,214px)] w-2.5 rounded-t-[2px] bg-pinheiro" />;
}

export function PortalPasseio() {
  return (
    <figure className="m-0 flex flex-col items-center" aria-hidden>
      <div className="flex w-full items-end justify-center gap-1.5">
        <Torre />
        <VaoLateral />
        <Pilar />
        <div className="relative h-[clamp(210px,28vw,308px)] max-w-[236px] flex-[1.6] overflow-hidden rounded-t-[130px] border-[3px] border-pinheiro border-b-0 bg-pinheiro">
          <div className="grade-creme absolute inset-0" />
          <div className="pinhao absolute top-[22%] left-[26%] h-[15px] w-[15px] bg-ocre" />
          <div className="pinhao absolute top-[47%] left-[63%] h-[15px] w-[15px] bg-ocre" />
          <div className="pinhao absolute top-[70%] left-[38%] h-[15px] w-[15px] border-[1.5px] border-verde bg-papel" />
        </div>
        <Pilar />
        <VaoLateral />
        <Torre />
      </div>
      <div className="h-[13px] w-full rounded-[2px] bg-pinheiro" />
      <figcaption className="mt-3 text-center font-mono text-[10px] text-tinta-fraca uppercase tracking-[0.16em]">
        Portal do Passeio Público · 1886
      </figcaption>
    </figure>
  );
}
