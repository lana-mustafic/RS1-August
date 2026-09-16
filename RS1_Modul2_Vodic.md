# RS1 — Modul 2 — Vodič (26.08.2026.)

> **Cilj ovog dokumenta:** Da drugi modul možeš raditi korak po korak, samostalno, bez miješanja sa prvim modulom.
> **Pravilo:** Prvo razumij šta je već u templateu, zatim dopuni. Uzorak u projektu je **Order + OrderItem**.
> **Izvor istine:** tekst zadatka. Slike su ilustracija. Ako se HTML kostur i tekst razlikuju, radi po tekstu.
> **Ovaj modul ne koristi ponude iz I modula.** Ne diraš ProductOffers, narudžbe, plaćanja ni popuste.

---

## Sadržaj

1. [Šta se traži](#1-šta-se-traži)
2. [Razlika u odnosu na Modul 1](#2-razlika-u-odnosu-na-modul-1)
3. [Priprema okruženja](#3-priprema-okruženja)
4. [Šta je VEĆ u templateu, a šta TI radiš](#4-šta-je-već-u-templateu-a-šta-ti-radiš)
5. [Kako čitati zadatak](#5-kako-čitati-zadatak)
6. [Redoslijed rada](#6-redoslijed-rada)
7. [Poslovna pravila snimka i zalihe — nauči PRIJE koda](#7-poslovna-pravila-snimka-i-zalihe--nauči-prije-koda)
8. [Backend — child entitet InventoryCountItemEntity](#8-backend--child-entitet-inventorycountitementity)
9. [Backend — veza 1:N, DbSet, EF konfiguracija](#9-backend--veza-1n-dbset-ef-konfiguracija)
10. [Backend — migracija](#10-backend--migracija)
11. [Frontend — lista (povezivanje postojećeg GET-a)](#11-frontend--lista-povezivanje-postojećeg-get-a)
12. [Backend — Create command, validator, handler](#12-backend--create-command-validator-handler)
13. [Backend — POST u kontroleru](#13-backend--post-u-kontroleru)
14. [Provjera backenda u Swaggeru](#14-provjera-backenda-u-swaggeru)
15. [Frontend — API create modeli](#15-frontend--api-create-modeli)
16. [Frontend — master-detail forma (FormArray)](#16-frontend--master-detail-forma-formarray)
17. [Toast, tok forme i isSaving](#17-toast-tok-forme-i-issaving)
18. [Najčešće greške](#18-najčešće-greške)
19. [Checklista prije predaje](#19-checklista-prije-predaje)
20. [Šta je nejasno iz zadatka](#20-šta-je-nejasno-iz-zadatka)

---

## 1. Šta se traži

Na ispitu iz **Razvoja softvera I** od **26.08.2026.** drugi modul je:

**Inventurne liste** (`InventoryCount`)

To je **master-detail** zadatak:

- **Master (roditelj):** jedna inventura — broj, napomena, broj stavki, ukupna vrijednost odstupanja
- **Detail (djeca):** više stavki — proizvod, snimak zalihe i cijene, prebrojana količina, odstupanje

Jedna inventura evidentira **stvarno prebrojanu** količinu proizvoda. Nakon uspješnog snimanja, zaliha obuhvaćenih proizvoda **postaje** prebrojana količina (zamjena, ne sabiranje). Proizvodi koji nisu u inventuri ostaju isti.

### Šta ovaj modul NIJE

- **Nema** edit inventure
- **Nema** delete inventure
- **Nema** pregled pojedinačne inventure
- **Ne** koristiš ponude iz I modula
- **Ne** diraš `Product.Price` ni `Product.IsEnabled`
- Frontend izračun je samo **pregled**; backend je autoritativan

### Bodovna mapa

| Br. | Funkcionalnost | Bodovi |
|-----|----------------|--------|
| 1 | Child model: entitet, FK/1:N, konfiguracija, DbSet, migracija | 10 |
| 2 | Lista iz API-ja, kolone, format, prazno stanje | 6 |
| 3 | Paginacija 5/10, BE paging | 4 |
| 4 | Reactive forma, master/child, add/remove | 6 |
| 5 | Lookup proizvoda, readonly podaci, reset samo izmijenjenog reda | 5 |
| 6 | Zaglavlje: broj + max500 napomena, Trim, unique 409 | 6 |
| 7 | Validacija stavki: min 1, proizvod, cijeli broj 0–100000 | 7 |
| 8 | Duplikat proizvoda FE+BE, bez spajanja | 8 |
| 9 | Napomena obavezna kod bilo kojeg manjka | 8 |
| 10 | FE pregled (3) + BE snimak/izračun bez vjerovanja klijentu (7) | 10 |
| 11 | ItemsCount, suma, FE ukupni pregled, serverski CreatedAtUtc | 7 |
| 12 | Snimanje + zamjena zalihe, atomicnost | 13 |
| 13 | Redirect / čuvanje unosa / isSaving | 5 |
| 14 | Toast | 5 |
| | **Ukupno** | **100** |

Najskuplji dio je **12** (snimanje + zaliha). Ako snimiš inventuru a zaliha ostane stara, pada veliki komad.

---

## 2. Razlika u odnosu na Modul 1

| Aspekt | Modul 1 (Ponude) | Modul 2 (Inventure) |
|--------|------------------|---------------------|
| Tip | Klasičan CRUD | Master-detail + poslovna logika |
| Entiteti | 1 (već postoji) | 2: roditelj postoji, **dijete TI kreiraš** |
| Migracija | Zabranjena | **Obavezna** |
| Operacije | List, Get, Create, Update, Delete | List (dat) + Create (ti) |
| Forma | Običan FormGroup | FormGroup + **FormArray** |
| Uticaj na Products | Ne | Da — `StockQuantity = CountedQuantity` |
| Unique | Code ponude | CountNumber inventure |
| Conflict 409 | Dupli kod, druga aktivna | Dupli broj, dupli proizvod, napomena za manjak |

Ako si vježbala januarski ispit: ovo je isti *tip* zadatka kao Fakture, ali pravila su druga (nema ulazna/izlazna; uvijek zamjena zalihe prebrojanim).

---

## 3. Priprema okruženja

Isto kao na svakom RS1 ispitu.

### Baza

- Server: `10.10.10.18`
- user `sa` / password `test`
- Nova baza = tvoj indeks

### Connection string

`rs1_backend-2025-26/Market.API/appsettings.json` → `ConnectionStrings.Main` → `Database=TVOJ_INDEKS`

### Pokretanje

1. Backend (`Market.API`) — F5. Pri startu radi `MigrateAsync()` + seed.
2. Frontend: u folderu `rs1-frontend-2025-26`

```
cmd
npm install
npm start
```

### Login (Staff)

Inventurni endpointi su `[Authorize(Policy = "Staff")]`.

| Email | Lozinka |
|-------|---------|
| `admin@market.local` | `Admin123!` |
| `string` | `string` |

Swagger: `http://localhost:7001/swagger`
Angular: `http://localhost:4200`
Sidebar: **Inventurne liste** → `/admin/inventory-counts`

### NPM napomena

PowerShell u učionici blokira `npm.ps1`. Prvo `cmd`, pa `npm`.

### Provjera

- API se digne.
- `GET /InventoryCounts?paging.page=1&paging.pageSize=5` radi i vraća praznu listu (nema seed inventura — to je **očekivano**).
- Frontend stranica se otvara, ali još pokazuje **demo** redove. To mijenjaš kasnije.

---

## 4. Šta je VEĆ u templateu, a šta TI radiš

### 4.1. Backend — gotovo

| Fajl | Stanje |
|------|--------|
| `Market.Domain/Entities/Inventory/InventoryCountEntity.cs` | Roditelj: CountNumber, Note, ItemsCount, TotalDifferenceValue |
| `InventoryCountConfiguration.cs` | Tabela `InventoryCounts`, max 20 / 500 |
| `DbSet<InventoryCountEntity> InventoryCounts` | U `IAppDbContext` i `DatabaseContext` |
| Init migracija | Tabela roditelja postoji |
| `Queries/List/` (Query + DTO + Handler) | Lista + paging + sort **gotovi** |
| `GET /InventoryCounts` | Radi i sa praznom bazom |
| `GET /ExamProducts/lookup` | id, name, price, stockQuantity |

Roditelj **nema** kolekciju stavki. To dodaješ.

### 4.2. Backend — TI dodaješ

| Šta | Zašto |
|-----|-------|
| `InventoryCountItemEntity` | Child tabela ne postoji |
| Navigacija 1:N na roditelju | `Items` kolekcija |
| EF konfiguracija stavke | FK Restrict na Product, veza na roditelja |
| `DbSet` stavki u **oba** fajla | `IAppDbContext` + `DatabaseContext` |
| Nova migracija | Bez nje tabela ne postoji |
| `CreateInventoryCountCommand` + Validator + Handler | Nema POST |
| `POST` u `InventoryCountsController` | Frontend nema šta zvati |

### 4.3. Frontend — gotovo

| Fajl | Stanje |
|------|--------|
| `inventory-counts.component.*` | Lista sa **demo** redovima, paginator nepovezan |
| `inventory-count-add.component.ts` | FormArray + `addItem()` / `removeItem()` — **generičke metode date** |
| `inventory-count-add.component.html` | Layout postoji, kontrole **nisu** vezane na formu |
| `inventory-counts-api.service.ts` | Samo `list()` |
| `inventory-counts-api.models.ts` | Samo list DTO |
| Rute `/admin/inventory-counts` i `/add` | Registrovane |

### 4.4. Frontend — TI radiš

| Šta | Problem |
|-----|---------|
| Zamijeniti demo redove `list()` pozivom | Hardkodirano |
| Povezati `mat-paginator` | `[length]="rows.length"` je lažno |
| `create()` u API servisu | Ne postoji |
| `[formGroup]`, `formControlName`, `formArrayName` | HTML inputi nisu vezani |
| Lookup proizvoda | `products = []` |
| Validatori, pregled razlike, napomena kod manjka | Nema |
| Submit + toast + redirect | `save()` je TODO |

### 4.5. Referentni uzorak — Order + OrderItem

| Šta trebaš | Gdje gledaš |
|------------|-------------|
| Child entitet | `OrderItemEntity.cs` |
| EF 1:N | `OrderItemConfiguration.cs` — `HasOne().WithMany().HasForeignKey()` |
| Create sa stavkama | `CreateOrderCommand.cs` + Handler |
| `RuleForEach` + duplikat proizvoda | `CreateOrderCommandValidator.cs` |
| POST vraća Id | `OrdersController.Create` |
| Lookup | `ExamProductsApiService.lookup()` |
| Toast + `getErrorMessage` | interceptor helper |
| FormArray početak | već u `inventory-count-add.component.ts` |

**Pravilo:** Inventura + Stavka = isti folder pattern kao Order + OrderItem, druga poslovna logika.

---

## 5. Kako čitati zadatak

### 5.1. Tri prolaza

**Prolaz 1 — UI**

- Lista: broj, datum, broj stavki, vrijednost odstupanja, napomena ili `-`
- Dugme Nova inventura
- Forma: zaglavlje + dinamičke stavke
- Nema edit/delete kolona

**Prolaz 2 — Baza**

- Nova tabela stavki
- FK na `InventoryCounts` i `Products`
- Izmjena `Products.StockQuantity` za proizvode u inventuri

**Prolaz 3 — Pravila (tu se gube bodovi)**

- Klijent šalje samo `countNumber`, `note`, `items[].productId`, `items[].countedQuantity`
- Backend sam čita zalihu i cijenu
- Manjak (`counted < system`) zahtijeva napomenu, bez obzira na ukupni predznak
- Sve ili ništa: greška = ni inventura ni zaliha

### 5.2. Ključne rečenice

| Rečenica | Šta radiš |
|----------|-----------|
| FK prema proizvodu je Restrict | `OnDelete(DeleteBehavior.Restrict)` |
| Stavka ne može postojati bez roditelja | veza na parent obavezna, cascade sa roditelja je OK |
| Nije obavezna kolekcija na ProductEntity | `WithMany()` prazno |
| Frontend demo redovi nisu stvarne inventure | Obriši ih |
| Prazna lista nije greška | Ne prikazuj error toast jer je prazno |
| Broj: Trim, 5–20, počinje sa `INV-` case-sensitive | Validator |
| Unique broj: Trim + case-insensitive, u handleru, 409 | Ne unique index |
| CountedQuantity 0 je validan | Nemoj `required` koji treta 0 kao prazno na pogrešan način; `Validators.min(0)` |
| Duplikat se odbija; nema spajanja | 409, ne sabiraj količine |
| Napomena zavisi od bilo kojeg manjka, ne od predznaka sume | Jedna stavka -1 i druga +5 i dalje traži napomenu |
| SystemQuantity/UnitPrice/Difference/DifferenceValue ne smiju biti iz klijenta | Ignoriši ako ih neko pošalje; command ih nema |
| Ne sabirati CountedQuantity s prethodnom zalihom | `StockQuantity = counted`, ne `+=` |
| Jedno `SaveChangesAsync` nakon svih provjera | Atomicnost |
| Nepostojeći ProductId je 400, ne FK/500 | Provjeri prije SaveChanges |

---

## 6. Redoslijed rada

1. Pročitaj `InventoryCountEntity` i list handler (ne diraj list query osim ako moraš).
2. Child entitet + kolekcija na roditelju.
3. EF konfiguracija + DbSet.
4. Migracija + pokreni API (provjeri tabelu u SSMS).
5. Frontend lista (brzi bodovi, GET već radi).
6. Backend Create (validator + handler s izračunom i zalihom).
7. POST endpoint.
8. Swagger: jedna inventura, provjeri `Products.StockQuantity`.
9. Frontend forma (FormArray, lookup, validacija, POST).
10. End-to-end: manjak s napomenom, dupli proizvod, prazna lista nakon 6+ inventura radi paging.

Ne radi formu prije POST-a. Gubiš vrijeme.

---

## 7. Poslovna pravila snimka i zalihe — nauči PRIJE koda

### 7.1. Šta klijent smije poslati

```json
{
  "countNumber": "INV-001",
  "note": "Manjak na tastaturama",
  "items": [
    { "productId": 1, "countedQuantity": 8 }
  ]
}
```

Ništa više. Ako frontend izračuna razliku `-2` i pošalje je, backend to **ignorira** (najbolje: polja uopšte ne postoje na commandu).

### 7.2. Šta backend računa za svaku stavku

Učitaj proizvod **iz baze**, tracked (jer ćeš mu mijenjati zalihu):

1. `SystemQuantity = Product.StockQuantity`
2. `UnitPrice = Product.Price` (redovna, bez ponuda)
3. `Difference = CountedQuantity - SystemQuantity`
4. `DifferenceValue = Round(Difference * UnitPrice, 2, AwayFromZero)`

Značenje razlike:

| Difference | Značenje |
|------------|----------|
| negativna | manjak |
| pozitivna | višak |
| 0 | poklapa se |

Primjer iz zadatka: zaliha 10, cijena 20.00, prebrojano 8

- razlika = `8 - 10 = -2`
- vrijednost = `Round(-2 * 20.00, 2) = -40.00`
- nova zaliha = **8** (ne 18, ne 2)

Sljedeća inventura tog proizvoda polazi od 8, ne od 10. Historijska stavka ostaje snimak i **ne** se preračunava kasnije.

### 7.3. Šta backend postavlja na roditelja

- `ItemsCount =` broj validnih stavki
- `TotalDifferenceValue =` suma `DifferenceValue` svih stavki (predznak se čuva)
- `CreatedAtUtc =` serverski UTC (interceptor pri `Added` to već radi)

### 7.4. Napomena kod manjka

Ako **bilo koja** stavka ima `CountedQuantity < SystemQuantity`, `Note` nakon Trim mora imati bar jedan ne-whitespace znak.

Ovo **ne** gledaš prema `TotalDifferenceValue`. Primjer:

- stavka A: -2 → -40
- stavka B: +5 → +100
- suma +60 (pozitivna) — napomena **i dalje obavezna** jer postoji manjak na A

Ako su sve razlike ≥ 0, napomena smije biti prazna.

### 7.5. Atomicnost

Ako bilo šta padne (nevalidna stavka, nepostojeći proizvod, dupli broj, dupli proizvod, nema napomene za manjak):

- ne snima se roditelj
- ne snimaju se stavke
- **nijedna** zaliha se ne mijenja

Zato: prvo **sve provjere**, onda **sve izmjene u memoriji**, onda **jedan** `SaveChangesAsync`.

EF jedan `SaveChanges` je jedna transakcija. Ne trebaš vlastiti transaction framework.

---

## 8. Backend — child entitet InventoryCountItemEntity

### 8.1. Šta treba napraviti

U folderu `Market.Domain/Entities/Inventory` kreirati fajl:

`InventoryCountItemEntity.cs`

Klasa `InventoryCountItemEntity` nasljeđuje `BaseEntity` (Id, IsDeleted, CreatedAtUtc, ModifiedAtUtc) — „uobičajeno nasljeđivanje kao u starteru".

### 8.2. Svojstva iz zadatka

| Polje | Tip / značenje |
|-------|----------------|
| InventoryCountId | FK na roditelja |
| ProductId | FK na proizvod |
| SystemQuantity | int, zaliha pročitana na BE pri snimanju |
| CountedQuantity | int, korisnikova prebrojana količina |
| Difference | int, Counted − System |
| UnitPrice | decimal(18,2), tada važeća redovna cijena |
| DifferenceValue | decimal(18,2), vrijednost odstupanja stavke |

Plus navigacije: `InventoryCount` i `Product`.

### 8.3. Kod

```csharp
using Market.Domain.Common;
using Market.Domain.Entities.Catalog;

namespace Market.Domain.Entities.Inventory;

public class InventoryCountItemEntity : BaseEntity
{
    public int InventoryCountId { get; set; }
    public InventoryCountEntity? InventoryCount { get; set; }

    public int ProductId { get; set; }
    public ProductEntity? Product { get; set; }

    public int SystemQuantity { get; set; }
    public int CountedQuantity { get; set; }
    public int Difference { get; set; }

    public decimal UnitPrice { get; set; }
    public decimal DifferenceValue { get; set; }
}
```

Ne stavljaj izračun u entitet (`Difference => Counted - System` kao property). Handler postavlja vrijednosti. Historijski snimak mora ostati kakav je bio na dan snimanja.

### 8.4. Dopuni roditelja

Otvori postojeći `InventoryCountEntity.cs` i dodaj kolekciju.

```csharp
public ICollection<InventoryCountItemEntity> Items { get; set; } = new List<InventoryCountItemEntity>();
```

Bez ove kolekcije `WithMany(x => x.Items)` ne kompajlira. Zadatak traži roditeljsku kolekciju.

Ostala polja roditelja **ne mijenjaj**.

### Provjera

- Build prolazi.
- Još nema tabele — to je sljedeći korak.

---

## 9. Backend — veza 1:N, DbSet, EF konfiguracija

### 9.1. EF konfiguracija stavke

U folderu `Market.Infrastructure/Database/Configurations/Inventory` kreirati fajl:

`InventoryCountItemConfiguration.cs`

Uzorak: `OrderItemConfiguration.cs`.

Pravila zadatka:

- FK na **Product**: `Restrict` (ne smije se obrisati proizvod koji ima stavke)
- Stavka ne može bez roditelja → veza na `InventoryCount` obavezna; brisanje roditelja smije cascade-ati djecu (`Cascade`), kao Order → OrderItems
- Na Product **nema** kolekcije → `WithMany()`

```csharp
using Market.Domain.Entities.Inventory;

namespace Market.Infrastructure.Database.Configurations.Inventory;

public sealed class InventoryCountItemConfiguration
    : IEntityTypeConfiguration<InventoryCountItemEntity>
{
    public void Configure(EntityTypeBuilder<InventoryCountItemEntity> builder)
    {
        builder.ToTable("InventoryCountItems");

        builder.Property(x => x.SystemQuantity).IsRequired();
        builder.Property(x => x.CountedQuantity).IsRequired();
        builder.Property(x => x.Difference).IsRequired();

        builder.Property(x => x.UnitPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.DifferenceValue)
            .HasPrecision(18, 2)
            .IsRequired();

        builder
            .HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(x => x.InventoryCount)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.InventoryCountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

Konfiguracije se učitavaju automatski:

```csharp
modelBuilder.ApplyConfigurationsFromAssembly(typeof(DatabaseContext).Assembly);
```

Ne registruješ je ručno.

Roditeljski `InventoryCountConfiguration` **ne moraš** dirati ako je veza definisana na child strani.

### 9.2. DbSet u oba fajla

Ako zaboraviš `IAppDbContext`, handler neće kompajlirati.
Ako zaboraviš `DatabaseContext`, runtime neće imati set.

`Market.Application/Abstractions/IAppDbContext.cs` — dodaj:

```csharp
DbSet<InventoryCountItemEntity> InventoryCountItems { get; }
```

Već ima `using Market.Domain.Entities.Inventory;`.

`Market.Infrastructure/Database/DatabaseContext.cs` — dodaj:

```csharp
public DbSet<InventoryCountItemEntity> InventoryCountItems => Set<InventoryCountItemEntity>();
```

### Provjera

- Build.
- Još uvijek nema tabele dok ne napraviš migraciju.

---

## 10. Backend — migracija

Zadatak ocjenjuje **uspješnu migraciju** (10 bodova na child modelu).

Aplikacija pri startu zove `MigrateAsync()`. Ako samo dodaš entitet bez migracije, API padne ili tabela ne postoji.

### Visual Studio (Package Manager Console)

Default project: **Market.Infrastructure**
Startup project: **Market.API**

```
Add-Migration InventoryCountItems -Project Market.Infrastructure -StartupProject Market.API
```

### CLI (ako koristiš terminal)

Iz foldera `rs1_backend-2025-26`:

```
dotnet ef migrations add InventoryCountItems --project Market.Infrastructure --startup-project Market.API
```

Ako `dotnet ef` nije instaliran:

```
dotnet tool install --global dotnet-ef
```

### Šta mora biti u migraciji

- tabela `InventoryCountItems`
- kolone iz entiteta + BaseEntity
- FK na `InventoryCounts`
- FK na `Products` (Restrict)
- **Ne** unique index na `CountNumber` (zadatak: unique se provjerava u handleru)

Zatim pokreni API. `MigrateAsync` primijeni migraciju. U SSMS osvježi tabele.

### Provjera

- U `Market.Infrastructure/Migrations` postoji novi fajl pored `20260826023244_Init`.
- Snapshot sadrži `InventoryCountItemEntity`.
- U bazi postoji `InventoryCountItems`.
- API starta bez exceptiona.

Ako si krivo uradila relaciju, **nemoj** ručno editovati staru Init migraciju. Napravi novu. Za I modul je Init već dat; za II modul nova migracija je baš to što se traži.

---

## 11. Frontend — lista (povezivanje postojećeg GET-a)

Ovo su „brzi bodovi". Backend lista već radi.

### 11.1. Šta lista prikazuje

- broj inventure
- datum kreiranja kao **`dd.MM.yyyy`** (tekst zadatka; template ima i sate — mjerodavan je tekst)
- broj stavki
- ukupnu vrijednost odstupanja na 2 decimale, sa minusom ako je negativna (`number:'1.2-2'` to radi)
- napomena ili `-` ako nema (template već ima `row.note || '-'`)

Nema edit/delete. Iznad liste dugme **Nova inventura** već radi navigaciju.

Prazna lista **nije greška**. Demo redove moraš baciti. Za test paginga snimiš > 5 inventura.

### 11.2. HTML

Fajl: `inventory-counts.component.html`

Minimalne izmjene:

1. Datum pipe po zadatku.
2. Paginator na `totalItems` / `pageSize` / `pageIndex`.

```html
<section class="exam-page">
  <header>
    <h1>Inventurne liste</h1>
    <button mat-flat-button color="primary" (click)="add()">
      <mat-icon>add</mat-icon>Nova inventura
    </button>
  </header>

  <div class="table-wrap">
    <table mat-table [dataSource]="rows">
      <ng-container matColumnDef="countNumber">
        <th mat-header-cell *matHeaderCellDef>Broj inventure</th>
        <td mat-cell *matCellDef="let row">{{ row.countNumber }}</td>
      </ng-container>

      <ng-container matColumnDef="createdAtUtc">
        <th mat-header-cell *matHeaderCellDef>Datum</th>
        <td mat-cell *matCellDef="let row">{{ row.createdAtUtc | date:'dd.MM.yyyy':'UTC' }}</td>
      </ng-container>

      <ng-container matColumnDef="itemsCount">
        <th mat-header-cell *matHeaderCellDef>Broj stavki</th>
        <td mat-cell *matCellDef="let row">{{ row.itemsCount }}</td>
      </ng-container>

      <ng-container matColumnDef="totalDifferenceValue">
        <th mat-header-cell *matHeaderCellDef>Vrijednost odstupanja</th>
        <td mat-cell *matCellDef="let row">{{ row.totalDifferenceValue | number:'1.2-2' }}</td>
      </ng-container>

      <ng-container matColumnDef="note">
        <th mat-header-cell *matHeaderCellDef>Napomena</th>
        <td mat-cell *matCellDef="let row">{{ row.note || '-' }}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>

    <mat-paginator
      [length]="totalItems"
      [pageSize]="pageSize"
      [pageIndex]="page - 1"
      [pageSizeOptions]="[5, 10]"
      (page)="onPage($event)">
    </mat-paginator>
  </div>
</section>
```

### 11.3. TS

Fajl: `inventory-counts.component.ts`

Servis već postoji: `InventoryCountsApiService.list()`.

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { InventoryCountsApiService } from '../../../../api-services/inventory-counts/inventory-counts-api.service';
import {
  ListInventoryCountsQueryDto,
  ListInventoryCountsRequest,
} from '../../../../api-services/inventory-counts/inventory-counts-api.models';
import { ToasterService } from '../../../../core/services/toaster.service';
import { getErrorMessage } from '../../../../core/interceptors/error-logging-interceptor.service';

@Component({
  selector: 'app-inventory-counts',
  standalone: false,
  templateUrl: './inventory-counts.component.html',
  styleUrl: './inventory-counts.component.scss',
})
export class InventoryCountsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(InventoryCountsApiService);
  private readonly toaster = inject(ToasterService);

  readonly displayedColumns = [
    'countNumber', 'createdAtUtc', 'itemsCount', 'totalDifferenceValue', 'note',
  ];

  rows: ListInventoryCountsQueryDto[] = [];
  page = 1;
  pageSize = 5;
  totalItems = 0;

  ngOnInit(): void {
    this.load();
  }

  add(): void {
    this.router.navigate(['/admin/inventory-counts/add']);
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  private load(): void {
    const request = new ListInventoryCountsRequest();
    request.paging.page = this.page;
    request.paging.pageSize = this.pageSize;

    this.api.list(request).subscribe({
      next: (res) => {
        this.rows = res.items;
        this.totalItems = res.totalItems;
      },
      error: (err) => this.toaster.error(getErrorMessage(err)),
    });
  }
}
```

List handler već sortira `CreatedAtUtc desc, Id desc`. Ne sortiraš na FE.

Početno `rows = []` i `totalItems = 0` → prazna tabela. To je tačno.

### Provjera

- Nema `INV-DEMO-1`.
- Prazna lista bez error toasta.
- Nakon što kasnije snimiš 6 inventura, pageSize 5 pokazuje 2 stranice.

---

## 12. Backend — Create command, validator, handler

Folder:

`Market.Application/Modules/Inventory/InventoryCounts/Commands/Create/`

### 12.1. Command

Fajl: `CreateInventoryCountCommand.cs`

```csharp
namespace Market.Application.Modules.Inventory.InventoryCounts.Commands.Create;

public sealed class CreateInventoryCountCommand : IRequest<int>
{
    public required string CountNumber { get; init; }
    public string? Note { get; init; }
    public List<CreateInventoryCountCommandItem> Items { get; init; } = [];
}

public sealed class CreateInventoryCountCommandItem
{
    public int ProductId { get; init; }
    public int CountedQuantity { get; init; }
}
```

Nema `systemQuantity`, `unitPrice`, `difference` — da slučajno ne mapiraš iz JSON-a.

### 12.2. Validator (HTTP 400)

Fajl: `CreateInventoryCountCommandValidator.cs`

Uzorak: `CreateOrderCommandValidator` (`NotEmpty` lista, `RuleForEach`, duplikat `ProductId`).

```csharp
namespace Market.Application.Modules.Inventory.InventoryCounts.Commands.Create;

public sealed class CreateInventoryCountCommandValidator
    : AbstractValidator<CreateInventoryCountCommand>
{
    public CreateInventoryCountCommandValidator()
    {
        RuleFor(x => x.CountNumber)
            .Cascade(CascadeMode.Stop)
            .Must(v => !string.IsNullOrWhiteSpace(v))
                .WithMessage("Broj inventure je obavezan.")
            .Must(v =>
            {
                var t = v.Trim();
                return t.Length is >= 5 and <= 20;
            }).WithMessage("Broj inventure mora imati 5 do 20 znakova.")
            .Must(v => v.Trim().StartsWith("INV-", StringComparison.Ordinal))
                .WithMessage("Broj inventure mora počinjati sa INV-.");

        RuleFor(x => x.Note)
            .MaximumLength(InventoryCountEntity.Constraints.NoteMaxLength)
            .When(x => x.Note is not null);

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Inventura mora imati najmanje jednu stavku.");

        RuleForEach(x => x.Items)
            .SetValidator(new CreateInventoryCountCommandItemValidator());

        RuleFor(x => x.Items)
            .Must(items => items.Select(i => i.ProductId).Distinct().Count() == items.Count)
            .WithMessage("Isti proizvod se ne smije pojaviti više puta u inventuri.")
            .When(x => x.Items is { Count: > 0 });
    }
}

public sealed class CreateInventoryCountCommandItemValidator
    : AbstractValidator<CreateInventoryCountCommandItem>
{
    public CreateInventoryCountCommandItemValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Proizvod je obavezan.");

        RuleFor(x => x.CountedQuantity)
            .InclusiveBetween(0, 100000)
            .WithMessage("Prebrojana količina mora biti cijeli broj od 0 do 100000.");
    }
}
```

`InclusiveBetween(0, 100000)` prihvata **0**. To zadatak posebno naglašava.

Napomena za manjak ovdje **nije** 400 — to je poslovno pravilo 409 u handleru, jer zavisi od zalihe iz baze.

Duplikat proizvoda: validator može dati 400, zadatak kaže dupli proizvod vraća **409**. Zato duplikat **prebaci u handler** kao `MarketConflictException`, a iz validatora izbaci `Must Distinct` **ili** ostavi 400. Tekst:

> Dupli broj, ponovljen proizvod i nedostajuća napomena za manjak vraćaju 409

Znači duplikat je **409**. U validatoru ga nemoj ostaviti ako želiš tačan kod. Provjeri u handleru.

### 12.3. Handler — redoslijed (ovo je srce zadatka)

Fajl: `CreateInventoryCountCommandHandler.cs`

Algoritam koji radi i nosi bodove:

1. Trim `CountNumber` i `Note`.
2. Unique broj među neobrisanim (globalni filter), `ToLower`, 409.
3. Mora postojati bar 1 stavka (validator već).
4. Dupli `ProductId` u requestu → 409, **bez spajanja**.
5. Učitaj sve proizvode **tracked**:
   `ctx.Products.Where(p => ids.Contains(p.Id)).ToListAsync()`
   **Bez** `AsNoTracking` — moraš mijenjati `StockQuantity`.
6. Svaki `ProductId` mora postojati. Ako ne → `ValidationException` (400), **prije** SaveChanges, da ne dobiješ FK 500.
7. Izračunaj sve stavke u memoriji. Ako bilo koja ima manjak, provjeri napomenu → 409.
8. Tek sad kreiraj roditelja, stavke, zamijeni zalihe.
9. Jedan `SaveChangesAsync`.
10. Vrati `entity.Id`.

```csharp
using Market.Domain.Entities.Inventory;

namespace Market.Application.Modules.Inventory.InventoryCounts.Commands.Create;

public sealed class CreateInventoryCountCommandHandler(IAppDbContext ctx)
    : IRequestHandler<CreateInventoryCountCommand, int>
{
    public async Task<int> Handle(CreateInventoryCountCommand request, CancellationToken ct)
    {
        var countNumber = request.CountNumber.Trim();
        var note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();

        var numberTaken = await ctx.InventoryCounts.AnyAsync(
            x => x.CountNumber.ToLower() == countNumber.ToLower(),
            ct);

        if (numberTaken)
            throw new MarketConflictException("Broj inventure već postoji.");

        var productIds = request.Items.Select(i => i.ProductId).ToList();

        if (productIds.Count != productIds.Distinct().Count())
        {
            throw new MarketConflictException(
                "Isti proizvod se ne smije pojaviti više puta u inventuri.");
        }

        var products = await ctx.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(ct);

        var productsMap = products.ToDictionary(p => p.Id);

        foreach (var id in productIds)
        {
            if (!productsMap.ContainsKey(id))
                throw new ValidationException($"Proizvod {id} ne postoji ili je obrisan.");
        }

        var computedItems = new List<(CreateInventoryCountCommandItem Req, ProductEntity Product, int Diff, decimal DiffValue)>();
        var hasShortage = false;

        foreach (var item in request.Items)
        {
            var product = productsMap[item.ProductId];
            var systemQty = product.StockQuantity;
            var unitPrice = product.Price;
            var difference = item.CountedQuantity - systemQty;
            var differenceValue = Math.Round(
                difference * unitPrice,
                2,
                MidpointRounding.AwayFromZero);

            if (item.CountedQuantity < systemQty)
                hasShortage = true;

            computedItems.Add((item, product, difference, differenceValue));
        }

        if (hasShortage && string.IsNullOrWhiteSpace(note))
        {
            throw new MarketConflictException(
                "Napomena je obavezna kada postoji manjak na bilo kojoj stavci.");
        }

        var parent = new InventoryCountEntity
        {
            CountNumber = countNumber,
            Note = note,
            ItemsCount = computedItems.Count,
            TotalDifferenceValue = computedItems.Sum(x => x.DiffValue)
        };

        ctx.InventoryCounts.Add(parent);

        foreach (var row in computedItems)
        {
            ctx.InventoryCountItems.Add(new InventoryCountItemEntity
            {
                InventoryCount = parent,
                ProductId = row.Product.Id,
                SystemQuantity = row.Product.StockQuantity,
                CountedQuantity = row.Req.CountedQuantity,
                Difference = row.Diff,
                UnitPrice = row.Product.Price,
                DifferenceValue = row.DiffValue
            });

            row.Product.StockQuantity = row.Req.CountedQuantity;
        }

        await ctx.SaveChangesAsync(ct);
        return parent.Id;
    }
}
```

Važan redoslijed unutar petlje stavki: `SystemQuantity = row.Product.StockQuantity` **prije** `row.Product.StockQuantity = counted`. Ako prvo zamijeniš zalihu, snimak postaje pogrešan.

Ne radi `StockQuantity += counted`. Ne diraš `Price`.

Ako koristiš `parent.Items.Add(...)` umjesto `ctx.InventoryCountItems.Add`, također je OK jer je veza mapirana.

### Provjera logike na papiru prije Swaggera

Tastatura seed: cijena 20.00, zaliha 10, prebrojano 8.

- System 10, Counted 8, Diff -2, Value -40.00
- ItemsCount 1
- Total -40.00
- Nova zaliha 10 → 8
- Napomena mora postojati

---

## 13. Backend — POST u kontroleru

Otvori postojeći:

`Market.API/Controllers/InventoryCountsController.cs`

Trenutno ima samo `GET`. Dodaj `POST`. **Ne** pravi novi kontroler.

```csharp
using Market.Application.Modules.Inventory.InventoryCounts.Commands.Create;
using Market.Application.Modules.Inventory.InventoryCounts.Queries.List;

namespace Market.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Policy = "Staff")]
public sealed class InventoryCountsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<PageResult<ListInventoryCountsQueryDto>> List(
        [FromQuery] ListInventoryCountsQuery query,
        CancellationToken ct)
    {
        return await sender.Send(query, ct);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(
        CreateInventoryCountCommand command,
        CancellationToken ct)
    {
        var id = await sender.Send(command, ct);
        return Ok(id);
        // ili: return CreatedAtAction(nameof(List), new { id }, id);
    }
}
```

Zadatak: „Uspjeh vraća novi Id." `Ok(id)` je dovoljno. `CreatedAtAction` je finije ako želiš 201.

Nema GetById u starteru, zato `CreatedAtAction(nameof(List), ...)` ili samo `return Ok(id)`.

---

## 14. Provjera backenda u Swaggeru

Uloguj se, pa:

### Test 1 — srećan put s manjkom

Seed Tastatura: price 20, stock 10.

```json
{
  "countNumber": "INV-0001",
  "note": "Kontrolno brojanje",
  "items": [
    { "productId": 1, "countedQuantity": 8 }
  ]
}
```

Očekivano: 200/201 i Id. Lista pokazuje `INV-0001`, itemsCount 1, total -40.00. `GET /ExamProducts/lookup` za tu tastaturu sada `stockQuantity: 8`.

### Test 2 — druga inventura istog proizvoda

Polazi od 8, ne od 10. Prebrojano 8 → razlika 0, vrijednost 0. Napomena nije obavezna.

### Test 3 — manjak bez napomene

409, zaliha se **nije** promijenila.

### Test 4 — dupli broj `inv-0001`

409 (case-insensitive).

### Test 5 — isti productId dvaput u items

409, ništa snimljeno.

### Test 6 — productId 99999

400, ne 500.

### Test 7 — countedQuantity 0

Validno. Ako je system 10, to je manjak → treba napomena. Nova zaliha 0.

### Test 8 — `off-001` kao broj

400 (mora `INV-`).

Ako zaliha nije promenjena u Test 1, handler ili nije tracked ili radiš drugi SaveChanges poslije rollbacka — vrati se na kod.

---

## 15. Frontend — API create modeli

Otvori:

`src/app/api-services/inventory-counts/inventory-counts-api.models.ts`

Dopuni:

```typescript
import { BasePagedQuery } from '../../core/models/paging/base-paged-query';
import { PageResult } from '../../core/models/paging/page-result';

export class ListInventoryCountsRequest extends BasePagedQuery {}

export interface ListInventoryCountsQueryDto {
  id: number;
  countNumber: string;
  note?: string | null;
  itemsCount: number;
  totalDifferenceValue: number;
  createdAtUtc: string;
}

export type ListInventoryCountsResponse = PageResult<ListInventoryCountsQueryDto>;

export interface CreateInventoryCountCommandItem {
  productId: number;
  countedQuantity: number;
}

export interface CreateInventoryCountCommand {
  countNumber: string;
  note?: string | null;
  items: CreateInventoryCountCommandItem[];
}
```

Otvori servis i dodaj `create`:

```typescript
create(payload: CreateInventoryCountCommand): Observable<number> {
  return this.http.post<number>(this.baseUrl, payload);
}
```

Dodaj import za command tip.

Ako backend vrati `{ id: number }` umjesto raw int, uskladi (vidi Network tab). Sa `return Ok(id)` Angular dobija broj.

### Provjera

- `list` i dalje radi.
- `create` postoji.

---

## 16. Frontend — master-detail forma (FormArray)

Ovo je najduži frontend dio. Kostur već ima `addItem()` / `removeItem()`. Tvoj posao je **povezati** kontrole, validatore, lookup, pregled i POST.

### 16.1. Šta HTML trenutno fali

Fajl: `inventory-count-add.component.html`

- `<form>` nema `[formGroup]="form"`
- Inputi nemaju `formControlName`
- Stavke nisu u `formArrayName="items"` / `formGroupName="i"`
- Proizvodi se ne učitavaju
- Readonly polja su `-`
- Nema disabled na Sačuvaj

Generičke metode su date — **ne piši novi add/remove od nule**, samo ih koristi.

### 16.2. TS — forma, lookup, reset samo izmijenjenog reda

Fajl: `inventory-count-add.component.ts`

Ključna pravila:

- Početno jedna prazna stavka (`constructor { this.addItem(); }` već postoji).
- Promjena proizvoda osvježava readonly podatke i **briše countedQuantity samo tog reda**.
- Ponovni izbor **istog** Id-a ne resetuje unos.
- Promjena proizvoda ne dira druge redove ni zaglavlje.
- Pregled: za nepotpun red `-`, bez pretpostavljene količine 0.
- Ukupni pregled samo kad su **svi** redovi kompletni.
- 0 je validan counted.
- Sačuvaj disabled dok je forma invalid ili `isSaving`.

```typescript
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ExamProductsApiService } from '../../../../../api-services/exam-products/exam-products-api.service';
import { ExamProductLookupItem } from '../../../../../api-services/exam-products/exam-products-api.models';
import { InventoryCountsApiService } from '../../../../../api-services/inventory-counts/inventory-counts-api.service';
import { ToasterService } from '../../../../../core/services/toaster.service';
import { getErrorMessage } from '../../../../../core/interceptors/error-logging-interceptor.service';

@Component({
  selector: 'app-inventory-count-add',
  standalone: false,
  templateUrl: './inventory-count-add.component.html',
  styleUrl: './inventory-count-add.component.scss',
})
export class InventoryCountAddComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(InventoryCountsApiService);
  private readonly productsApi = inject(ExamProductsApiService);
  private readonly toaster = inject(ToasterService);

  products: ExamProductLookupItem[] = [];
  isSaving = false;
  private lastProductIds = new Map<number, number | null>();

  readonly form = this.fb.group({
    countNumber: ['', [inventoryNumberValidator()]],
    note: ['', [Validators.maxLength(500)]],
    items: this.fb.array<FormGroup>([]),
  }, { validators: [duplicateProductValidator] });

  constructor() {
    this.addItem();
  }

  ngOnInit(): void {
    this.productsApi.lookup().subscribe({
      next: (items) => (this.products = items),
      error: (err) => this.toaster.error(getErrorMessage(err)),
    });
  }

  get items(): FormArray<FormGroup> {
    return this.form.controls.items;
  }

  addItem(): void {
    const group = this.fb.group({
      productId: [null as number | null, [Validators.required, Validators.min(1)]],
      countedQuantity: [null as number | null, [
        Validators.required,
        Validators.min(0),
        Validators.max(100000),
        integerValidator(),
      ]],
    });

    this.items.push(group);
    this.lastProductIds.set(this.items.length - 1, null);
    this.applyShortageRule();
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.lastProductIds.delete(index);
    this.applyShortageRule();
  }

  onProductChange(index: number, newId: number | null): void {
    const prev = this.lastProductIds.get(index);
    if (prev !== newId) {
      this.items.at(index).patchValue({ countedQuantity: null });
      this.lastProductIds.set(index, newId);
    }
    this.applyShortageRule();
  }

  productOf(row: FormGroup): ExamProductLookupItem | undefined {
    const id = row.controls['productId'].value;
    return this.products.find(p => p.id === id);
  }

  preview(row: FormGroup): { system: string; price: string; diff: string; value: string } {
    const product = this.productOf(row);
    const counted = row.controls['countedQuantity'].value;

    if (!product) {
      return { system: '-', price: '-', diff: '-', value: '-' };
    }

    const system = String(product.stockQuantity);
    const price = product.price.toFixed(2);

    if (counted === null || counted === undefined || counted === '') {
      return { system, price, diff: '-', value: '-' };
    }

    const diff = Number(counted) - product.stockQuantity;
    const value = diff * product.price;
    return {
      system,
      price,
      diff: String(diff),
      value: value.toFixed(2),
    };
  }

  get totalPreview(): string {
    if (this.items.length === 0) return '-';

    let sum = 0;
    for (const row of this.items.controls) {
      const p = this.preview(row);
      if (p.value === '-') return '-';
      sum += Number(p.value);
    }
    return sum.toFixed(2);
  }

  cancel(): void {
    this.router.navigate(['/admin/inventory-counts']);
  }

  save(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const raw = this.form.getRawValue();

    this.api.create({
      countNumber: (raw.countNumber ?? '').trim(),
      note: (raw.note ?? '').trim() || null,
      items: (raw.items ?? []).map((i: any) => ({
        productId: i.productId,
        countedQuantity: Number(i.countedQuantity),
      })),
    }).subscribe({
      next: () => {
        this.toaster.success('Inventura je snimljena.');
        this.router.navigate(['/admin/inventory-counts']);
      },
      error: (err) => {
        this.isSaving = false;
        this.toaster.error(getErrorMessage(err));
      },
    });
  }

  private applyShortageRule(): void {
    const noteCtrl = this.form.controls.note;
    const hasShortage = this.items.controls.some(row => {
      const p = this.productOf(row);
      const counted = row.controls['countedQuantity'].value;
      if (!p || counted === null || counted === undefined || counted === '') return false;
      return Number(counted) < p.stockQuantity;
    });

    if (hasShortage) {
      noteCtrl.setValidators([Validators.required, Validators.maxLength(500)]);
    } else {
      noteCtrl.setValidators([Validators.maxLength(500)]);
    }
    noteCtrl.updateValueAndValidity({ emitEvent: false });
  }
}

function inventoryNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (!value.trim()) return { required: true };
    const t = value.trim();
    if (t.length < 5 || t.length > 20) return { codeLength: true };
    if (!t.startsWith('INV-')) return { codePrefix: true };
    return null;
  };
}

function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || v === '') return null;
    return Number.isInteger(Number(v)) ? null : { notInteger: true };
  };
}

function duplicateProductValidator(group: AbstractControl): ValidationErrors | null {
  const items = (group.get('items') as FormArray | null)?.controls ?? [];
  const ids = items
    .map(c => c.get('productId')?.value)
    .filter((id): id is number => !!id);
  return ids.length !== new Set(ids).size ? { duplicateProduct: true } : null;
}

```

Napomena za manjak **nije** u group validatoru jer validator nema lookup proizvoda. Zato je `applyShortageRule()` u klasi. Po želji dodaj i:

```typescript
this.form.valueChanges.subscribe(() => this.applyShortageRule());
```

u `ngOnInit`, da se napomena revalidira čim korisnik unese količinu.

U HTML-u na `mat-select` mora stajati `(selectionChange)="onProductChange(i, $event.value)"`. Ponovni klik na isti proizvod: `prev === newId` → counted se **ne** resetuje.

### 16.3. HTML — povezivanje kontrola

```html
<section class="form-page">
  <header>
    <button mat-icon-button title="Nazad" (click)="cancel()">
      <mat-icon>arrow_back</mat-icon>
    </button>
    <h1>Nova inventura</h1>
  </header>

  <form [formGroup]="form">
    <div class="master">
      <mat-form-field appearance="outline">
        <mat-label>Broj inventure</mat-label>
        <input matInput formControlName="countNumber">
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Napomena</mat-label>
        <textarea matInput rows="2" formControlName="note"></textarea>
      </mat-form-field>
    </div>

    <div class="items-header">
      <h2>Stavke inventure</h2>
      <button mat-stroked-button type="button" (click)="addItem()">
        <mat-icon>add</mat-icon>Dodaj stavku
      </button>
    </div>

    <div class="items" formArrayName="items">
      @for (item of items.controls; track $index; let i = $index) {
        <div class="item-row" [formGroupName]="i">
          <span class="index">{{ i + 1 }}.</span>

          <mat-form-field appearance="outline">
            <mat-label>Proizvod</mat-label>
            <mat-select formControlName="productId" (selectionChange)="onProductChange(i, $event.value)">
              @for (product of products; track product.id) {
                <mat-option [value]="product.id">{{ product.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="readonly">Evidentirano: {{ preview(item).system }}</div>
          <div class="readonly">Cijena: {{ preview(item).price }}</div>

          <mat-form-field appearance="outline">
            <mat-label>Prebrojano</mat-label>
            <input matInput type="number" formControlName="countedQuantity">
          </mat-form-field>

          <div class="readonly">Razlika: {{ preview(item).diff }}</div>
          <div class="readonly">Vrijednost: {{ preview(item).value }}</div>

          <button mat-icon-button type="button" title="Ukloni" (click)="removeItem(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      }
    </div>

    <div class="summary">
      Ukupno odstupanje: <strong>{{ totalPreview }}</strong>
    </div>

    <div class="actions">
      <button mat-button type="button" (click)="cancel()">Odustani</button>
      <button mat-flat-button color="primary" type="button"
              [disabled]="form.invalid || isSaving"
              (click)="save()">
        Sacuvaj
      </button>
    </div>
  </form>
</section>
```

`preview(item)` — `item` je `FormGroup` iz `items.controls`.

Readonly zaliha i cijena dolaze iz **lookup** podataka. To je samo pregled. Backend će ponovo pročitati bazu — ako u međuvremenu neko drugi promijeni zalihu, FE broj može biti zastario. Zadatak kaže da se konkurentnost ne ocjenjuje.

### 16.4. Validacija na FE (da Sačuvaj bude disabled)

| Pravilo | Kako |
|---------|------|
| Broj 5–20, `INV-` | `inventoryNumberValidator` |
| Napomena max 500 | `Validators.maxLength(500)` |
| Napomena required ako manjak | `applyShortageRule` |
| Min 1 stavka | ne dozvoli remove zadnje **ili** validator `items.minlength` |
| Proizvod obavezan | `Validators.required` |
| Counted 0–100000 integer | min/max/integer; `required` na number 0 **prolazi** |
| Dupli proizvod | `duplicateProductValidator` na grupi |

Ne spajaj duplikate u jedan red.

### Provjera forme

- Jedna prazna stavka na startu.
- Lookup pun.
- Izaberi Tastatura: Evidentirano 10, Cijena 20.00, Prebrojano prazno, Razlika `-`.
- Unesi 8: Razlika -2, Vrijednost -40.00, Sačuvaj disabled dok nema napomene.
- Unesi napomenu: Sačuvaj se upali.
- Promijeni proizvod na Mis: counted se obriše, Tastatura red ne postoji više, zaglavlje ostaje.
- Vrati isti Mis: ako nisi mijenjala Id, counted ostaje (test: izaberi Mis, unesi 3, ponovo klikni Mis).
- Dva reda iste Tastature: forma invalid.
- Ukloni sve stavke: ne može snimiti.
- Uspjeh: lista pokazuje novi red, toast.
- 409: ostaješ na formi, unosi ostaju, `isSaving` se vraća na false pa možeš opet kliknuti.

---

## 17. Toast, tok forme i isSaving

Zadatak:

> Komponenta prikazuje toast; interceptor samo loguje i prosljeđuje grešku.

Koristi `ToasterService` + `getErrorMessage(err)`.

| Ishod | Ponašanje |
|-------|-----------|
| Uspjeh | toast success, `navigate` na listu, nova inventura vidljiva |
| Greška | toast error, ostani, unosi sačuvani, `isSaving = false` |
| Tokom slanja | Sačuvaj disabled (`isSaving`) da nema double-click |

`isSaving = true` **prije** subscribe. U `next` ne moraš vraćati false jer odlaziš sa stranice. U `error` obavezno `false`.

Ako staviš `isSaving = true` i zaboraviš error granu, dugme ostaje mrtvo — gubiš bodove na toku.

---

## 18. Najčešće greške

1. **Nema migracije** — child tabela ne postoji, POST 500.
2. **`AsNoTracking` na proizvodima** — zaliha se „promijeni" u memoriji a ne snimi, ili EF ne prati.
3. **`StockQuantity += counted`** — zadatak traži zamjenu.
4. **Snimak nakon izmjene zalihe** — SystemQuantity postane već nova vrijednost.
5. **Vjeruješ frontendu** za cijenu/zalihu/razliku.
6. **Napomena gledaš prema sumi** umjesto bilo kojeg manjka.
7. **0 odbiješ kao prazno** — `countedQuantity: 0` mora proći.
8. **Duplikate spojiš** umjesto 409.
9. **Unique index na CountNumber** — nije tražen; unique u handleru.
10. **FK 500** jer nisi provjerila ProductId.
11. **Demo redovi ostaju** na listi.
12. **Paginator `length = rows.length`** — uvijek 5 ili 2, ne total.
13. **HTML nije vezan na FormArray** — save šalje prazno.
14. **Reset counted na svim redovima** kad se jedan proizvod promijeni.
15. **Toast u interceptoru**.
16. **Dva SaveChanges** (jedan za inventuru, jedan za zalihe) — ako drugi padne, stanje je rascijepano. Jedan SaveChanges.
17. **Mijenjaš Price ili proizvode van liste stavki**.
18. **Koristiš ProductOffers** iz I modula.

---

## 19. Checklista prije predaje

Backend

- [ ] `InventoryCountItemEntity` + BaseEntity
- [ ] Kolekcija `Items` na roditelju
- [ ] EF: Restrict na Product, veza na parent
- [ ] DbSet u `IAppDbContext` i `DatabaseContext`
- [ ] Nova migracija primijenjena
- [ ] POST `/InventoryCounts` vraća Id
- [ ] Command prima samo broj, napomenu, productId, countedQuantity
- [ ] System/UnitPrice/Difference/DifferenceValue računa BE
- [ ] `INV-` case-sensitive, 5–20, Trim
- [ ] Unique broj case-insensitive, 409
- [ ] Min 1 stavka
- [ ] Counted 0–100000
- [ ] Dupli proizvod 409, bez merge
- [ ] Manjak → napomena obavezna, 409
- [ ] Loš ProductId 400
- [ ] ItemsCount i suma DifferenceValue
- [ ] `StockQuantity = CountedQuantity`
- [ ] Jedan SaveChanges
- [ ] CreatedAtUtc serverski

Frontend

- [ ] Nema demo redova
- [ ] Prazna lista OK
- [ ] Paging 5/10, total sa BE
- [ ] Datum `dd.MM.yyyy`
- [ ] Napomena `-` ako null
- [ ] FormArray povezan
- [ ] Lookup proizvoda
- [ ] Readonly zaliha/cijena
- [ ] Reset counted samo izmijenjenog reda
- [ ] Pregled `-` dok red nije kompletan
- [ ] Ukupni pregled tek kad su svi kompletni
- [ ] Sačuvaj disabled dok invalid / isSaving
- [ ] Uspjeh → lista; greška → ostanak + toast
- [ ] Interceptor bez toasta

Upload

- [ ] `IB00000_novi-angular.rar`
- [ ] `IB00000_novi -api.rar`

---

## 20. Šta je nejasno iz zadatka

| Nejasnoća | Kako je riješeno iz templatea / teksta |
|-----------|----------------------------------------|
| Tačan tekst 409 poruka | „Razumljiva poruka" — piši na bosanskom šta je pošlo po zlu. |
| Lista datum: template `dd.MM.yyyy HH:mm`, tekst `dd.MM.yyyy` | Tekst zadatka je mjerodavan → `dd.MM.yyyy`. |
| POST 200 vs 201 | Traži se povrat Id-a. `Ok(id)` ili `CreatedAtAction`. |
| Da li validator duplikata smije biti 400 | Tekst kaže 409 za ponovljen proizvod — stavi u handler. |
| Ime tabele stavki | Nije dato. `InventoryCountItems` prati postojeće `InventoryCounts` / `OrderItems`. |
| Cascade vs Restrict na roditelja | Restrict je eksplicitno samo prema **proizvodu**. Stavka bez roditelja se rješava obaveznim FK + Cascade sa parenta (kao Order). |
| FE izračun Round vs običan `toFixed(2)` | Pregled je ilustracija; ocjenjuje se BE `AwayFromZero`. Za FE pregled `toFixed(2)` je dovoljno. |
| Da li list handler treba Include stavki | Ne. Lista već vraća agregate sa roditelja. |

Ako nešto na papiru i dalje nije čitljivo, ne izmišljaj novo pravilo. Radi ono što piše u sekcijama 1 i 5 ovog vodiča i što već postoji u starter kosturu.
