'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  return (
    <button
      type="button"
      disabled={saindo}
      onClick={async () => {
        setSaindo(true);
        await fetch('/api/admin/session', { method: 'DELETE' });
        router.replace('/admin/login');
        router.refresh();
      }}
      className="text-muted text-sm hover:text-foreground disabled:opacity-50"
    >
      {saindo ? 'Saindo…' : 'Sair'}
    </button>
  );
}
