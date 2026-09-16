import { createHash } from 'node:crypto';
import type { NovaSugestao } from '@cripto/shared';
import { ValidationError } from '../../shared/errors.js';
import type { SuggestionsRepository } from './suggestions.repository.js';

const TIPO_PARA_BANCO = {
  novo_local: 'NEW_PLACE',
  atualizacao: 'UPDATE',
  reporte_erro: 'ERROR_REPORT',
} as const;

const LIMITE_POR_IP_EM_24H = 10;

export type ContextoEnvio = {
  ip: string;
  userAgent?: string;
};

type Dependencias = {
  repository: SuggestionsRepository;
  /** Verificacao do Turnstile; sem chave configurada, o envio passa direto. */
  verificarTurnstile: (token: string | undefined, ip: string) => Promise<boolean>;
};

/** O IP nunca e gravado: so o hash, suficiente para conter abuso (LGPD). */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

export function criarSuggestionsService({ repository, verificarTurnstile }: Dependencias) {
  return {
    async criar(entrada: NovaSugestao, contexto: ContextoEnvio) {
      // Honeypot: campo invisivel no formulario. Bot preenche, humano nao ve.
      if (entrada.website) {
        throw new ValidationError('Envio recusado');
      }

      if (!(await verificarTurnstile(entrada.turnstileToken, contexto.ip))) {
        throw new ValidationError('Nao foi possivel validar o envio. Recarregue a pagina.');
      }

      const ipHash = hashIp(contexto.ip);
      const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if ((await repository.contarRecentesPorIp(ipHash, ontem)) >= LIMITE_POR_IP_EM_24H) {
        throw new ValidationError('Muitas sugestoes enviadas hoje. Tente amanha.');
      }

      if (entrada.estabelecimentoId) {
        const existe = await repository.estabelecimentoExiste(entrada.estabelecimentoId);
        if (!existe) {
          throw new ValidationError('Estabelecimento informado nao existe');
        }
      }

      const sugestao = await repository.criar({
        type: TIPO_PARA_BANCO[entrada.tipo],
        establishmentId: entrada.estabelecimentoId ?? null,
        payload: (entrada.dados ?? {}) as object,
        message: entrada.mensagem ?? null,
        submitterName: entrada.remetente?.nome ?? null,
        submitterEmail: entrada.remetente?.email ?? null,
        ipHash,
        userAgent: contexto.userAgent?.slice(0, 300) ?? null,
      });

      return { id: sugestao.id, status: 'pendente' as const };
    },
  };
}

export type SuggestionsService = ReturnType<typeof criarSuggestionsService>;
