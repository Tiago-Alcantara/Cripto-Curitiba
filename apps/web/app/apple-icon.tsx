import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Icone para "adicionar a tela de inicio" no iOS/Safari: a mesma marca do
 * app/icon.svg (pinhao creme com miolo ocre sobre verde araucaria), sem os
 * cantos arredondados — o iOS aplica a mascara dele por cima.
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
        background: '#0f6b4f',
      }}
    >
      <svg
        width="180"
        height="180"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="CriptoCuritiba"
      >
        <title>CriptoCuritiba</title>
        <circle cx="32" cy="27" r="14" fill="#f4efe6" />
        <polygon points="32,53 19.5,38 44.5,38" fill="#f4efe6" />
        <circle cx="32" cy="26" r="6" fill="#d9a441" />
      </svg>
    </div>,
    { ...size },
  );
}
