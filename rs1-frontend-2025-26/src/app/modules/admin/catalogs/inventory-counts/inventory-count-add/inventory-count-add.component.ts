import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({ selector: 'app-inventory-count-add', standalone: false, templateUrl: './inventory-count-add.component.html', styleUrl: './inventory-count-add.component.scss' })
export class InventoryCountAddComponent {
  private readonly fb = inject(FormBuilder); private readonly router = inject(Router);
  readonly products: Array<{ id: number; name: string }> = [];
  readonly form = this.fb.group({ countNumber: [''], note: [''], items: this.fb.array<FormGroup>([]) });
  constructor() { this.addItem(); }
  get items(): FormArray<FormGroup> { return this.form.controls.items; }
  addItem(): void { this.items.push(this.fb.group({ productId: [null as number | null], countedQuantity: [null as number | null] })); }
  removeItem(index: number): void { this.items.removeAt(index); }
  cancel(): void { this.router.navigate(['/admin/inventory-counts']); }
  save(): void { /* TODO: student implementira povezivanje, validaciju, racun i POST. */ }
}
