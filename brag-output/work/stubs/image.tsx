import type { ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean };

/** next/image vira um <img> simples: o video e estatico, nao precisa de otimizacao. */
export default function Image({
  alt,
  priority: _priority,
  fill: _fill,
  sizes: _sizes,
  ...rest
}: Props) {
  return <img alt={alt} {...rest} />;
}
