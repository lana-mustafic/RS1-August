import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { ProductsComponent } from './catalogs/products/products.component';
import { ProductsAddComponent } from './catalogs/products/products-add/products-add.component';
import { ProductsEditComponent } from './catalogs/products/products-edit/products-edit.component';
import { ProductCategoriesComponent } from './catalogs/product-categories/product-categories.component';
import {AdminOrdersComponent} from './orders/admin-orders.component';
import {OrderEditComponent} from './orders/order-edit/order-edit.component';
import {AdminSettingsComponent} from './admin-settings/admin-settings.component';
import {ProductCategories2Component} from './catalogs/product-categories-2/product-categories-2.component';
import {
  ProductCategoriesEditComponent
} from './catalogs/product-categories-2/product-categories-edit/product-categories-edit.component';
import {
  ProductCategoriesAddComponent
} from './catalogs/product-categories-2/product-categories-add/product-categories-add.component';
import { ProductOffersComponent } from './catalogs/product-offers/product-offers.component';
import { ProductOfferAddComponent } from './catalogs/product-offers/product-offer-add/product-offer-add.component';
import { ProductOfferEditComponent } from './catalogs/product-offers/product-offer-edit/product-offer-edit.component';
import { InventoryCountsComponent } from './catalogs/inventory-counts/inventory-counts.component';
import { InventoryCountAddComponent } from './catalogs/inventory-counts/inventory-count-add/inventory-count-add.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      // PRODUCTS
      {
        path: 'products',
        component: ProductsComponent,
      },
      {
        path: 'products/add',
        component: ProductsAddComponent,
      },
      {
        path: 'products/:id/edit',
        component: ProductsEditComponent,
      },

      // PRODUCT CATEGORIES
      {
        path: 'product-categories',
        component: ProductCategoriesComponent,
      },

      {
        path: 'product-categories-2',
        component: ProductCategories2Component,
      },
      {
        path: 'product-categories-2/add',
        component: ProductCategoriesAddComponent,
      },
      {
        path: 'product-categories-2/edit/:abc',
        component: ProductCategoriesEditComponent,
      },

      // ORDERS
      {
        path: 'orders',
        component: AdminOrdersComponent,
      },
      {
        path: 'orders/:id/edit',
        component: OrderEditComponent,
      },

      // SETTINGS
      {
        path: 'settings',
        component: AdminSettingsComponent,
      },

      { path: 'product-offers', component: ProductOffersComponent },
      { path: 'product-offers/add', component: ProductOfferAddComponent },
      { path: 'product-offers/edit/:id', component: ProductOfferEditComponent },
      { path: 'inventory-counts', component: InventoryCountsComponent },
      { path: 'inventory-counts/add', component: InventoryCountAddComponent },


      // default admin route → /admin/products
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
