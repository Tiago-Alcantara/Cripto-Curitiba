import type { AcceptedPayment, Crypto, Establishment, EstablishmentPhoto } from '@cripto/db';
import {
  categorias,
  custodias,
  type Estabelecimento,
  type EstabelecimentoResumo,
  type Horarios,
  metodosPagamento,
  type Pagamento,
  verificacoes,
} from '@cripto/shared';

export type PaymentComCripto = AcceptedPayment & { crypto: Crypto };

export type EstablishmentComRelacoes = Establishment & {
  acceptedPayments: PaymentComCripto[];
  photos: EstablishmentPhoto[];
};

function apresentarPagamento(pagamento: PaymentComCripto): Pagamento {
  return {
    cripto: pagamento.crypto.symbol,
    criptoNome: pagamento.crypto.name,
    metodo: metodosPagamento[pagamento.method],
    rede: pagamento.network,
    custodia: custodias[pagamento.custody],
    observacao: pagamento.note,
    confirmadoEm: pagamento.lastConfirmedAt?.toISOString() ?? null,
  };
}

function fotoCapa(fotos: EstablishmentPhoto[]): string | null {
  const capa = fotos.find((foto) => foto.isCover) ?? fotos[0];
  return capa?.url ?? null;
}

/** Resposta enxuta: card da listagem e pin do mapa. */
export function apresentarResumo(estabelecimento: EstablishmentComRelacoes): EstabelecimentoResumo {
  return {
    id: estabelecimento.id,
    slug: estabelecimento.slug,
    nome: estabelecimento.name,
    categoria: categorias[estabelecimento.category],
    bairro: estabelecimento.neighborhood,
    latitude: estabelecimento.latitude,
    longitude: estabelecimento.longitude,
    fotoCapa: fotoCapa(estabelecimento.photos),
    faixaPreco: estabelecimento.priceRange,
    verificacao: {
      status: verificacoes[estabelecimento.verificationStatus],
      em: estabelecimento.verifiedAt?.toISOString() ?? null,
      por: estabelecimento.verifiedBy,
      nota: estabelecimento.verificationNote,
    },
    pagamentos: estabelecimento.acceptedPayments.map(apresentarPagamento),
  };
}

export function apresentarCompleto(estabelecimento: EstablishmentComRelacoes): Estabelecimento {
  return {
    ...apresentarResumo(estabelecimento),
    descricao: estabelecimento.description,
    endereco: {
      rua: estabelecimento.street,
      numero: estabelecimento.number,
      complemento: estabelecimento.complement,
      bairro: estabelecimento.neighborhood,
      cidade: estabelecimento.city,
      estado: estabelecimento.state,
      cep: estabelecimento.zipCode,
    },
    contato: {
      telefone: estabelecimento.phone,
      whatsapp: estabelecimento.whatsapp,
      email: estabelecimento.email,
      site: estabelecimento.website,
      instagram: estabelecimento.instagram,
      googleMaps: estabelecimento.googleMapsUrl,
      cardapio: estabelecimento.menuUrl,
    },
    horarios: (estabelecimento.openingHours as Horarios | null) ?? null,
    fotos: estabelecimento.photos.map((foto) => ({
      url: foto.url,
      alt: foto.alt,
      capa: foto.isCover,
    })),
    atualizadoEm: estabelecimento.updatedAt.toISOString(),
  };
}
