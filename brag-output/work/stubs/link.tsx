import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string | object;
  children?: ReactNode;
};

export default function Link({ href, children, ...rest }: Props) {
  return (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  );
}
