import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({ selector: 'app-inventory-counts', standalone: false, templateUrl: './inventory-counts.component.html', styleUrl: './inventory-counts.component.scss' })
export class InventoryCountsComponent {
  private readonly router = inject(Router);
  readonly displayedColumns = ['countNumber', 'createdAtUtc', 'itemsCount', 'totalDifferenceValue', 'note'];
  // Ispitni zadatak: povezati vec dati list API i paginator.
  readonly rows = [
    { countNumber: 'INV-DEMO-1', createdAtUtc: new Date(), itemsCount: 2, totalDifferenceValue: -40, note: 'Kontrolno brojanje' },
    { countNumber: 'INV-DEMO-2', createdAtUtc: new Date(), itemsCount: 1, totalDifferenceValue: 0, note: null },
  ];
  add(): void { this.router.navigate(['/admin/inventory-counts/add']); }
}
