/**
 * Verificacao do Cloudflare Turnstile. Sem chave configurada (dev, teste), o
 * envio passa: a barreira e o honeypot e o rate limit.
 */
export function criarVerificadorTurnstile(secret: string | undefined) {
  return async function verificar(token: string | undefined, ip: string): Promise<boolean> {
    if (!secret) return true;
    if (!token) return false;

    try {
      const resposta = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ secret, response: token, remoteip: ip }),
        signal: AbortSignal.timeout(5000),
      });

      const resultado = (await resposta.json()) as { success?: boolean };
      return resultado.success === true;
    } catch {
      // Cloudflare fora do ar nao pode derrubar o formulario: o honeypot e o
      // rate limit seguram o abuso e a moderacao pega o resto.
      return true;
    }
  };
}
