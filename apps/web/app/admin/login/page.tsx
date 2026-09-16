import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/login-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="font-display text-3xl">Painel</h1>
      <p className="mt-2 text-muted text-sm">Acesso restrito à equipe do Cripto Curitiba.</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
