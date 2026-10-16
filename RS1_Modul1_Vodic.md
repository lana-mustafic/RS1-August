# RS1 — Modul 1 — Vodič (26.08.2026.)

> **Cilj ovog dokumenta:** Da možeš na ispitu *doslovno pratiti korake* i uraditi prvi modul, a ne samo da znaš „šta se traži".
> **Pravilo:** Prvo čitaj postojeći kod u projektu (ProductCategories, Products, ExamProducts), razumij obrazac, zatim piši za Promotivne ponude.
> **Izvor istine:** tekst zadatka iz PDF-a. Slike u templateu su samo izgled. Ako se slika i tekst razlikuju, radi po tekstu.

---

## Sadržaj

1. [Šta se traži](#1-šta-se-traži)
2. [Priprema okruženja na ispitu](#2-priprema-okruženja-na-ispitu)
3. [Pregled arhitekture i šta je VEĆ u templateu](#3-pregled-arhitekture-i-šta-je-već-u-templateu)
4. [Kako čitati ovaj zadatak](#4-kako-čitati-ovaj-zadatak)
5. [Redoslijed rada (nemoj preskakati)](#5-redoslijed-rada-nemoj-preskakati)
6. [Poslovna pravila statusa i cijene — nauči ovo PRIJE koda](#6-poslovna-pravila-statusa-i-cijene--nauči-ovo-prije-koda)
7. [Backend — zajednička pravila (helper)](#7-backend--zajednička-pravila-helper)
8. [Backend — Lista (GET /ProductOffers)](#8-backend--lista-get-productoffers)
9. [Backend — GetById (GET /ProductOffers/{id})](#9-backend--getbyid-get-productoffersid)
10. [Backend — Create (POST /ProductOffers)](#10-backend--create-post-productoffers)
11. [Backend — Update (PUT /ProductOffers/{id})](#11-backend--update-put-productoffersid)
12. [Backend — Delete (DELETE /ProductOffers/{id})](#12-backend--delete-delete-productoffersid)
13. [Backend — Controller](#13-backend--controller)
14. [Provjera backenda u Swaggeru](#14-provjera-backenda-u-swaggeru)
15. [Frontend — API modeli i servis](#15-frontend--api-modeli-i-servis)
16. [Frontend — Lista, filteri, paginacija, brisanje](#16-frontend--lista-filteri-paginacija-brisanje)
17. [Frontend — Dodavanje (Reactive Forms)](#17-frontend--dodavanje-reactive-forms)
18. [Frontend — Uređivanje](#18-frontend--uređivanje)
19. [Toast, interceptor i tok nakon akcija](#19-toast-interceptor-i-tok-nakon-akcija)
20. [Najčešće greške](#20-najčešće-greške)
21. [Checklista prije predaje](#21-checklista-prije-predaje)
22. [Šta je nejasno iz zadatka](#22-šta-je-nejasno-iz-zadatka)

---

## 1. Šta se traži

Na ispitu iz **Razvoja softvera I** od **26.08.2026.** prvi modul je administrativni CRUD:

**Promotivne ponude proizvoda** (`ProductOffer`)

Jedna ponuda povezuje:

- jedan **proizvod**
- **procenat popusta**
- **krajnji datum važenja**

Trebaš uraditi:

| Dio | Šta |
|-----|-----|
| Lista | tabela iz API-ja, filteri, paginacija, status, cijena s popustom |
| Dodavanje | Reactive Form + POST |
| Uređivanje | prefill po Id-u + PUT |
| Brisanje | modal + soft delete, samo ako je ponuda **isključena** |

### Šta ovaj modul NIJE

- Ponude se **ne** primjenjuju na korpu ni narudžbu.
- **Ne** mijenjaš `Product.Price`.
- **Ne** diraš postojeći `PromotionEntity` (to su banneri, drugi entitet).
- **Ne** praviš novu migraciju.
- **Ne** mijenjaš postojeće entitete.
- Status ponude se **ne čuva kao kolona** — računa se pri čitanju.

### Polja modela (već postoje u `ProductOfferEntity`)

| Polje | Značenje |
|-------|----------|
| `Id` | iz `BaseEntity` |
| `Code` | oznaka, npr. `OFF-LJETO` |
| `ProductId` | proizvod na koji se ponuda odnosi |
| `DiscountPercent` | procenat popusta |
| `ValidUntilUtc` | datum važenja (UTC) |
| `IsEnabled` | da li je ponuda uključena |
| `CreatedAtUtc`, `ModifiedAtUtc`, `IsDeleted` | audit + soft delete iz `BaseEntity` |

### Obavezna pravila cijelog ispita (crveni okvir)

1. Backend: **CQRS** (Command/Query + Handler + Validator).
2. Frontend: **Reactive Forms** za create i update.
3. **Toast** za svaku uspješnu akciju i grešku.
4. **Paginacija** na listi.
5. **Modal potvrde** prije brisanja.
6. Dizajn se **ne ocjenjuje** — HTML/CSS već postoji.

### Bodovna mapa (da znaš šta „boli" ako preskočiš)

| Br. | Funkcionalnost | Bodovi |
|-----|----------------|--------|
| 1 | Lista: API, kolone, prikaz | 8 |
| 2 | Izvedeni status + decimalna cijena s popustom | 10 |
| 3 | Paginacija, total filtriranog skupa, stabilan sort | 5 |
| 4 | Dva filtera (proizvod + samo aktivne), AND, povratak na 1. stranicu | 8 |
| 5 | FE validacija, poruke, disabled Sačuvaj | 8 |
| 6 | BE osnovna validacija (oznaka, proizvod, popust, datum) | 8 |
| 7 | Jedinstvena oznaka (trim, case-insensitive, ignore deleted, exclude current Id) | 6 |
| 8 | Jedna aktivna ponuda po proizvodu | 8 |
| 9 | Create: mapiranje, `IsEnabled=true`, serverski `CreatedAtUtc` | 8 |
| 10 | Get/update: prefill, sva polja, `CreatedAtUtc` se ne dira | 8 |
| 11 | Uključivanje i datum (prošli datum samo ako je isključena) | 6 |
| 12 | Modal + delete guard po `IsEnabled` + soft delete | 10 |
| 13 | Tok: lista pri uspjehu, ostanak pri grešci | 3 |
| 14 | Toast iz komponente | 4 |
| | **Ukupno** | **100** |

---

## 2. Priprema okruženja na ispitu

### 2.1. Alati

| Alat | Za šta |
|------|--------|
| **Visual Studio** | Backend (`Market.API`) |
| **VS Code** | Frontend (Angular) |
| **SSMS** | Kreiranje baze |
| **Browser** | Testiranje + Swagger |

### 2.2. Baza (SSMS)

1. Konektuj se na `10.10.10.18`
2. SQL Server Authentication
   - user: `sa`
   - password: `test`
3. Napravi **novu bazu** imenom svog indeksa (npr. `IB210001`)

### 2.3. Connection string

Fajl: `rs1_backend-2025-26/Market.API/appsettings.json`

U `ConnectionStrings.Main` zamijeni `Database=_broj_indeksa2026-08-26` svojim indeksom:

```
Server=10.10.10.18,1433;Database=TVOJ_INDEKS;Trusted_Connection=False;User ID=sa;Password=test;MultipleActiveResultSets=true;TrustServerCertificate=True
```

### 2.4. Pokretanje backenda

Aplikacija pri startu sama radi `MigrateAsync()` i seed. **Za I modul ne radiš novu migraciju.**

U Visual Studiju pokreni `Market.API` (profil `http`). Swagger se otvara na:

`http://localhost:7001/swagger`

### 2.5. NPM u učionici (PowerShell blokira skripte)

U terminalu Angular projekta:

```
cmd
npm install
npm start
```

Ako `ng` nije u PATH-u:

```
npx ng g c NazivKomponente
```

Za ovaj ispit **ne trebaš** generisati nove Angular komponente — kosturi već postoje.

### 2.6. Login (obavezno)

Endpointi za ponude i lookup proizvoda koriste policy **Staff**.

Seed nalozi:

| Email | Lozinka | Uloga |
|-------|---------|-------|
| `admin@market.local` | `Admin123!` | Admin |
| `manager@market.local` | `Manager123!` | Manager |
| `employee@market.local` | `Employee123!` | Employee |
| `string` | `string` | Employee (Swagger dummy) |

Frontend: `http://localhost:4200`
Backend API: `http://localhost:7001` (vidi `src/environments/environment.ts`)

### Provjera

- Backend se digne bez exceptiona.
- U SSMS vidiš tabele, uključujući `ProductOffers`.
- Možeš se ulogovati u admin panel.
- U sidebaru postoji **Promotivne ponude** (`/admin/product-offers`).

---

## 3. Pregled arhitekture i šta je VEĆ u templateu

### 3.1. Dva projekta

```
RS1-ispit-2026-08-26-share/
├── rs1_backend-2025-26/     ← Visual Studio solution
└── rs1-frontend-2025-26/    ← Angular
```

### 3.2. Backend slojevi

| Projekt | Uloga | Gdje diraš na ispitu |
|---------|-------|----------------------|
| `Market.Domain` | Entiteti, enumi | **Ne mijenjaš** u I modulu |
| `Market.Application` | CQRS (Queries, Commands, Handlers, Validators) | **Ovdje radiš najviše** |
| `Market.Infrastructure` | DbContext, EF config, migracije, seed | **Ne mijenjaš** u I modulu |
| `Market.API` | Kontroleri | Novi `ProductOffersController` |

Nema Repository patterna. Handleri koriste `IAppDbContext`.

### 3.3. Šta je VEĆ urađeno (ne radi od nule)

#### Backend — gotovo

| Fajl | Stanje |
|------|--------|
| `Market.Domain/Entities/Catalog/ProductOfferEntity.cs` | Entitet gotov |
| `Market.Domain/Entities/Catalog/ProductOfferStateType.cs` | Enum: Aktivna=1, Istekla=2, Iskljucena=3 |
| `Market.Infrastructure/.../ProductOfferConfiguration.cs` | Tabela `ProductOffers`, FK Restrict na Product |
| `IAppDbContext` + `DatabaseContext` | `DbSet<ProductOfferEntity> ProductOffers` |
| Migracija `20260826023244_Init` | Tabela već postoji |
| `DynamicDataSeeder.SeedProductOffersAsync` | 12 seed ponuda |
| `GET /ExamProducts/lookup` | svi neobrisani proizvodi: id, name, price, stockQuantity |

#### Backend — TI radiš

| Šta | Zašto |
|-----|-------|
| List/GetById/Create/Update/Delete CQRS | Ne postoji ni jedan ProductOffers handler |
| `ProductOffersController` | Ne postoji |
| Validatorima + poslovnim pravilima | Ocjenjuje se validacija i 409 konflikti |

#### Frontend — gotovo

| Fajl | Stanje |
|------|--------|
| `catalogs/product-offers/product-offers.component.*` | Lista sa **demo redovima** |
| `product-offer-add/` | Forma bez validatora i bez save logike |
| `product-offer-edit/` | Forma + checkbox Uključena, bez učitavanja |
| Rute `/admin/product-offers`, `/add`, `/edit/:id` | Registrovane |
| Sidebar link | Postoji |
| `exam-products-api.service.ts` | `lookup()` gotov |
| `product-offers-api.models.ts` | Samo enum statusa |
| Paging, toast, dialog, `getErrorMessage()` | Postoje u projektu |

#### Frontend — TI radiš

| Šta | Problem u templateu |
|-----|---------------------|
| `product-offers-api.service.ts` | **Ne postoji** |
| Modeli za list/get/create/update | Nedostaju |
| Zamjena demo redova API-jem | Hardkodirano u `rows` |
| Filteri | `mat-select` i checkbox nisu povezani |
| Paginator | `[length]="12"` hardkodirano |
| Add/Edit `save()` | `TODO` komentar |
| Delete | `TODO` komentar |
| Toast | Nema |

### 3.4. Važni mehanizmi koje NE smiješ zaobići

**1. Globalni filter `IsDeleted = false`**

U `DatabaseConfiguration.cs` svaki `BaseEntity` automatski ide kroz:

```csharp
e.IsDeleted == false
```

Znači: `ctx.ProductOffers` **već ne vraća obrisane**. Ne moraš svuda pisati `!x.IsDeleted`, ali i ne smiješ očekivati da vidiš obrisane zapise. Obrisani kod se smije ponovo koristiti jer unique provjera ide po neobrisanim.

**2. Audit pri `SaveChanges`**

Pri `EntityState.Added` automatski se postavlja:

- `CreatedAtUtc = UtcNow`
- `IsDeleted = false`

Pri `EntityState.Deleted` EF pretvara u **soft delete** (`IsDeleted = true`).

Zato za brisanje možeš uraditi ili:

```csharp
ctx.ProductOffers.Remove(entity);
```

ili ručno:

```csharp
entity.IsDeleted = true;
```

Oba završe kao soft delete. `Remove` je bliži postojećem obrascu.

**3. Validation pipeline**

`ValidationBehavior` automatski pokreće svaki `AbstractValidator<T>` prije handlera. Ako validator padne → HTTP **400**. Ne zovi validator ručno.

**4. HTTP kodovi (obavezno koristi postojeće klase)**

| Situacija | Klasa | HTTP |
|-----------|-------|------|
| Format / obavezna polja | `ValidationException` (FluentValidation) | 400 |
| Zapis ne postoji / već obrisan | `MarketNotFoundException` | 404 |
| Dupli kod, druga aktivna ponuda, brisanje uključene | `MarketConflictException` | 409 |

### 3.5. Referentni primjer — kopiraj OBRASAC, ne nazive

Prije pisanja ProductOffers otvori:

**Backend**

- List: `Market.Application/Modules/Catalog/ProductCategories/Queries/List/`
- GetById: `.../Queries/GetById/`
- Create: `.../Commands/Create/`
- Update: `.../Commands/Update/`
- Delete: `.../Commands/Delete/`
- Controller: `Market.API/Controllers/ProductCategoriesController.cs`

**Frontend**

- Servis: `api-services/product-categories/product-categories-api.service.ts`
- Modeli: `product-categories-api.model.ts`
- Toast + delete modal: `product-categories-2.component.ts`
- Forma: `products-add.component.ts`
- Lookup proizvoda: `exam-products-api.service.ts`
- Paging helper: `buildHttpParams()`
- Error helper: `getErrorMessage()` u `error-logging-interceptor.service.ts`

---

## 4. Kako čitati ovaj zadatak

### 4.1. Tri pitanja

1. **Koji entitet?** `ProductOfferEntity` — već postoji.
2. **Koje operacije?** List + GetById + Create + Update + Delete.
3. **Šta je izvedeno?** Status i cijena s popustom — računa backend, frontend samo prikazuje.

### 4.2. Ključne rečenice iz PDF-a

| Rečenica | Šta radiš |
|----------|-----------|
| Status je izveden i ne čuva se kao kolona | Računaj u List DTO, ne u bazi |
| Cijenu s popustom vratiti iz list DTO-a; frontend ih ne računa ponovo | Polje `discountedPrice` (i status) u DTO |
| Filteri rade na backendu prije brojanja i paginacije | `Where` prije `PageResult.FromQueryableAsync` |
| Promjena filtera vraća na prvu stranicu | `paging.page = 1` u FE |
| Početna veličina 5, opcije 5/10 | `pageSize = 5` |
| Sort: CreatedAtUtc desc, zatim Id desc | `OrderByDescending` + `ThenByDescending` |
| Code: Trim, 5–20, počinje sa `OFF-` (case-sensitive) | Validator + spremi trimovano |
| Unique: Trim + case-insensitive, ignore deleted, exclude current Id | U **handleru**, HTTP 409 |
| Jedna aktivna po proizvodu; istekla ne blokira | Aktivna = uključena **i** datum >= danas |
| Create ne prikazuje checkbox; backend `IsEnabled=true` | FE add forma nema checkbox |
| Uključena ponuda ne smije imati datum prije danas | Validator + handler |
| Ako je konačno `IsEnabled=false`, dozvoljen je i prošli datum | Update pravilo |
| Brisanje samo kad `IsEnabled=false` | FE disable dugme + BE 409 |
| Modal: `Da li želite obrisati ponudu {Code}?` | Tačan tekst |
| Nakon brisanja osvježiti prvu stranicu uz postojeće filtere | `page = 1` + isti filteri |
| Interceptor samo loguje | Toast ide u komponentu |
| Nema unique indeksa niti nove migracije | Ne diraj EF konfiguraciju |

---

## 5. Redoslijed rada (nemoj preskakati)

Radi ovim redom. Svaki korak zavisi od prethodnog.

1. Pročitaj postojeći `ProductOfferEntity` i seed (da znaš test podatke).
2. Napravi mali helper za status i cijenu (isti izračun svuda).
3. Backend List query + DTO + handler.
4. Backend GetById.
5. Backend Create (command + validator + handler).
6. Backend Update.
7. Backend Delete.
8. `ProductOffersController`.
9. Test u Swaggeru (lista, filter, create, unique 409, delete guard).
10. Frontend API modeli + servis.
11. Lista + filteri + paginator + delete modal.
12. Add forma.
13. Edit forma.
14. End-to-end u browseru.

Ako kreneš od frontenda prije Swaggera, gubiš vrijeme na „ne radi" a ne znaš da li je BE ili FE.

---

## 6. Poslovna pravila statusa i cijene — nauči ovo PRIJE koda

Ovo nosi **10 bodova** i koristi se i u filteru „Samo aktivne" i u pravilu „jedna aktivna po proizvodu".

### 6.1. Jedna referentna vrijednost datuma po zahtjevu

Na početku handlera uzmi **jednom**:

```csharp
var todayUtc = DateTime.UtcNow.Date;
```

Ne zovi `DateTime.UtcNow.Date` u petlji. Zadatak: porediti **kalendarski dio** datuma sa `DateTime.UtcNow.Date`.

Ponuda čiji je `ValidUntilUtc.Date` **jednak** današnjem UTC datumu je još **aktivna** taj dan.

### 6.2. Redoslijed statusa (strogo ovim redom)

1. Ako je `IsEnabled == false` → **Isključena**, bez obzira na datum.
2. Inače, ako je `ValidUntilUtc.Date < todayUtc` → **Istekla**.
3. Inače → **Aktivna**.

Primjeri (pretpostavi danas = 16.09.2026. UTC):

| IsEnabled | ValidUntilUtc | Status |
|-----------|---------------|--------|
| false | 01.01.2030 | Isključena |
| true | 15.09.2026 | Istekla |
| true | 16.09.2026 | Aktivna |
| true | 20.09.2026 | Aktivna |
| false | 01.01.2020 | Isključena (nije Istekla!) |

### 6.3. „Aktivna" za filter i unique pravilo

Aktivna znači **oba**:

- `IsEnabled == true`
- `ValidUntilUtc.Date >= todayUtc`

Uključena ali istekla **ne blokira** novu ponudu na istom proizvodu.

### 6.4. Cijena s popustom

```text
DiscountedPrice = Round(Product.Price * (1 - DiscountPercent / 100), 2)
MidpointRounding.AwayFromZero
```

- Koristi `decimal`, ne `double`.
- Računa se za **sve** ponude (i istekle i isključene).
- **Ne snima se** u `Product.Price`.
- Frontend **ne** računa ponovo — dolazi iz list DTO-a.

Primjer: cijena 20.00, popust 10% → `20.00 * 0.90 = 18.00`.

### 6.5. Seed podaci (za testiranje)

Seeder upisuje 12 ponuda. Status zavisi od **današnjeg UTC datuma**, ne od datuma ispita na papiru.

Ako danas radiš 16.09.2026., većina seed datuma (kraj avgusta / početak septembra) je **istekla**. To je OK: lista mora i dalje pokazati status Istekla/Isključena i cijenu s popustom.

Za test „jedna aktivna po proizvodu" kreiraj **novu** ponudu s datumom danas ili kasnije.

---

## 7. Backend — zajednička pravila (helper)

Ovo je prvi fajl koji sama praviš. U starteru **nema** `ProductOfferRules`. Nema ga ni u `ProductCategories`, `Products` ni `ExamProducts` — nemaš šta da prekopiraš. Ime klase nije obavezno, ali **isti izračun** moraš kasnije zvati iz List, Create i Update. Ako status računaš na tri mjesta različito, gubiš bodove.

U ovom koraku još ne praviš endpoint, validator ni handler. Samo jednu statičku klasu.

### Zašto baš ovdje

Zadatak daje strogi redoslijed statusa (odjeljak 6). Helper sprječava da lista kaže „Aktivna", a provjera „jedna aktivna po proizvodu" misli da nije.

Klasa je `static`. Ne registruješ je u `DependencyInjection`, ne praviš interface i ne diraš `Program.cs`. Handler je zove kao `ProductOfferRules.ResolveState(...)`.

Ne stavljaš je u `Market.Domain` ni u `Market.Infrastructure`. Enum `ProductOfferStateType` već stoji u Domainu. Helper stoji u Application sloju, jer ga zovu handleri.

`todayUtc` se **ne** računa unutar ove klase. Svaki handler ga uzme jednom (`DateTime.UtcNow.Date`) i proslijedi. Tako jedan zahtjev ima jedan referentni dan, kako zadatak traži.

### 7.1. Gdje u Solution Exploreru

Otvori `rs1_backend-2025-26.sln`.

Proširi:

`Market.Application` → `Modules` → `Catalog`

Tu već vidiš `ProductCategories`, `Products` i `ExamProducts`. `ProductOffers` **ne postoji**. Praviš ga.

### 7.2. Korak — folder

1. Desni klik na `Catalog`.
2. Add → New Folder.
3. Ime: `ProductOffers`.

Putanja na disku:

`Market.Application/Modules/Catalog/ProductOffers`

### 7.3. Korak — klasa

1. Desni klik na novi folder `ProductOffers`.
2. Add → Class.
3. Ime fajla: `ProductOfferRules.cs`.
4. Obriši ono što Visual Studio sam ubaci (prazan `class ProductOfferRules` i `using` koje ti ne trebaju).
5. Zalijepi kod ispod, cijeli fajl, ništa ne skraćuj.

Namespace mora biti tačno `Market.Application.Modules.Catalog.ProductOffers`. Ako Visual Studio stavi `Market.Application` ili `Market.Application.Modules.Catalog`, kasniji handleri neće naći klasu bez dodatnog `using`.

### 7.4. Kod koji upisuješ

```csharp
using Market.Domain.Entities.Catalog;

namespace Market.Application.Modules.Catalog.ProductOffers;

public static class ProductOfferRules
{
    public static ProductOfferStateType ResolveState(
        bool isEnabled,
        DateTime validUntilUtc,
        DateTime todayUtc)
    {
        if (!isEnabled)
            return ProductOfferStateType.Iskljucena;

        if (validUntilUtc.Date < todayUtc.Date)
            return ProductOfferStateType.Istekla;

        return ProductOfferStateType.Aktivna;
    }

    public static bool IsActive(bool isEnabled, DateTime validUntilUtc, DateTime todayUtc)
    {
        return ResolveState(isEnabled, validUntilUtc, todayUtc) == ProductOfferStateType.Aktivna;
    }

    public static decimal CalculateDiscountedPrice(decimal productPrice, decimal discountPercent)
    {
        return Math.Round(
            productPrice * (1 - discountPercent / 100m),
            2,
            MidpointRounding.AwayFromZero);
    }

    public static string StateLabel(ProductOfferStateType state)
    {
        return state switch
        {
            ProductOfferStateType.Aktivna => "Aktivna",
            ProductOfferStateType.Istekla => "Istekla",
            ProductOfferStateType.Iskljucena => "Isključena",
            _ => state.ToString()
        };
    }
}
```

`using Market.Domain.Entities.Catalog` treba jer je `ProductOfferStateType` u tom namespaceu. `Market.Application` već referencira `Market.Domain`, novi Project Reference ne dodaješ.

### 7.5. Šta koji dio koda znači

Za ovaj fajl ne otvaraš drugi handler u projektu. Nema slične `Rules` klase. Jedini postojeći kod koji ova klasa koristi je enum u `Market.Domain/Entities/Catalog/ProductOfferStateType.cs`:

```csharp
public enum ProductOfferStateType
{
    Aktivna = 1,
    Istekla = 2,
    Iskljucena = 3
}
```

`Aktivna`, `Istekla` i `Iskljucena` u helperu su baš ove tri vrijednosti. Ostalo (`static`, `Math.Round`, `switch`) je običan C#, ne obrazac iz `ProductCategories`.

**`using Market.Domain.Entities.Catalog;`**

Uvozi folder u kojem stoji enum. Poslije toga pišeš `ProductOfferStateType`, a ne puno ime `Market.Domain.Entities.Catalog.ProductOfferStateType`.

**`namespace Market.Application.Modules.Catalog.ProductOffers;`**

Adresa ove klase. Mora se poklapati sa folderom. Handleri koje kasnije staviš u `ProductOffers` vide `ProductOfferRules` bez dodatnog `using`.

**`public static class ProductOfferRules`**

`static` znači da se ne pravi objekat (`new` se ne piše) i da se klasa ne registruje u `DependencyInjection`. Poziv izgleda ovako:

```csharp
ProductOfferRules.ResolveState(ponuda.IsEnabled, ponuda.ValidUntilUtc, todayUtc);
```

**`ResolveState` — koji je status**

Prima tri podatka i vraća jedan od tri statusa:

| Parametar | Šta je |
|-----------|--------|
| `isEnabled` | da li je ponuda uključena (`IsEnabled` sa entiteta) |
| `validUntilUtc` | do kog datuma važi |
| `todayUtc` | današnji UTC datum, koji handler proslijedi |

`return` odmah izlazi iz metode. Zato je red `if` obavezan i ne smije se okrenuti:

1. `if (!isEnabled)` — uzvičnik znači „nije uključena". Odmah vraća `Iskljucena`. Datum se ne gleda. Isključena ponuda sa datumom u budućnosti i dalje je isključena.
2. `if (validUntilUtc.Date < todayUtc.Date)` — ponuda jeste uključena, ali je dan važenja prije današnjeg. Vraća `Istekla`. `.Date` skida sate i minute, pa se poredi samo kalendarski dan. Vrijeme u toku dana ne smije ponudu proglasiti isteklom.
3. Zadnji `return` — uključena je i datum je danas ili kasnije. Vraća `Aktivna`. Jednak dan (`==`) nije istek, jer uslov za istek je strogo `<`.

Primjer, danas 16.10.2026:

| Uključena | Važi do | Rezultat |
|-----------|---------|----------|
| ne | 01.01.2030 | Isključena |
| da | 15.10.2026 | Istekla |
| da | 16.10.2026 | Aktivna |
| da | 20.10.2026 | Aktivna |

`todayUtc` se ne računa u ovoj klasi. Handler na početku uzme jednom `DateTime.UtcNow.Date` i proslijedi isti dan u svaki poziv tog zahtjeva.

**`IsActive` — da li je baš aktivna**

Ista tri parametra. Unutra zove `ResolveState` i poredi rezultat sa `ProductOfferStateType.Aktivna`. Vraća `bool`: `true` ili `false`.

Kasnije je zoveš u Create i Update za pravilo „jedan proizvod smije imati samo jednu aktivnu ponudu". Uključena, ali istekla ponuda ovdje daje `false` i ne blokira novu.

**`CalculateDiscountedPrice` — cijena s popustom**

Prima redovnu cijenu proizvoda i procenat popusta. Oba su `decimal`.

Unutrašnji izraz je formula iz zadatka:

```text
cijena * (1 - popust / 100)
```

`100m` je decimalni broj 100. Slovo `m` drži dijeljenje u `decimal`. Običan `100` ili `double` ovdje ne ide.

`Math.Round(..., 2, MidpointRounding.AwayFromZero)` zaokružuje na dvije decimale. `AwayFromZero` znači da se .5 uvijek odmiče od nule: 1.125 postaje 1.13.

Cijena `20.00` i popust `10` daju `20 * 0.90 = 18.00`.

Računa se za svaku ponudu: aktivnu, isteklu i isključenu. Rezultat ide u DTO liste. Ne upisuje se u `Product.Price`.

**`StateLabel` — tekst za tabelu**

Prima status koji je `ResolveState` već vratio i vraća string za kolonu.

`switch` bira jednu granu:

- `Aktivna` → `"Aktivna"`
- `Istekla` → `"Istekla"`
- `Iskljucena` → `"Isključena"`

Enum se u kodu zove `Iskljucena`, bez slova č. Na ekranu mora pisati „Isključena", zato se ne oslanjaš na `state.ToString()` za taj slučaj. Grana `_` je rezerva ako se enum jednog dana proširi; za ovaj ispit se ne okida.

### 7.6. Šta u ovom koraku ne radiš

- Ne dodaješ migraciju i ne diraš `ProductOfferEntity` ni `ProductOfferConfiguration`.
- Ne praviš controller, query, command ni validator. To su sljedeći odjeljci.
- Ne računaš status u frontendu. Lista će dobiti `state` i `stateLabel` iz API-ja.
- Ne zoveš `DateTime.UtcNow` unutar ove klase.

### Provjera

1. Desni klik na projekat `Market.Application` → Build.
2. Build prolazi, bez crvenih grešaka na `ProductOfferRules.cs`.
3. U Swaggeru još nema `/ProductOffers`. To je očekivano: endpoint dolazi tek kad dodaš controller.

---

## 8. Backend — Lista (GET /ProductOffers)

### 8.1. Šta se traži

Lista vraća `PageResult` sa kolonama:

- oznaka (`Code`)
- naziv proizvoda
- redovna cijena
- procenat popusta
- cijena s popustom (**izračunata**)
- datum važenja
- tekstualni status (**izračunat**)

Filteri (AND):

- `productId` — prazno/null = svi
- `onlyActive=true` — samo status Aktivna; ako nije uključen, sva tri statusa

Obrisani se nikad ne prikazuju (globalni filter to već radi).

Sort: `CreatedAtUtc` opadajuće, zatim `Id` opadajuće.

Primjer:

```
GET /ProductOffers?productId=3&onlyActive=true&paging.page=1&paging.pageSize=5
```

### 8.2. Korak — Query

Folder:

`Market.Application/Modules/Catalog/ProductOffers/Queries/List/`

Fajl: `ListProductOffersQuery.cs`

Klasa nasljeđuje `BasePagedQuery<ListProductOffersQueryDto>` (isti obrazac kao `ListProductCategoriesQuery`).

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Queries.List;

public sealed class ListProductOffersQuery : BasePagedQuery<ListProductOffersQueryDto>
{
    public int? ProductId { get; init; }
    public bool? OnlyActive { get; init; }
}
```

`BasePagedQuery` već ima `Paging` (`page`, `pageSize`) i `IRequest<PageResult<T>>`.

### 8.3. Korak — DTO

Fajl: `ListProductOffersQueryDto.cs`

Frontend treba i enum i labelu (template već ima `state` i `stateLabel`). Cijenu s popustom obavezno vrati.

```csharp
using Market.Domain.Entities.Catalog;

namespace Market.Application.Modules.Catalog.ProductOffers.Queries.List;

public sealed class ListProductOffersQueryDto
{
    public required int Id { get; init; }
    public required string Code { get; init; }
    public required int ProductId { get; init; }
    public required string ProductName { get; init; }
    public required decimal Price { get; init; }
    public required decimal DiscountPercent { get; init; }
    public required decimal DiscountedPrice { get; init; }
    public required DateTime ValidUntilUtc { get; init; }
    public required ProductOfferStateType State { get; init; }
    public required string StateLabel { get; init; }
    public required bool IsEnabled { get; init; }
}
```

Ovaj DTO nije gotov u starteru. Fajl `ListProductOfferQueryDto.cs` koji Visual Studio napravi je prazan. U njega ide ovaj sadržaj.

Izgled klase (`public sealed class`, `required`, `{ get; init; }`) vidiš u `ListProductCategoriesQueryDto`. Tamo su samo `Id`, `Name` i `IsEnabled` kategorije. Ta polja se ne prepisuju ovdje. Polja ponude dolaze iz entiteta, kako je u tabelama ispod.

Ako je tvoj query već `ListProductOfferQuery` (jednina), klasa u DTO fajlu mora imati isto ime koje query koristi: `ListProductOfferQueryDto`. `using` i `namespace` ostaju kao u kodu iznad.

### Odakle koje polje

DTO je odgovor za listu. Nije entitet i ne snima se u bazu. Handler ga napuni iz dva postojeća entiteta, a tri polja izračuna.

**Sa `ProductOfferEntity`**

Fajl: `Market.Domain/Entities/Catalog/ProductOfferEntity.cs`. `Id` nasljeđuje iz `BaseEntity`.

| Polje u DTO-u | Polje na ponudi |
|---------------|-----------------|
| `Id` | `Id` |
| `Code` | `Code` |
| `ProductId` | `ProductId` |
| `DiscountPercent` | `DiscountPercent` |
| `ValidUntilUtc` | `ValidUntilUtc` |
| `IsEnabled` | `IsEnabled` |

`IsEnabled` ostaje u DTO-u jer frontend njime gasi dugme Obriši. Brisanje je dozvoljeno samo kad je ponuda isključena.

**Sa povezanog `ProductEntity`**

Fajl: `Market.Domain/Entities/Catalog/ProductEntity.cs`. Ponuda do proizvoda dolazi preko `ProductOfferEntity.Product` (veza je `ProductId`).

| Polje u DTO-u | Polje na proizvodu |
|---------------|--------------------|
| `ProductName` | `Name` |
| `Price` | `Price` |

`Price` je redovna cijena proizvoda. Ime u DTO-u nije `Name`, jer lista mora reći da je to cijena, a naziv ide u `ProductName`.

**Računa se, nema ga na entitetu**

Ova tri polja ne postoje ni na ponudi ni na proizvodu. Handler ih napravi preko `ProductOfferRules` iz odjeljka 7:

| Polje u DTO-u | Kako nastane |
|---------------|----------------|
| `State` | `ResolveState(IsEnabled, ValidUntilUtc, todayUtc)` |
| `StateLabel` | `StateLabel(State)` — tekst „Aktivna", „Istekla" ili „Isključena" |
| `DiscountedPrice` | `CalculateDiscountedPrice(Product.Price, DiscountPercent)` |

`using Market.Domain.Entities.Catalog` je tu samo zato što je `State` tipa `ProductOfferStateType`.

U DTO ne idu `CreatedAtUtc`, `ModifiedAtUtc`, `IsDeleted`, ni ostala polja proizvoda (`Description`, `StockQuantity`, `CategoryId`). Lista traži samo kolone iz zadatka. `CreatedAtUtc` se koristi za sort u handleru, ali se ne vraća klijentu.

### 8.4. Korak — Handler

Fajl: `ListProductOffersQueryHandler.cs`

**Šta uraditi**

1. Uzmi `todayUtc` jednom.
2. Kreni od `ctx.ProductOffers.AsNoTracking()`.
3. Ako `ProductId` ima vrijednost > 0, filtriraj.
4. Ako `OnlyActive == true`, filtriraj aktivne **u bazi prije Count/Skip**.
5. Sortiraj.
6. Page-aj.
7. Tek onda u memoriji izračunaj status i cijenu s popustom (`MidpointRounding.AwayFromZero` se ne prevodi pouzdano u SQL).

Za naziv i cijenu proizvoda joinaj `Product`. Najčišće: `.Include` nije potreban ako radiš `Select` sa `x.Product.Name` — ali cijenu s popustom računaj **nakon** `ToList`, ne u SQL `Select` sa `Math.Round(..., AwayFromZero)`.

Na ispitu nemoj gurati `Math.Round(..., AwayFromZero)` u SQL `Select` — to se često ne prevede. Uradi Count + Skip/Take, pa izračun u memoriji. Ovo je kod koji stvarno pišeš:

```csharp
using Market.Domain.Entities.Catalog;

namespace Market.Application.Modules.Catalog.ProductOffers.Queries.List;

public sealed class ListProductOffersQueryHandler(IAppDbContext ctx)
    : IRequestHandler<ListProductOffersQuery, PageResult<ListProductOffersQueryDto>>
{
    public async Task<PageResult<ListProductOffersQueryDto>> Handle(
        ListProductOffersQuery request,
        CancellationToken ct)
    {
        var todayUtc = DateTime.UtcNow.Date;

        var q = ctx.ProductOffers.AsNoTracking();

        if (request.ProductId is > 0)
            q = q.Where(x => x.ProductId == request.ProductId);

        if (request.OnlyActive == true)
        {
            q = q.Where(x => x.IsEnabled && x.ValidUntilUtc.Date >= todayUtc);
        }

        q = q
            .OrderByDescending(x => x.CreatedAtUtc)
            .ThenByDescending(x => x.Id);

        var total = await q.CountAsync(ct);

        var raw = await q
            .Skip(request.Paging.SkipCount)
            .Take(request.Paging.PageSize)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.ProductId,
                ProductName = x.Product!.Name,
                Price = x.Product.Price,
                x.DiscountPercent,
                x.ValidUntilUtc,
                x.IsEnabled
            })
            .ToListAsync(ct);

        var items = raw.Select(x =>
        {
            var state = ProductOfferRules.ResolveState(x.IsEnabled, x.ValidUntilUtc, todayUtc);

            return new ListProductOffersQueryDto
            {
                Id = x.Id,
                Code = x.Code,
                ProductId = x.ProductId,
                ProductName = x.ProductName,
                Price = x.Price,
                DiscountPercent = x.DiscountPercent,
                DiscountedPrice = ProductOfferRules.CalculateDiscountedPrice(x.Price, x.DiscountPercent),
                ValidUntilUtc = DateTime.SpecifyKind(x.ValidUntilUtc, DateTimeKind.Utc),
                State = state,
                StateLabel = ProductOfferRules.StateLabel(state),
                IsEnabled = x.IsEnabled
            };
        }).ToList();

        return new PageResult<ListProductOffersQueryDto>
        {
            Items = items,
            PageSize = request.Paging.PageSize,
            CurrentPage = request.Paging.Page,
            IncludedTotal = true,
            TotalItems = total,
            TotalPages = (int)Math.Ceiling(total / (double)request.Paging.PageSize)
        };
    }
}
```

`SkipCount` već postoji na `PageRequest`: `(Page - 1) * PageSize`.

### Zašto Count ide PRIJE Skip/Take

Ako prvo uzmeš 5 redova pa brojiš, `totalItems` će biti 5 umjesto stvarnog broja filtriranih. Paginator tad laže. Zadatak to ocjenjuje.

### Provjera

- Build prolazi.
- Endpoint još ne postoji dok ne dodaš controller — sljedeći dijelovi.

---

## 9. Backend — GetById (GET /ProductOffers/{id})

### Šta se traži

Uređivanje mora učitati ponudu po Id-u i popuniti formu.

Polja forme: `code`, `productId`, `discountPercent`, `validUntilUtc`, plus checkbox `isEnabled`.

Ako Id ne postoji ili je obrisan → **404**.

### Folder

`Market.Application/Modules/Catalog/ProductOffers/Queries/GetById/`

### Fajlovi

`GetProductOfferByIdQuery.cs`

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Queries.GetById;

public sealed class GetProductOfferByIdQuery : IRequest<GetProductOfferByIdQueryDto>
{
    public int Id { get; init; }
}
```

`GetProductOfferByIdQueryDto.cs`

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Queries.GetById;

public sealed class GetProductOfferByIdQueryDto
{
    public required int Id { get; init; }
    public required string Code { get; init; }
    public required int ProductId { get; init; }
    public required decimal DiscountPercent { get; init; }
    public required DateTime ValidUntilUtc { get; init; }
    public required bool IsEnabled { get; init; }
}
```

`GetProductOfferByIdQueryHandler.cs`

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Queries.GetById;

public sealed class GetProductOfferByIdQueryHandler(IAppDbContext ctx)
    : IRequestHandler<GetProductOfferByIdQuery, GetProductOfferByIdQueryDto>
{
    public async Task<GetProductOfferByIdQueryDto> Handle(
        GetProductOfferByIdQuery request,
        CancellationToken ct)
    {
        var dto = await ctx.ProductOffers
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .Select(x => new GetProductOfferByIdQueryDto
            {
                Id = x.Id,
                Code = x.Code,
                ProductId = x.ProductId,
                DiscountPercent = x.DiscountPercent,
                ValidUntilUtc = x.ValidUntilUtc,
                IsEnabled = x.IsEnabled
            })
            .FirstOrDefaultAsync(ct);

        if (dto is null)
            throw new MarketNotFoundException($"Ponuda (ID={request.Id}) nije pronađena.");

        return dto;
    }
}
```

### Provjera

- Nepostojeći Id kasnije u Swaggeru vraća 404.
- Obrisani Id također 404 (globalni filter).

---

## 10. Backend — Create (POST /ProductOffers)

### 10.1. Šta se traži

Body: `code`, `productId`, `discountPercent`, `validUntilUtc`.

Backend:

- trimuje `Code`
- postavlja `IsEnabled = true` (checkbox se na add formi **ne prikazuje**)
- `CreatedAtUtc` ide serverski (audit interceptor to već radi pri `SaveChanges`; ne šalji sa frontenda)
- vraća novi `Id`

### 10.2. Command

Folder: `Market.Application/Modules/Catalog/ProductOffers/Commands/Create/`

Fajl: `CreateProductOfferCommand.cs`

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Create;

public sealed class CreateProductOfferCommand : IRequest<int>
{
    public required string Code { get; init; }
    public required int ProductId { get; init; }
    public required decimal DiscountPercent { get; init; }
    public required DateTime ValidUntilUtc { get; init; }
}
```

Nema `IsEnabled` u commandu — zadatak kaže da ga backend postavlja na `true`.

### 10.3. Validator (HTTP 400)

Fajl: `CreateProductOfferCommandValidator.cs`

Pravila iz zadatka:

| Polje | Pravilo |
|-------|---------|
| Code | nakon Trim 5–20 znakova, počinje sa `OFF-` **case-sensitive** |
| ProductId | obavezan, `> 0` |
| DiscountPercent | obavezan, `0 < x <= 50`, najviše 2 decimale, **ne zaokruživati** |
| ValidUntilUtc | obavezan; uključena ponuda ne smije biti prije danas (create je uvijek uključen) |

Zaliha proizvoda **nije** uslov.

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Create;

public sealed class CreateProductOfferCommandValidator
    : AbstractValidator<CreateProductOfferCommand>
{
    public CreateProductOfferCommandValidator()
    {
        RuleFor(x => x.Code)
            .Cascade(CascadeMode.Stop)
            .Must(v => !string.IsNullOrWhiteSpace(v))
                .WithMessage("Oznaka je obavezna.")
            .Must(v =>
            {
                var t = v.Trim();
                return t.Length is >= 5 and <= 20;
            }).WithMessage("Oznaka mora imati 5 do 20 znakova.")
            .Must(v => v.Trim().StartsWith("OFF-", StringComparison.Ordinal))
                .WithMessage("Oznaka mora počinjati sa OFF-.");

        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Proizvod je obavezan.");

        RuleFor(x => x.DiscountPercent)
            .GreaterThan(0)
            .WithMessage("Popust mora biti veći od 0.")
            .LessThanOrEqualTo(50)
            .WithMessage("Popust ne smije biti veći od 50.")
            .Must(HasAtMostTwoDecimals)
            .WithMessage("Popust može imati najviše dvije decimale.");

        RuleFor(x => x.ValidUntilUtc)
            .Must(d => d != default)
            .WithMessage("Datum važenja je obavezan.")
            .Must(d => d.Date >= DateTime.UtcNow.Date)
            .WithMessage("Uključena ponuda ne smije imati datum prije današnjeg UTC datuma.");
    }

    private static bool HasAtMostTwoDecimals(decimal value)
    {
        return decimal.Round(value, 2, MidpointRounding.AwayFromZero) == value;
    }
}
```

`StartsWith(..., StringComparison.Ordinal)` je case-sensitive. `OFF-` prolazi, `off-` ne prolazi. To zadatak traži.

`HasAtMostTwoDecimals`: ako korisnik pošalje `10.125`, Round daje `10.13` što **nije jednako** originalu → validacija pada. Ne snimaš zaokruženu vrijednost.

### 10.4. Handler (HTTP 409 za poslovne konflikte)

Fajl: `CreateProductOfferCommandHandler.cs`

Redoslijed u handleru:

1. Trim koda.
2. Proizvod mora postojati (nije obrisan — filter to rješava). Ako ne postoji → 400 ili 404. Zadatak za nepostojeći zapis kaže 404, a za osnovnu validaciju 400. Ovaj slučaj je „proizvod ne postoji" → koristi `MarketNotFoundException` **ili** `ValidationException`. Sigurnije po tekstu: tretiraj kao validaciju proizvoda. U projektu `CreateOrder` za loš `productId` baca `ValidationException`. Radi isto da dobiješ 400.
3. Unique kod među neobrisanim, `ToLower` poređenje, u handleru, 409.
4. Jedna aktivna ponuda po proizvodu, 409.
5. Snimi.

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Create;

public sealed class CreateProductOfferCommandHandler(IAppDbContext ctx)
    : IRequestHandler<CreateProductOfferCommand, int>
{
    public async Task<int> Handle(CreateProductOfferCommand request, CancellationToken ct)
    {
        var todayUtc = DateTime.UtcNow.Date;
        var code = request.Code.Trim();

        var productExists = await ctx.Products
            .AnyAsync(p => p.Id == request.ProductId, ct);

        if (!productExists)
            throw new ValidationException("Proizvod ne postoji ili je obrisan.");

        var codeTaken = await ctx.ProductOffers.AnyAsync(
            x => x.Code.ToLower() == code.ToLower(),
            ct);

        if (codeTaken)
            throw new MarketConflictException("Oznaka ponude već postoji.");

        var hasActiveForProduct = await ctx.ProductOffers.AnyAsync(
            x => x.ProductId == request.ProductId
                 && x.IsEnabled
                 && x.ValidUntilUtc.Date >= todayUtc,
            ct);

        if (hasActiveForProduct)
        {
            throw new MarketConflictException(
                "Proizvod već ima aktivnu ponudu.");
        }

        var entity = new ProductOfferEntity
        {
            Code = code,
            ProductId = request.ProductId,
            DiscountPercent = request.DiscountPercent,
            ValidUntilUtc = request.ValidUntilUtc,
            IsEnabled = true
        };

        ctx.ProductOffers.Add(entity);
        await ctx.SaveChangesAsync(ct);

        return entity.Id;
    }
}
```

Ne stavljaj unique index u EF. Zadatak to zabranjuje.

`CreatedAtUtc` ne postavljaj ručno osim ako želiš biti eksplicitna — interceptor ga ionako postavi pri `Added`.

### Provjera (Swagger, kad dodaš controller)

- Validan POST → 201 i novi Id, `IsEnabled=true`.
- `off-ABC` → 400 (prefix case-sensitive).
- `OFF-` (4 znaka) → 400.
- `10.125` popust → 400.
- Dupli kod `off-001` vs `OFF-001` → 409.
- Druga aktivna na isti proizvod → 409.
- Istekla uključena na isti proizvod **ne** blokira.

---

## 11. Backend — Update (PUT /ProductOffers/{id})

### 11.1. Šta se traži

- Učitaj postojeći zapis.
- Sva polja su uređiva, uključujući `IsEnabled`.
- Nema posebnog statusnog endpointa.
- Unique kod i „jedna aktivna" **izuzimaju trenutni Id**.
- Ako je **konačno** `IsEnabled=true`: datum mora biti danas ili kasnije **i** ne smije postojati druga aktivna ponuda konačno odabranog proizvoda.
- Ako je **konačno** `IsEnabled=false`: prošli datum je dozvoljen (tako istekla može da se isključi bez produžavanja datuma).
- Isključena se može ponovo uključiti tek kad zadovolji sva pravila.
- Mijenja se postojeći zapis; `CreatedAtUtc` se **ne** postavlja ponovo.
- Ne postoji job koji automatski ističe ponude.

### 11.2. Command

Folder: `.../Commands/Update/`

Fajl: `UpdateProductOfferCommand.cs`

Id dolazi iz rute, ne iz bodyja — isti trik kao kategorije: `[JsonIgnore]`.

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Update;

public sealed class UpdateProductOfferCommand : IRequest<Unit>
{
    [JsonIgnore]
    public int Id { get; set; }

    public required string Code { get; init; }
    public required int ProductId { get; init; }
    public required decimal DiscountPercent { get; init; }
    public required DateTime ValidUntilUtc { get; init; }
    public required bool IsEnabled { get; init; }
}
```

### 11.3. Validator

Fajl: `UpdateProductOfferCommandValidator.cs`

Ista pravila za Code, ProductId, DiscountPercent.

Datum **zavisi od konačnog `IsEnabled`**:

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Update;

public sealed class UpdateProductOfferCommandValidator
    : AbstractValidator<UpdateProductOfferCommand>
{
    public UpdateProductOfferCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);

        RuleFor(x => x.Code)
            .Cascade(CascadeMode.Stop)
            .Must(v => !string.IsNullOrWhiteSpace(v))
                .WithMessage("Oznaka je obavezna.")
            .Must(v =>
            {
                var t = v.Trim();
                return t.Length is >= 5 and <= 20;
            }).WithMessage("Oznaka mora imati 5 do 20 znakova.")
            .Must(v => v.Trim().StartsWith("OFF-", StringComparison.Ordinal))
                .WithMessage("Oznaka mora počinjati sa OFF-.");

        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Proizvod je obavezan.");

        RuleFor(x => x.DiscountPercent)
            .GreaterThan(0)
            .WithMessage("Popust mora biti veći od 0.")
            .LessThanOrEqualTo(50)
            .WithMessage("Popust ne smije biti veći od 50.")
            .Must(v => decimal.Round(v, 2, MidpointRounding.AwayFromZero) == v)
            .WithMessage("Popust može imati najviše dvije decimale.");

        RuleFor(x => x.ValidUntilUtc)
            .Must(d => d != default)
            .WithMessage("Datum važenja je obavezan.");

        RuleFor(x => x)
            .Must(x => !x.IsEnabled || x.ValidUntilUtc.Date >= DateTime.UtcNow.Date)
            .WithMessage("Uključena ponuda ne smije imati datum prije današnjeg UTC datuma.");
    }
}
```

### 11.4. Handler

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Update;

public sealed class UpdateProductOfferCommandHandler(IAppDbContext ctx)
    : IRequestHandler<UpdateProductOfferCommand, Unit>
{
    public async Task<Unit> Handle(UpdateProductOfferCommand request, CancellationToken ct)
    {
        var todayUtc = DateTime.UtcNow.Date;
        var code = request.Code.Trim();

        var entity = await ctx.ProductOffers
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct);

        if (entity is null)
            throw new MarketNotFoundException($"Ponuda (ID={request.Id}) nije pronađena.");

        var productExists = await ctx.Products
            .AnyAsync(p => p.Id == request.ProductId, ct);

        if (!productExists)
            throw new ValidationException("Proizvod ne postoji ili je obrisan.");

        var codeTaken = await ctx.ProductOffers.AnyAsync(
            x => x.Id != request.Id && x.Code.ToLower() == code.ToLower(),
            ct);

        if (codeTaken)
            throw new MarketConflictException("Oznaka ponude već postoji.");

        var wouldBeActive = ProductOfferRules.IsActive(
            request.IsEnabled,
            request.ValidUntilUtc,
            todayUtc);

        if (wouldBeActive)
        {
            var otherActive = await ctx.ProductOffers.AnyAsync(
                x => x.Id != request.Id
                     && x.ProductId == request.ProductId
                     && x.IsEnabled
                     && x.ValidUntilUtc.Date >= todayUtc,
                ct);

            if (otherActive)
            {
                throw new MarketConflictException(
                    "Proizvod već ima aktivnu ponudu.");
            }
        }

        entity.Code = code;
        entity.ProductId = request.ProductId;
        entity.DiscountPercent = request.DiscountPercent;
        entity.ValidUntilUtc = request.ValidUntilUtc;
        entity.IsEnabled = request.IsEnabled;
        // CreatedAtUtc NE DIRATI

        await ctx.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
```

Zašto unique i active gledaju `x.Id != request.Id`: inače bi edit istog zapisa sam sebi pravio 409.

### Provjera

- Edit iste oznake na istom Id-u prolazi.
- Promjena na tuđu oznaku → 409.
- Isključi isteklu bez mijenjanja datuma → 200/204.
- Ponovo uključi sa starim datumom → 400.
- Promijeni proizvod na onaj koji već ima aktivnu, uz `IsEnabled=true` → 409.

---

## 12. Backend — Delete (DELETE /ProductOffers/{id})

### Šta se traži

- Dozvoljeno **samo** ako je `IsEnabled=false`.
- Istekla **uključena** se prvo mora isključiti. Sam istek **ne** daje pravo brisanja.
- Zabranjeni zahtjev → **409**, zapis se ne mijenja.
- Dozvoljeno → soft delete (`IsDeleted=true`).
- Nema restore.
- Nepostojeći ili već obrisani Id → **404**.

### Folder

`.../Commands/Delete/`

`DeleteProductOfferCommand.cs`

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Delete;

public sealed class DeleteProductOfferCommand : IRequest<Unit>
{
    public required int Id { get; init; }
}
```

`DeleteProductOfferCommandHandler.cs`

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Delete;

public sealed class DeleteProductOfferCommandHandler(IAppDbContext ctx)
    : IRequestHandler<DeleteProductOfferCommand, Unit>
{
    public async Task<Unit> Handle(DeleteProductOfferCommand request, CancellationToken ct)
    {
        var entity = await ctx.ProductOffers
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct);

        if (entity is null)
            throw new MarketNotFoundException($"Ponuda (ID={request.Id}) nije pronađena.");

        if (entity.IsEnabled)
        {
            throw new MarketConflictException(
                "Uključena ponuda se ne može obrisati. Prvo je isključite.");
        }

        ctx.ProductOffers.Remove(entity);
        await ctx.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
```

`Remove` + interceptor = soft delete. Ne radi `ctx.ProductOffers.HardDelete`.

### Provjera

- Delete `IsEnabled=true` → 409, red i dalje postoji u listi.
- Delete `IsEnabled=false` → 204, nestaje iz liste.
- Isti kod se smije ponovo kreirati.

---

## 13. Backend — Controller

### Šta treba napraviti

U folderu `Market.API/Controllers` kreirati fajl:

`ProductOffersController.cs`

Koristi **isti obrazac** kao `InventoryCountsController` / `ProductCategoriesController`.

Policy: **Staff** (kao `ExamProducts` i `InventoryCounts`), da admin/manager/employee mogu ući iz Angular admin panela. Ne stavi `AdminOnly` jer employee tad dobije 403.

```csharp
using Market.Application.Modules.Catalog.ProductOffers.Commands.Create;
using Market.Application.Modules.Catalog.ProductOffers.Commands.Delete;
using Market.Application.Modules.Catalog.ProductOffers.Commands.Update;
using Market.Application.Modules.Catalog.ProductOffers.Queries.GetById;
using Market.Application.Modules.Catalog.ProductOffers.Queries.List;

namespace Market.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Policy = "Staff")]
public sealed class ProductOffersController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<PageResult<ListProductOffersQueryDto>> List(
        [FromQuery] ListProductOffersQuery query,
        CancellationToken ct)
    {
        return await sender.Send(query, ct);
    }

    [HttpGet("{id:int}")]
    public async Task<GetProductOfferByIdQueryDto> GetById(int id, CancellationToken ct)
    {
        return await sender.Send(new GetProductOfferByIdQuery { Id = id }, ct);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(
        CreateProductOfferCommand command,
        CancellationToken ct)
    {
        var id = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task Update(
        int id,
        UpdateProductOfferCommand command,
        CancellationToken ct)
    {
        command.Id = id;
        await sender.Send(command, ct);
    }

    [HttpDelete("{id:int}")]
    public async Task Delete(int id, CancellationToken ct)
    {
        await sender.Send(new DeleteProductOfferCommand { Id = id }, ct);
    }
}
```

MediatR skenira assembly automatski — **ne** registruješ handlere ručno.

### Provjera

- Build.
- Swagger pokazuje tag `ProductOffers` sa GET list, GET id, POST, PUT, DELETE.

---

## 14. Provjera backenda u Swaggeru

1. Pokreni API.
2. Authorize: prvo `POST /Auth/login` sa `admin@market.local` / `Admin123!` (ili dummy `string`/`string` ako vaš Auth to prihvata).
3. Ubaci JWT u Swagger Authorize.

Test scenariji:

| Test | Očekivano |
|------|-----------|
| `GET /ProductOffers?paging.page=1&paging.pageSize=5` | 5 redova, `totalItems` ≥ 12 (seed), sort noviji prvi |
| Svaki red ima `stateLabel` i `discountedPrice` | npr. 20 i 10% → 18.00 |
| `onlyActive=true` | samo Aktivna |
| `productId={id Tastature}` | samo ponude tog proizvoda |
| oba filtera | AND |
| POST validan `OFF-TEST1`, datum sutra, popust 10, productId postojećeg | 201 |
| POST isti kod drugim case-om | 409 |
| POST druga aktivna na isti proizvod | 409 |
| PUT `isEnabled=false` | 204 |
| DELETE dok je uključena | 409 |
| DELETE kad je isključena | 204 |
| GET obrisanog Id | 404 |

Ako ovo ne radi, **ne idi na frontend**.

---

## 15. Frontend — API modeli i servis

### 15.1. Modeli

Otvori postojeći fajl:

`rs1-frontend-2025-26/src/app/api-services/product-offers/product-offers-api.models.ts`

Već ima enum i labele. **Dopuni ga**, ne pravi drugi fajl.

```typescript
import { BasePagedQuery } from '../../core/models/paging/base-paged-query';
import { PageResult } from '../../core/models/paging/page-result';

export enum ProductOfferStateType {
  Aktivna = 1,
  Istekla = 2,
  Iskljucena = 3,
}

export const PRODUCT_OFFER_STATE_LABELS: Record<ProductOfferStateType, string> = {
  [ProductOfferStateType.Aktivna]: 'Aktivna',
  [ProductOfferStateType.Istekla]: 'Istekla',
  [ProductOfferStateType.Iskljucena]: 'Isključena',
};

export class ListProductOffersRequest extends BasePagedQuery {
  productId?: number | null;
  onlyActive?: boolean | null;
}

export interface ListProductOffersQueryDto {
  id: number;
  code: string;
  productId: number;
  productName: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  validUntilUtc: string;
  state: ProductOfferStateType;
  stateLabel: string;
  isEnabled: boolean;
}

export type ListProductOffersResponse = PageResult<ListProductOffersQueryDto>;

export interface GetProductOfferByIdQueryDto {
  id: number;
  code: string;
  productId: number;
  discountPercent: number;
  validUntilUtc: string;
  isEnabled: boolean;
}

export interface CreateProductOfferCommand {
  code: string;
  productId: number;
  discountPercent: number;
  validUntilUtc: string;
}

export interface UpdateProductOfferCommand {
  code: string;
  productId: number;
  discountPercent: number;
  validUntilUtc: string;
  isEnabled: boolean;
}
```

Imena propertyja moraju biti **camelCase** jer ASP.NET serijalizuje tako. Ako napišeš `ProductName` na frontendu, tabela ostaje prazna.

### 15.2. Servis

Kreirati novi fajl pored modela:

`product-offers-api.service.ts`

Kopiraj obrazac iz `product-categories-api.service.ts` i `inventory-counts-api.service.ts`.

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from '../../core/models/build-http-params';
import {
  CreateProductOfferCommand,
  GetProductOfferByIdQueryDto,
  ListProductOffersRequest,
  ListProductOffersResponse,
  UpdateProductOfferCommand,
} from './product-offers-api.models';

@Injectable({ providedIn: 'root' })
export class ProductOffersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ProductOffers`;

  list(request: ListProductOffersRequest): Observable<ListProductOffersResponse> {
    return this.http.get<ListProductOffersResponse>(this.baseUrl, {
      params: buildHttpParams(request as any),
    });
  }

  getById(id: number): Observable<GetProductOfferByIdQueryDto> {
    return this.http.get<GetProductOfferByIdQueryDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateProductOfferCommand): Observable<{ id: number } | number> {
    return this.http.post<{ id: number } | number>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateProductOfferCommand): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

`buildHttpParams` pretvara `{ paging: { page: 1, pageSize: 5 } }` u `paging.page=1&paging.pageSize=5`. To zadatak eksplicitno traži.

`create` na backendu vraća `{ id: ... }` zbog `CreatedAtAction(..., new { id })`. Ako trebaš samo broj, uzmi `res.id`.

### Provjera

- Nema crvenih linija u TS.
- Servis ne treba ručno u `providers` — `providedIn: 'root'`.

---

## 16. Frontend — Lista, filteri, paginacija, brisanje

### 16.1. Šta template trenutno radi pogrešno

Fajl: `src/app/modules/admin/catalogs/product-offers/product-offers.component.ts`

- `rows` su demo.
- `products` je prazan niz → dropdown filter je prazan.
- `filtersChanged()` je prazna.
- `delete()` je prazan.
- HTML paginator: `[length]="12"` hardkodirano.
- Filter `mat-select` nema `ngModel` / `formControl`.

HTML **ne prepisuj od nule**. Spoji podatke na postojeće kolone.

### 16.2. HTML — šta minimalno dopuniti

Fajl: `product-offers.component.html`

1. Poveži filtere.
2. Tabela neka koristi `rows` (ili `items`) iz API-ja.
3. Kolona proizvoda: `row.productName` (ne `row.product`).
4. Popust i cijena s popustom iz DTO-a.
5. Datum: `dd.MM.yyyy` uz UTC da se dan ne pomjeri.
6. Paginator: `length`, `pageSize`, `pageIndex`, `(page)`.

Primjer izmjena na filterima i paginatoru (ostatak tabele ostaje, samo popravi bindinge):

```html
<section class="exam-page">
  <header>
    <h1>Promotivne ponude</h1>
    <button mat-flat-button color="primary" (click)="add()">
      <mat-icon>add</mat-icon>Nova ponuda
    </button>
  </header>

  <div class="filters">
    <mat-form-field appearance="outline">
      <mat-label>Proizvod</mat-label>
      <mat-select [(ngModel)]="productId" (selectionChange)="filtersChanged()">
        <mat-option [value]="null">Svi proizvodi</mat-option>
        @for (product of products; track product.id) {
          <mat-option [value]="product.id">{{ product.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    <mat-checkbox [(ngModel)]="onlyActive" (change)="filtersChanged()">
      Samo aktivne
    </mat-checkbox>
  </div>

  <div class="table-wrap">
    <table mat-table [dataSource]="rows">
      <ng-container matColumnDef="code">
        <th mat-header-cell *matHeaderCellDef>Oznaka</th>
        <td mat-cell *matCellDef="let row">{{ row.code }}</td>
      </ng-container>

      <ng-container matColumnDef="product">
        <th mat-header-cell *matHeaderCellDef>Proizvod</th>
        <td mat-cell *matCellDef="let row">{{ row.productName }}</td>
      </ng-container>

      <ng-container matColumnDef="price">
        <th mat-header-cell *matHeaderCellDef>Redovna cijena</th>
        <td mat-cell *matCellDef="let row">{{ row.price | number:'1.2-2' }}</td>
      </ng-container>

      <ng-container matColumnDef="discount">
        <th mat-header-cell *matHeaderCellDef>Popust</th>
        <td mat-cell *matCellDef="let row">{{ row.discountPercent }}%</td>
      </ng-container>

      <ng-container matColumnDef="discounted">
        <th mat-header-cell *matHeaderCellDef>Cijena s popustom</th>
        <td mat-cell *matCellDef="let row">{{ row.discountedPrice | number:'1.2-2' }}</td>
      </ng-container>

      <ng-container matColumnDef="validUntil">
        <th mat-header-cell *matHeaderCellDef>Vazi do</th>
        <td mat-cell *matCellDef="let row">{{ row.validUntilUtc | date:'dd.MM.yyyy':'UTC' }}</td>
      </ng-container>

      <ng-container matColumnDef="state">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let row"><span class="status">{{ row.stateLabel }}</span></td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Akcije</th>
        <td mat-cell *matCellDef="let row">
          <button mat-icon-button title="Uredi" (click)="edit(row.id)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button title="Obrisi" [disabled]="row.isEnabled" (click)="delete(row)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
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

Zašto `'UTC'` u date pipe: seed i backend šalju UTC ponoć. Bez UTC-a, u BiH (UTC+2) datum može pasti na prethodni dan.

Dugme Obriši: `[disabled]="row.isEnabled"` već je bilo u templateu — **ostavi**. To je FE guard. BE i dalje mora ponoviti provjeru.

### 16.3. Component TS

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ExamProductsApiService } from '../../../../api-services/exam-products/exam-products-api.service';
import { ExamProductLookupItem } from '../../../../api-services/exam-products/exam-products-api.models';
import { ProductOffersApiService } from '../../../../api-services/product-offers/product-offers-api.service';
import {
  ListProductOffersQueryDto,
  ListProductOffersRequest,
} from '../../../../api-services/product-offers/product-offers-api.models';
import { ToasterService } from '../../../../core/services/toaster.service';
import { getErrorMessage } from '../../../../core/interceptors/error-logging-interceptor.service';
import { DialogHelperService } from '../../../shared/services/dialog-helper.service';
import { DialogButton, DialogType } from '../../../shared/models/dialog-config.model';

@Component({
  selector: 'app-product-offers',
  standalone: false,
  templateUrl: './product-offers.component.html',
  styleUrl: './product-offers.component.scss',
})
export class ProductOffersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ProductOffersApiService);
  private readonly productsApi = inject(ExamProductsApiService);
  private readonly toaster = inject(ToasterService);
  private readonly dialog = inject(DialogHelperService);

  readonly displayedColumns = [
    'code', 'product', 'price', 'discount', 'discounted', 'validUntil', 'state', 'actions',
  ];

  products: ExamProductLookupItem[] = [];
  rows: ListProductOffersQueryDto[] = [];

  productId: number | null = null;
  onlyActive = false;
  page = 1;
  pageSize = 5;
  totalItems = 0;

  ngOnInit(): void {
    this.loadProducts();
    this.load();
  }

  add(): void {
    this.router.navigate(['/admin/product-offers/add']);
  }

  edit(id: number): void {
    this.router.navigate(['/admin/product-offers/edit', id]);
  }

  filtersChanged(): void {
    this.page = 1;
    this.load();
  }

  onPage(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  delete(row: ListProductOffersQueryDto): void {
    if (row.isEnabled) {
      return;
    }

    this.dialog.open({
      type: DialogType.WARNING,
      title: 'Potvrda brisanja',
      message: `Da li želite obrisati ponudu ${row.code}?`,
      icon: 'delete_forever',
      buttons: [
        { type: DialogButton.CANCEL },
        { type: DialogButton.DELETE, color: 'warn' },
      ],
    }).subscribe(result => {
      if (!result || result.button !== DialogButton.DELETE) {
        return;
      }

      this.api.delete(row.id).subscribe({
        next: () => {
          this.toaster.success('Ponuda je obrisana.');
          this.page = 1;
          this.load();
        },
        error: (err) => this.toaster.error(getErrorMessage(err)),
      });
    });
  }

  private loadProducts(): void {
    this.productsApi.lookup().subscribe({
      next: (items) => (this.products = items),
      error: (err) => this.toaster.error(getErrorMessage(err)),
    });
  }

  private load(): void {
    const request = new ListProductOffersRequest();
    request.paging.page = this.page;
    request.paging.pageSize = this.pageSize;
    request.productId = this.productId;
    request.onlyActive = this.onlyActive ? true : null;

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

Zašto `onlyActive ? true : null`: `buildHttpParams` preskače `null`. Kad checkbox nije uključen, ne šalješ filter i backend prikazuje sva tri statusa.

Zašto `page = 1` pri filteru **i** nakon delete: zadatak to traži.

Modal: `DialogHelperService.confirmDelete` koristi i18n ključeve. Zadatak traži tačan tekst sa `{Code}` — zato `dialog.open` sa `message:` (plain text). Odustajanje (`CANCEL`) **ne** zove API.

### Provjera

- Demo redovi nestaju, vidiš seed ponude.
- Dropdown ima Tastatura, Mis, Monitor...
- Samo aktivne smanjuje listu.
- Promjena filtera vraća na stranicu 1.
- Paginator: 5/10, total je broj **filtriranih**, ne cijele tabele.
- Obriši na uključenoj je disabled.
- Obriši na isključenoj: modal → Cancel ništa ne radi; Delete skine red i toast.

---

## 17. Frontend — Dodavanje (Reactive Forms)

### 17.1. Šta forma sadrži

Oznaka, proizvod, popust, datum. **Nema** checkboxa uključenosti.

Ako lokalna validacija ne prolazi, **Sačuvaj je disabled**.

Nakon uspjeha: toast + navigacija na listu.

Nakon greške: toast + **ostani na formi** (sačuvaj unesene vrijednosti). Ne resetuj formu u `error`.

### 17.2. Custom validatori

U isti TS fajl komponente (nema potrebe za novim servisom ako nemaš vremena).

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

function offerCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (!value.trim()) {
      return { required: true };
    }
    const trimmed = value.trim();
    if (trimmed.length < 5 || trimmed.length > 20) {
      return { codeLength: true };
    }
    if (!trimmed.startsWith('OFF-')) {
      return { codePrefix: true };
    }
    return null;
  };
}

function twoDecimalPlacesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const text = String(value);
    const match = text.match(/^\d+(\.\d{1,2})?$/);
    if (!match) {
      return { twoDecimals: true };
    }
    return null;
  };
}
```

Zašto regex umjesto `value * 100 % 1`: JS `number` nije decimal. `10.10` i `10.1` su OK; `10.125` nije.

### 17.3. Component TS

Fajl: `product-offer-add.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamProductsApiService } from '../../../../../api-services/exam-products/exam-products-api.service';
import { ExamProductLookupItem } from '../../../../../api-services/exam-products/exam-products-api.models';
import { ProductOffersApiService } from '../../../../../api-services/product-offers/product-offers-api.service';
import { ToasterService } from '../../../../../core/services/toaster.service';
import { getErrorMessage } from '../../../../../core/interceptors/error-logging-interceptor.service';

@Component({
  selector: 'app-product-offer-add',
  standalone: false,
  templateUrl: './product-offer-add.component.html',
  styleUrl: './product-offer-add.component.scss',
})
export class ProductOfferAddComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(ProductOffersApiService);
  private readonly productsApi = inject(ExamProductsApiService);
  private readonly toaster = inject(ToasterService);

  products: ExamProductLookupItem[] = [];
  isSaving = false;

  readonly form = this.fb.group({
    code: ['', [offerCodeValidator()]],
    productId: [null as number | null, [Validators.required, Validators.min(1)]],
    discountPercent: [null as number | null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(50),
      twoDecimalPlacesValidator(),
    ]],
    validUntilUtc: [null as Date | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.productsApi.lookup().subscribe({
      next: (items) => (this.products = items),
      error: (err) => this.toaster.error(getErrorMessage(err)),
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/product-offers']);
  }

  save(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.isSaving = true;

    this.api.create({
      code: (raw.code ?? '').trim(),
      productId: raw.productId!,
      discountPercent: Number(raw.discountPercent),
      validUntilUtc: toUtcDateOnly(raw.validUntilUtc!),
    }).subscribe({
      next: () => {
        this.toaster.success('Ponuda je snimljena.');
        this.router.navigate(['/admin/product-offers']);
      },
      error: (err) => {
        this.isSaving = false;
        this.toaster.error(getErrorMessage(err));
      },
    });
  }

  errorText(name: string): string {
    const c = this.form.get(name);
    if (!c || !c.errors || !(c.touched || c.dirty)) {
      return '';
    }
    if (c.errors['required'] || c.errors['min']) return 'Polje je obavezno.';
    if (c.errors['codeLength']) return 'Oznaka mora imati 5 do 20 znakova.';
    if (c.errors['codePrefix']) return 'Oznaka mora počinjati sa OFF-.';
    if (c.errors['max']) return 'Popust ne smije biti veći od 50.';
    if (c.errors['twoDecimals']) return 'Popust može imati najviše dvije decimale.';
    return 'Neispravna vrijednost.';
  }
}

function toUtcDateOnly(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
}

function offerCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (!value.trim()) return { required: true };
    const trimmed = value.trim();
    if (trimmed.length < 5 || trimmed.length > 20) return { codeLength: true };
    if (!trimmed.startsWith('OFF-')) return { codePrefix: true };
    return null;
  };
}

function twoDecimalPlacesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;
    return /^\d+(\.\d{1,2})?$/.test(String(value)) ? null : { twoDecimals: true };
  };
}
```

`toUtcDateOnly` je bitan: datepicker daje lokalni datum. Ako pošalješ `2026-09-20T22:00:00.000Z` zbog timezone-a, backend `.Date` može pasti na 21.09. ili 19.09.

### 17.4. HTML — validacija i disabled Sačuvaj

U postojećoj formi dodaj:

- `mat-error` poruke
- `[disabled]="form.invalid || isSaving"` na Sačuvaj

```html
<button mat-flat-button color="primary" type="button"
        [disabled]="form.invalid || isSaving"
        (click)="save()">
  Sacuvaj
</button>
```

Ispod inputa oznake npr.:

```html
<mat-error>{{ errorText('code') }}</mat-error>
```

Proizvodi se pune iz `products` koje sada dolaze sa `lookup()`.

### Provjera

- Prazna forma: Sačuvaj disabled.
- `off-ABCDE`: greška prefixa.
- `OFF-1`: prekratko.
- popust `0`: greška.
- popust `50`: OK; `50.01`: greška.
- popust `10.125`: greška.
- uspjeh → lista + nova ponuda + toast.
- 409 (dupli kod) → ostaješ na formi, vrijednosti ostaju, toast pokaže backend poruku.

---

## 18. Frontend — Uređivanje

Ista četiri polja **plus** checkbox `Uključena`.

### 18.1. Učitavanje po ruti

Ruta već postoji: `product-offers/edit/:id`.

```typescript
import { ActivatedRoute } from '@angular/router';

private readonly route = inject(ActivatedRoute);

ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));
  this.loadProducts();
  this.api.getById(id).subscribe({
    next: (dto) => {
      this.form.patchValue({
        code: dto.code,
        productId: dto.productId,
        discountPercent: dto.discountPercent,
        validUntilUtc: new Date(dto.validUntilUtc),
        isEnabled: dto.isEnabled,
      });
    },
    error: (err) => this.toaster.error(getErrorMessage(err)),
  });
}
```

Forma već u templateu ima `isEnabled`. U TS-u je već bilo:

```typescript
readonly form = this.fb.group({
  code: [''],
  productId: [null as number | null],
  discountPercent: [null as number | null],
  validUntilUtc: [null as Date | null],
  isEnabled: [false],
});
```

Stavi **iste validatore** kao na add, plus:

- datum u prošlosti je dozvoljen **samo ako** `isEnabled` je false
- to možeš FE-om dodatno pokriti custom validatorom na grupi; backend ionako presudi

Jednostavan group validator:

```typescript
function enabledDateValidator(group: AbstractControl): ValidationErrors | null {
  const enabled = group.get('isEnabled')?.value;
  const date = group.get('validUntilUtc')?.value as Date | null;
  if (!enabled || !date) return null;
  const today = new Date();
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const utcValue = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return utcValue < utcToday ? { pastDateWhileEnabled: true } : null;
}
```

Dodaj ga: `this.fb.group({ ... }, { validators: [enabledDateValidator] })`.

`save()` zove `api.update(id, { ..., isEnabled: raw.isEnabled })`.

Uspjeh → lista. Greška → ostani, ne resetuj.

### Provjera

- Otvori Uredi: polja popunjena, checkbox odgovara seedu.
- Isključi isteklu, snimi, na listi status Isključena.
- Obriši sada radi.
- Ponovo uključi sa starim datumom: FE ili BE ne da; toast.

---

## 19. Toast, interceptor i tok nakon akcija

Zadatak je strog:

> Interceptor samo loguje i prosljeđuje grešku; ne prikazuje toast automatski.

Fajl `error-logging-interceptor.service.ts` to već radi. **Ne** dodaji toast u interceptor.

U komponenti:

```typescript
this.toaster.success('...');
this.toaster.error(getErrorMessage(err));
```

`getErrorMessage` čita `error.error.message` koje backend stavlja za 409/404.

Tok:

| Akcija | Uspjeh | Greška |
|--------|--------|--------|
| Create | lista | ostani na formi |
| Update | lista | ostani na formi |
| Delete | prva stranica liste, isti filteri | ostani na listi, toast |
| List load | prikaz | toast |

---

## 20. Najčešće greške

1. **Računaš status/cijenu na frontendu** — gubiš 10 bodova.
2. **Nova migracija / unique index** — zadatak zabranjuje.
3. **Filteri nakon paginacije** — total je pogrešan.
4. **`onlyActive` filter po `IsEnabled` umjesto po izvedenom statusu** — istekla uključena nije aktivna.
5. **Unique kod bez `ToLower` / bez exclude Id** — false 409 na editu.
6. **Jedna aktivna: blokiraš i istekle** — zadatak kaže da istekla ne blokira.
7. **Delete istekle uključene** — mora 409.
8. **Toast u interceptoru** — zadatak kaže ne.
9. **Demo redovi ostaju** — ocjenjivač vidi lažne podatke.
10. **`CreatedAtUtc` reset na update** — ne diraj to polje.
11. **Sačuvaj nije disabled** dok je forma invalid.
12. **Modal tekst nije sa `{Code}`**.
13. **Paging query string** `page=1` umjesto `paging.page=1`.
14. **Nisi ulogovana** — 401 na sve ProductOffers pozive.
15. **JS zaokruživanje popusta** umjesto odbijanja treće decimale.

---

## 21. Checklista prije predaje

Backend

- [ ] Nema nove migracije
- [ ] Entitet nije mijenjan
- [ ] CQRS: List, GetById, Create, Update, Delete
- [ ] Controller Staff
- [ ] Status redoslijed: Isključena → Istekla → Aktivna
- [ ] Cijena `AwayFromZero`, 2 decimale, za sve statuse
- [ ] Filteri na BE prije Count
- [ ] Sort CreatedAtUtc desc, Id desc
- [ ] Code Trim, 5–20, `OFF-` case-sensitive
- [ ] Unique u handleru, 409
- [ ] Jedna aktivna po proizvodu, 409, exclude Id
- [ ] Create `IsEnabled=true`
- [ ] Update čuva `CreatedAtUtc`
- [ ] Delete samo `IsEnabled=false`, inače 409
- [ ] Soft delete
- [ ] 404 za nepostojeći/obrisani Id

Frontend

- [ ] Nema demo redova
- [ ] Lookup proizvoda u filteru i formama
- [ ] Paginacija 5/10, total filtriranog skupa
- [ ] Filteri AND, reset na stranicu 1
- [ ] Cijene `1.2-2`, datum `dd.MM.yyyy`
- [ ] Reactive Forms add + edit
- [ ] Sačuvaj disabled dok je invalid
- [ ] Lokalne poruke + toast backend greške
- [ ] Modal tačan tekst, Cancel ne šalje DELETE
- [ ] Obriši disabled za uključene
- [ ] Uspjeh → lista, greška → ostanak
- [ ] Interceptor bez toasta

Upload

- [ ] `IB00000_novi-angular.rar`
- [ ] `IB00000_novi -api.rar` (ime iz PDF-a)

---

## 22. Šta je nejasno iz zadatka

Ovo **nije** bilo 100% specificirano u PDF-u. Zaključeno iz templatea i postojećih obrazaca, nije izmišljeno novo pravilo:

| Nejasnoća | Kako je riješeno |
|-----------|------------------|
| Tačan tekst 409 poruka | Zadatak traži „razumljivu poruku". Piši jasno na bosanskom. |
| Da li List DTO vraća enum + label ili samo string | Template ima `state` i `stateLabel` — vrati oba. |
| HTTP kod kad proizvod ne postoji na create | Osnovna validacija 400; `ValidationException` kao kod Order. |
| Ime JSON polja cijene s popustom | `discountedPrice` (camelCase), usklađeno sa FE. |
| Create response `{ id }` vs raw int | `CreatedAtAction` obrazac iz kategorija. |
| Policy AdminOnly vs Staff | Staff, jer exam endpointi već koriste Staff. |
| Da li FE mora sam validirati unique | Ne. „Ne zahtijeva se poseban frontend endpoint za provjeru." |

Ako na papiru vidiš drugačiji naziv kolone od templatea, **mjerodavan je tekst zadatka**, a HTML smiješ samo spojiti na ta polja.
