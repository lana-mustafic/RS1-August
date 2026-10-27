# Backend greške — sada (promotivne ponude)

Putanje su unutar `rs1_backend-2025-26`. Ispod je kod koji sad stoji i kod koji treba da stoji.

Lista, status, cijena s popustom, GetById, unique oznaka i Update handler (izuzimanje trenutnog Id-a, druga aktivna ponuda, `CreatedAtUtc` se ne dira) su u redu. `Remove` već radi soft delete preko interceptora. Ovdje su samo greške.

---

## 1. Oznaka mora počinjati sa `OFF-`, a ne sa `CODE-`

Ista greška u dva fajla. PDF: nakon `Trim` oznaka ima 5–20 znakova i počinje sa `OFF-`, case-sensitive. Seed je `OFF-001` … `OFF-012`, pa snimanje postojeće ponude bez promjene oznake sad vraća 400.

### Create

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Create/CreateProductOfferCommandValidator.cs`

Kod koji sad stoji:

```csharp
RuleFor(x => x.Code)
    .Cascade(CascadeMode.Stop)
    .NotEmpty().WithMessage("Code is required.")
    .Must(code => code.Trim().Length is >= 5 and <= 20)
    .WithMessage("Code must have 5-20 characters.")
    .Must(code => code.Trim().StartsWith("CODE-"))
    .WithMessage("Code must start with CODE-");
```

Treba:

```csharp
RuleFor(x => x.Code)
    .Cascade(CascadeMode.Stop)
    .NotEmpty().WithMessage("Oznaka je obavezna.")
    .Must(code => code.Trim().Length is >= 5 and <= 20)
        .WithMessage("Oznaka mora imati 5 do 20 znakova.")
    .Must(code => code.Trim().StartsWith("OFF-", StringComparison.Ordinal))
        .WithMessage("Oznaka mora počinjati sa OFF-.");
```

### Update

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandValidator.cs`

Kod koji sad stoji:

```csharp
RuleFor(x => x.Code)
    .Cascade(CascadeMode.Stop)
    .NotEmpty().WithMessage("Code is required.")
    .Must(code => code.Trim().Length is >= 5 and <= 20)
    .WithMessage("Code must have 5-20 characters.")
    .Must(code => code.Trim().StartsWith("CODE-"))
    .WithMessage("Code must start with CODE-");
```

Treba:

```csharp
RuleFor(x => x.Code)
    .Cascade(CascadeMode.Stop)
    .NotEmpty().WithMessage("Oznaka je obavezna.")
    .Must(code => code.Trim().Length is >= 5 and <= 20)
        .WithMessage("Oznaka mora imati 5 do 20 znakova.")
    .Must(code => code.Trim().StartsWith("OFF-", StringComparison.Ordinal))
        .WithMessage("Oznaka mora počinjati sa OFF-.");
```

`StringComparison.Ordinal` drži poređenje case-sensitive: `OFF-` prolazi, `off-` ne prolazi.

---

## 2. Create blokira svaku ponudu proizvoda, a smije samo aktivnu

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Create/CreateProductOfferCommandHandler.cs`

`todayUtc` se izračuna i ne koristi. Upit gleda samo `ProductId`, pa istekla i isključena ponuda isto vrate 409. Aktivna je uključena ponuda čiji je `ValidUntilUtc.Date` danas ili kasnije. Create je uvijek uključen, zato se ovdje gledaju samo postojeće ponude.

Kod koji sad stoji:

```csharp
var hasActiveForProduct = await context.ProductOffers
    .AnyAsync(x=>x.ProductId == request.ProductId);

if(hasActiveForProduct)
{
    throw new MarketConflictException("Product already has an active offer.");
}
```

Treba:

```csharp
var hasActiveForProduct = await context.ProductOffers.AnyAsync(
    x => x.ProductId == request.ProductId
         && x.IsEnabled
         && x.ValidUntilUtc.Date >= todayUtc,
    cancellationToken);

if (hasActiveForProduct)
{
    throw new MarketConflictException("Proizvod već ima aktivnu ponudu.");
}
```

---

## 3. Brisanje ne gleda `IsEnabled`

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Delete/DeleteProductOfferCommandHandler.cs`

Brisanje je dozvoljeno samo kad je `IsEnabled = false`. Uključena ponuda, i kad je istekla, mora vratiti 409 i zapis se ne smije mijenjati. `Remove` ostaje: interceptor to pretvara u soft delete.

Kod koji sad stoji:

```csharp
if (entity is null)
    throw new MarketNotFoundException("Product offer not found.");

_context.ProductOffers.Remove(entity);
await _context.SaveChangesAsync(cancellationToken);
```

Treba:

```csharp
if (entity is null)
    throw new MarketNotFoundException("Product offer not found.");

if (entity.IsEnabled)
{
    throw new MarketConflictException(
        "Uključena ponuda se ne može obrisati. Prvo je isključite.");
}

_context.ProductOffers.Remove(entity);
await _context.SaveChangesAsync(cancellationToken);
```

---

## 4. Kontroler je `AdminOnly`, a treba `Staff`

Fajl: `Market.API/Controllers/ProductOffersController.cs`

Policy treba biti `Staff`, kao na `ExamProducts` i `InventoryCounts`, da Admin, Manager i Employee mogu raditi iz admin panela. `AllowAnonymous` na GET skida tu provjeru.

Kod koji sad stoji:

```csharp
[Authorize(Policy = "AdminOnly")]
public class ProductOffersController(ISender sender) : ControllerBase
```

```csharp
[HttpGet("{id:int}")]
[AllowAnonymous]
public async Task<GetProductOfferByIdQueryDto> GetById(int id, CancellationToken ct)
```

```csharp
[HttpGet]
[AllowAnonymous]
public async Task<PageResult<ListProductOfferQueryDto>> List([FromQuery] ListProductOfferQuery query, CancellationToken ct)
```

Treba:

```csharp
[Authorize(Policy = "Staff")]
public class ProductOffersController(ISender sender) : ControllerBase
```

```csharp
[HttpGet("{id:int}")]
public async Task<GetProductOfferByIdQueryDto> GetById(int id, CancellationToken ct)
```

```csharp
[HttpGet]
public async Task<PageResult<ListProductOfferQueryDto>> List([FromQuery] ListProductOfferQuery query, CancellationToken ct)
```

Ostale metode u kontroleru ostaju iste. PDF ovo ne boduje posebnim redom, ali Manager i Employee na POST, PUT i DELETE sad dobiju 403.
