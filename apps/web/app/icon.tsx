import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Icone da aba do navegador, gerado em codigo (sem arquivo binario para
 * versionar). Reaproveita o mesmo pino desenhado em SVG usado nos mapas
 * (components/map-view.tsx), so que solido — na escala de um favicon o furo
 * branco do meio vira ruido, entao fica so para o apple-icon, maior.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0e5c43',
        borderRadius: 7,
      }}
    >
      <svg
        width="18"
        height="23"
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
      </svg>
    </div>,
    { ...size },
  );
}
