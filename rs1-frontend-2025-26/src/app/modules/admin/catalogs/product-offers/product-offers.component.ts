import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductOfferStateType } from '../../../../api-services/product-offers/product-offers-api.models';

@Component({
  selector: 'app-product-offers',
  standalone: false,
  templateUrl: './product-offers.component.html',
  styleUrl: './product-offers.component.scss',
})
export class ProductOffersComponent {
  private readonly router = inject(Router);

  readonly displayedColumns = ['code', 'product', 'price', 'discount', 'discounted', 'validUntil', 'state', 'actions'];
  readonly products: Array<{ id: number; name: string }> = [];

  // Ispitni zadatak: zamijeniti demo redove rezultatom API poziva.
  readonly rows = [
    { id: 1, code: 'OFF-001', product: 'Tastatura', price: 20, discount: 10, discounted: 18, validUntil: '2026-09-05', state: ProductOfferStateType.Aktivna, stateLabel: 'Aktivna', isEnabled: true },
    { id: 2, code: 'OFF-002', product: 'Tastatura', price: 20, discount: 15, discounted: 17, validUntil: '2026-08-25', state: ProductOfferStateType.Istekla, stateLabel: 'Istekla', isEnabled: true },
    { id: 3, code: 'OFF-003', product: 'Tastatura', price: 20, discount: 20, discounted: 16, validUntil: '2026-09-15', state: ProductOfferStateType.Iskljucena, stateLabel: 'Iskljucena', isEnabled: false },
  ];

  add(): void { this.router.navigate(['/admin/product-offers/add']); }
  edit(id: number): void { this.router.navigate(['/admin/product-offers/edit', id]); }
  delete(id: number): void { void id; /* TODO: student implementira potvrdu i brisanje. */ }
  filtersChanged(): void { /* TODO: student implementira filtere i povratak na prvu stranicu. */ }
}
