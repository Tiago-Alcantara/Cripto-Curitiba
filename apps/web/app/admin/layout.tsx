import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoutButton } from '@/components/admin/logout-button';

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-border border-b bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold">
              Painel · Cripto<span className="text-primary">Curitiba</span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-muted hover:text-foreground">
                Sugestões
              </Link>
              <Link href="/admin/estabelecimentos" className="text-muted hover:text-foreground">
                Estabelecimentos
              </Link>
              <Link href="/" className="text-muted hover:text-foreground">
                Ver o site
              </Link>
            </nav>
          </div>

          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
