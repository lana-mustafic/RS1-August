import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({ selector: 'app-product-offer-edit', standalone: false, templateUrl: './product-offer-edit.component.html', styleUrl: '../product-offer-add/product-offer-add.component.scss' })
export class ProductOfferEditComponent {
  private readonly fb = inject(FormBuilder); private readonly router = inject(Router);
  readonly products: Array<{ id: number; name: string }> = [];
  readonly form = this.fb.group({ code: [''], productId: [null as number | null], discountPercent: [null as number | null], validUntilUtc: [null as Date | null], isEnabled: [false] });
  cancel(): void { this.router.navigate(['/admin/product-offers']); }
  save(): void { /* TODO: student implementira ucitavanje, validaciju i izmjenu. */ }
}
