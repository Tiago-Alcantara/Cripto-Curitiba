import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Icone para "adicionar a tela de inicio" no iOS/Safari. Sem cantos
 * arredondados aqui: o iOS aplica a mascara dele por cima. Com mais espaco
 * que o favicon, o pino ganha de volta o furo branco do centro (o mesmo
 * detalhe dos pinos verificados no mapa).
 */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0e5c43',
      }}
    >
      <svg
        width="88"
        height="115"
        viewBox="0 0 26 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Cripto Curitiba"
      >
        <title>Cripto Curitiba</title>
        <path
          d="M13 0C5.82 0 0 5.82 0 13c0 9.2 11.6 20.2 12.1 20.7a1.3 1.3 0 0 0 1.8 0C14.4 33.2 26 22.2 26 13 26 5.82 20.18 0 13 0Z"
          fill="#fff"
        />
        <circle cx="13" cy="13" r="5" fill="#0e5c43" />
      </svg>
    </div>,
    { ...size },
  );
}
