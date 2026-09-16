export enum ProductOfferStateType {
  Aktivna = 1,
  Istekla = 2,
  Iskljucena = 3,
}

export const PRODUCT_OFFER_STATE_LABELS: Record<ProductOfferStateType, string> = {
  [ProductOfferStateType.Aktivna]: 'Aktivna',
  [ProductOfferStateType.Istekla]: 'Istekla',
  [ProductOfferStateType.Iskljucena]: 'Iskljucena',
};
