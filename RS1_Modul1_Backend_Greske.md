# Modul 1 — greške na backendu (promotivne ponude)

Putanje su unutar `rs1_backend-2025-26`. Kod ispod je ono što sad stoji u projektu i ono što treba da stoji umjesto toga.

Lista, filteri, sort, status, create (trim, `IsEnabled = true`, jedinstvena oznaka, jedna aktivna) i get po Id-u su u redu. `Remove` već radi soft delete preko interceptora. Ovo su mjesta koja padaju na zadatku.

---

## 1. Cijena s popustom je obrnuta

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Queries/List/ListProductOfferQueryHandler.cs`

Metoda prvo prima cijenu proizvoda, pa procenat:

```csharp
public static decimal CalculatedDiscountedPrice(decimal productPrice, decimal discountPercent)
```

Lista šalje obrnuto. Za cijenu 20 i popust 10% izađe `8.00` umjesto `18.00`.

Kod koji je kod tebe:

```csharp
DiscountedPrice = ProductOffersRules.CalculatedDiscountedPrice(x.DiscountPercent, x.Price),
```

Treba:

```csharp
DiscountedPrice = ProductOffersRules.CalculatedDiscountedPrice(x.Price, x.DiscountPercent),
```

---

## 2. Update: ista oznaka se ne može sačuvati, tuđa može

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandHandler.cs`

Uslov je `x.Id == request.Id`. Trenutni zapis sam sebi pravi 409, a oznaka druge ponude prođe. Treba `x.Id != request.Id`.

Kod koji je kod tebe:

```csharp
var codeTaken = await _ctx.ProductOffers
    .AnyAsync(x => x.Id == request.Id && x.Code.ToLower() == code.ToLower(), ct);

    if(codeTaken)
{
    throw new MarketConflictException("Code already exists.");
}
```

Treba:

```csharp
var codeTaken = await _ctx.ProductOffers
    .AnyAsync(x => x.Id != request.Id && x.Code.ToLower() == code.ToLower(), ct);

if (codeTaken)
{
    throw new MarketConflictException("Code already exists.");
}
```

---

## 3. Update: nema provjere druge aktivne ponude

Isti fajl. `todayUtc` se izračuna i ne koristi. Create ovo ima, update nema, pa drugi aktivni zapis na isti proizvod prođe.

Kod koji je kod tebe, odmah poslije provjere oznake:

```csharp
entity.Code = code;
entity.ProductId = request.ProductId;
entity.ValidUntilUtc = request.ValidUntilUtc;
entity.DiscountPercent = request.DiscountPercent;
entity.IsEnabled = request.IsEnabled;
```

Treba, prije tog mapiranja:

```csharp
var wouldBeActive = ProductOffersRules.IsActive(
    request.IsEnabled,
    request.ValidUntilUtc,
    todayUtc);

if (wouldBeActive)
{
    var otherActive = await _ctx.ProductOffers.AnyAsync(
        x => x.Id != request.Id
             && x.ProductId == request.ProductId
             && x.IsEnabled
             && x.ValidUntilUtc.Date >= todayUtc,
        ct);

    if (otherActive)
    {
        throw new MarketConflictException("Product already has an active offer.");
    }
}

entity.Code = code;
entity.ProductId = request.ProductId;
entity.ValidUntilUtc = request.ValidUntilUtc;
entity.DiscountPercent = request.DiscountPercent;
entity.IsEnabled = request.IsEnabled;
```

Konflikt samo ako bi ponuda poslije snimanja bila aktivna. Uključena, ali istekla, ne blokira. Trenutni `Id` se izuzima.

Cijeli handler poslije obje izmjene (oznaka i aktivna ponuda):

```csharp
namespace Market.Application.Modules.Catalog.ProductOffers.Commands.Update;

public sealed class UpdateProductOfferCommandHandler(IAppDbContext _ctx) : IRequestHandler<UpdateProductOfferCommand, Unit>
{
    public async Task<Unit> Handle(UpdateProductOfferCommand request, CancellationToken ct)
    {
        var todayUtc = DateTime.UtcNow.Date;
        var code = request.Code.Trim();

        var entity = await _ctx.ProductOffers
            .Where(x => x.Id == request.Id)
            .FirstOrDefaultAsync(ct);

        if (entity is null)
            throw new MarketNotFoundException($"Product offer (ID={request.Id}) not found.");

        var productsExists = await _ctx.Products
            .AnyAsync(x => x.Id == request.ProductId, ct);

        if (!productsExists)
            throw new ValidationException("Product not found.");

        var codeTaken = await _ctx.ProductOffers
            .AnyAsync(x => x.Id != request.Id && x.Code.ToLower() == code.ToLower(), ct);

        if (codeTaken)
        {
            throw new MarketConflictException("Code already exists.");
        }

        var wouldBeActive = ProductOffersRules.IsActive(
            request.IsEnabled,
            request.ValidUntilUtc,
            todayUtc);

        if (wouldBeActive)
        {
            var otherActive = await _ctx.ProductOffers.AnyAsync(
                x => x.Id != request.Id
                     && x.ProductId == request.ProductId
                     && x.IsEnabled
                     && x.ValidUntilUtc.Date >= todayUtc,
                ct);

            if (otherActive)
            {
                throw new MarketConflictException("Product already has an active offer.");
            }
        }

        entity.Code = code;
        entity.ProductId = request.ProductId;
        entity.ValidUntilUtc = request.ValidUntilUtc;
        entity.DiscountPercent = request.DiscountPercent;
        entity.IsEnabled = request.IsEnabled;

        await _ctx.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
```

---

## 4. Update: isključena ponuda ne smije imati prošli datum

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandValidator.cs`

Prvo pravilo traži datum danas ili kasnije i kad je `IsEnabled = false`. Zato istekla ponuda ne može da se isključi bez pomjeranja datuma. Donje pravilo to ne spasi, jer gornje već odbija zahtjev.

Kod koji je kod tebe:

```csharp
RuleFor(x => x.ValidUntilUtc)
    .Must(date => date.Date != default)
    .WithMessage("Date is required.")
    .Must(date => date.Date >= DateTime.UtcNow.Date);

RuleFor(x => x)
        .Must(x => !x.IsEnabled || x.ValidUntilUtc >= DateTime.UtcNow.Date)
        .WithMessage("Date cant be older than todays date.")
        .When(x => x.ValidUntilUtc != default);
```

Treba. Prošli datum prolazi samo kad je ponuda isključena. Uključena i dalje mora imati danas ili kasnije.

```csharp
RuleFor(x => x.ValidUntilUtc)
    .Must(date => date != default)
    .WithMessage("Date is required.");

RuleFor(x => x)
    .Must(x => !x.IsEnabled || x.ValidUntilUtc.Date >= DateTime.UtcNow.Date)
    .WithMessage("Date cant be older than todays date.")
    .When(x => x.ValidUntilUtc != default);
```

---

## 5. Brisanje uključene ponude vraća 404, ne 409

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Delete/DeleteProductOfferCommandHandler.cs`

Provjera `IsEnabled` postoji i zapis se ne mijenja, ali izuzetak je `MarketNotFoundException` (404). Zadatak traži 409, to je `MarketConflictException`.

Kod koji je kod tebe:

```csharp
if(offer.IsEnabled)
{
    throw new MarketNotFoundException("Enabled product offer cannot be deleted.");
}
```

Treba:

```csharp
if (offer.IsEnabled)
{
    throw new MarketConflictException("Enabled product offer cannot be deleted.");
}
```

Nepostojeći i već obrisani Id ostaju na `MarketNotFoundException`. `Remove` ne diraj.

---

## 6. Prefiks `OFF-` se gleda prije trima

Isti red u oba validatora:

- `Market.Application/Modules/Catalog/ProductOffers/Commands/Create/CreateProductOfferCommandValidator.cs`
- `Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandValidator.cs`

Dužina ide preko `Trim()`, a `StartsWith` ne. `" OFF-LJETO"` zadatak treba prihvatiti. `off-...` i dalje treba odbiti.

Kod koji je kod tebe:

```csharp
.Must(code => code.StartsWith("OFF-"))
.WithMessage("Code must start with OFF-");
```

Treba, u oba fajla:

```csharp
.Must(code => code.Trim().StartsWith("OFF-", StringComparison.Ordinal))
.WithMessage("Code must start with OFF-");
```
