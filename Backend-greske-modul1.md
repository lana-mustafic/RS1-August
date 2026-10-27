# Backend greške — Modul 1 (Promotivne ponude)

Samo backend. Kod ispod je ono što sada stoji u projektu i ono što treba da stoji umjesto toga.

Status, cijena s popustom, unique kod, create (`IsEnabled = true`, trim, serverski `CreatedAtUtc`), pravilo datuma na update-u i delete guard su u redu. Ovdje su samo greške.

---

## 1. Lista zove upit za kategorije

**Fajl:** `rs1_backend-2025-26/Market.API/Controllers/ProductOffersController.cs`

`GET /ProductOffers` šalje `ListProductCategoriesQuery`. Odgovor su kategorije. `productId` i `onlyActive` se ignorišu. Handler ponuda se ne izvrši.

**Sad stoji (using, linija 1):**

```csharp
using Market.Application.Modules.Catalog.ProductCategories.Queries.List;
```

**Treba:**

```csharp
using Market.Application.Modules.Catalog.ProductOffers.Queries.List;
```

**Sad stoji (List, linije 47–53):**

```csharp
[HttpGet]
[AllowAnonymous]
public async Task<PageResult<ListProductCategoriesQueryDto>> List([FromQuery] ListProductCategoriesQuery query, CancellationToken ct)
{
    var result = await sender.Send(query, ct);
    return result;
}
```

**Treba:**

```csharp
[HttpGet]
public async Task<PageResult<ListProductOfferQueryDto>> List([FromQuery] ListProductOfferQuery query, CancellationToken ct)
{
    var result = await sender.Send(query, ct);
    return result;
}
```

Skini i `[AllowAnonymous]` sa `GetById` (linije 39–40). Oba GET-a treba da ostanu pod policy kontrolera.

---

## 2. Paginacija preskače broj stranice, ne broj redova

**Fajl:** `rs1_backend-2025-26/Market.Application/Modules/Catalog/ProductOffers/Queries/List/ListProductOfferQueryHandler.cs`

`Page` je 1, 2, 3. `SkipCount` je `(Page - 1) * PageSize`. Stranica 1 sad preskoči 1 red. Stranica 2 uz veličinu 5 preskoči 2 reda umjesto 5.

**Sad stoji (linija 27):**

```csharp
.Skip(request.Paging.Page)
```

**Treba:**

```csharp
.Skip(request.Paging.SkipCount)
```

Filter, sort i izračun statusa i cijene u ovom handleru ne diraj.

---

## 3. Create: aktivna ponuda se ne veže za proizvod

**Fajl:** `rs1_backend-2025-26/Market.Application/Modules/Catalog/ProductOffers/Commands/Create/CreateProductOfferCommandHandler.cs`

Uslov poredi `Id` ponude sa `ProductId` i ne filtrira `ProductId == request.ProductId`. Bilo koja tuđa uključena i neistekla ponuda vrati 409.

Na dan ispita (26.08.2026.) seed ima aktivne ponude (`OFF-001`, `OFF-004`, `OFF-006`, `OFF-008`), pa svaki POST padne. Danas (27.10.) su sve seed ponude istekle, pa se greška pri testu ne vidi.

**Sad stoji (linije 26–29):**

```csharp
var hasActiveForProduct = await context.ProductOffers
    .AnyAsync(x=>x.Id != request.ProductId
    && x.ValidUntilUtc.Date >= todayUtc.Date
    && x.IsEnabled, cancellationToken);
```

**Treba:**

```csharp
var hasActiveForProduct = await context.ProductOffers
    .AnyAsync(x => x.ProductId == request.ProductId
        && x.IsEnabled
        && x.ValidUntilUtc.Date >= todayUtc,
        cancellationToken);
```

Unique kod, `IsEnabled = true` i trim u istom handleru ostaju.

---

## 4. Update traži proizvod po Id-u ponude

**Fajl:** `rs1_backend-2025-26/Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandHandler.cs`

`request.Id` je Id ponude iz rute. Provjera treba `request.ProductId`. Ponuda čiji se Id poklopi sa nekim proizvodom prođe i kad je poslani proizvod nepostojeći. Nova ponuda sa većim Id-om padne i kad je proizvod ispravan.

**Sad stoji (linije 17–18):**

```csharp
var productsExists = await _ctx.Products
    .AnyAsync(x => x.Id == request.Id, ct);
```

**Treba:**

```csharp
var productsExists = await _ctx.Products
    .AnyAsync(x => x.Id == request.ProductId, ct);
```

Provjera druge aktivne ponude ispod ovoga je ispravna (`Id != request.Id`, `ProductId == request.ProductId`). Ne diraj je.

---

## 5. Oznaka: `OFF-` se gleda prije trima

Zadatak: nakon `Trim`, 5–20 znakova i počinje sa `OFF-` (case-sensitive). Dužina je na trimovanom stringu. Prefiks je na sirovom, pa `" OFF-LJETO"` padne zbog razmaka.

### Create validator

**Fajl:** `rs1_backend-2025-26/Market.Application/Modules/Catalog/ProductOffers/Commands/Create/CreateProductOfferCommandValidator.cs`

**Sad stoji (linije 13–14):**

```csharp
.Must(code => code.StartsWith("OFF-"))
.WithMessage("Code starts with OFF-");
```

**Treba:**

```csharp
.Must(code => code.Trim().StartsWith("OFF-", StringComparison.Ordinal))
.WithMessage("Code starts with OFF-");
```

### Update validator

**Fajl:** `rs1_backend-2025-26/Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandValidator.cs`

**Sad stoji (linije 13–14):**

```csharp
.Must(code => code.StartsWith("OFF-"))
.WithMessage("Code starts with OFF-");
```

**Treba:**

```csharp
.Must(code => code.Trim().StartsWith("OFF-", StringComparison.Ordinal))
.WithMessage("Code starts with OFF-");
```

---

## 6. Policy je AdminOnly, a exam endpointi koriste Staff

**Fajl:** `rs1_backend-2025-26/Market.API/Controllers/ProductOffersController.cs`

`ExamProducts` i `InventoryCounts` imaju `Staff` (Admin, Manager, Employee). `AdminOnly` pušta samo Admin. Manager i employee dobiju 403 na POST, PUT i DELETE.

**Sad stoji (linija 12):**

```csharp
[Authorize(Policy = "AdminOnly")]
```

**Treba:**

```csharp
[Authorize(Policy = "Staff")]
```

`[AllowAnonymous]` skini sa oba GET-a (lista iz tačke 1, `GetById` linije 39–40). Inače te rute zaobilaze i `Staff`.

**Sad stoji na GetById (linije 39–40):**

```csharp
[HttpGet("{id:int}")]
[AllowAnonymous]
```

**Treba:**

```csharp
[HttpGet("{id:int}")]
```
