import type { CodigoErro } from '@cripto/shared';

export class AppError extends Error {
  constructor(
    readonly code: CodigoErro,
    readonly statusCode: number,
    message: string,
    readonly details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(recurso: string) {
    super('NOT_FOUND', 404, `${recurso} nao encontrado`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autenticacao necessaria') {
    super('UNAUTHORIZED', 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super('FORBIDDEN', 403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', 409, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: { path: string; message: string }[]) {
    super('VALIDATION_ERROR', 400, message, details);
  }
}
