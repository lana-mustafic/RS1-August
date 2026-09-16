import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({ selector: 'app-product-offer-add', standalone: false, templateUrl: './product-offer-add.component.html', styleUrl: './product-offer-add.component.scss' })
export class ProductOfferAddComponent {
  private readonly fb = inject(FormBuilder); private readonly router = inject(Router);
  readonly products: Array<{ id: number; name: string }> = [];
  readonly form = this.fb.group({ code: [''], productId: [null as number | null], discountPercent: [null as number | null], validUntilUtc: [null as Date | null] });
  cancel(): void { this.router.navigate(['/admin/product-offers']); }
  save(): void { /* TODO: student implementira validaciju i snimanje. */ }
}
