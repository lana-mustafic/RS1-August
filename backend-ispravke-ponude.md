# Backend ispravke — promotivne ponude

Samo četiri mjesta. Lista, `ProductOfferRules`, validatori, GetById i samo snimanje create/update su u redu. `Remove` već radi soft delete (`IsDeleted = true`) preko interceptora u `DatabaseConfiguration`, to ne mijenjaj.

---

## 1. Update: ista oznaka se ne može sačuvati

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandHandler.cs`

Provjera nađe i trenutnu ponudu, pa update bez promjene oznake uvijek vrati 409.

Sad stoji:

```csharp
var codeExists = await context.ProductOffers
    .AnyAsync(x => x.Code.ToLower() == code.ToLower(), ct);

if (codeExists)
{
    throw new MarketConflictException("Code already exists.");
}
```

Treba da izuzme trenutni `Id`:

```csharp
var codeExists = await context.ProductOffers
    .AnyAsync(x => x.Id != request.Id && x.Code.ToLower() == code.ToLower(), ct);

if (codeExists)
{
    throw new MarketConflictException("Code already exists.");
}
```

---

## 2. Update: aktivna ponuda se provjerava i kad ova izmjena nije aktivna

Isti fajl, odmah ispod provjere oznake.

Sad se druga aktivna ponuda traži uvijek. Isključivanje ponude padne sa 409 ako taj proizvod već ima neku aktivnu. Zadatak: konflikt postoji samo ako bi ponuda **poslije snimanja** bila aktivna, i tada se trenutni `Id` izuzima.

Sad stoji:

```csharp
var hasActiveOffer = await context.ProductOffers
    .AnyAsync(x => x.ProductId == request.ProductId
    && x.IsEnabled
    && x.ValidUntilUtc.Date >= TodayUtc, ct);

if (hasActiveOffer)
{
    var otherActive = await context.ProductOffers.AnyAsync(
        x => x.Id != request.Id
        && x.ProductId == request.ProductId
        && x.IsEnabled
        && x.ValidUntilUtc.Date >= TodayUtc, ct);

    if (otherActive)
    {

    throw new MarketConflictException("Product already has an active offer.");
    }
}
```

Treba:

```csharp
var wouldBeActive = ProductOfferRules.IsActive(
    request.IsEnabled,
    request.ValidUntilUtc,
    TodayUtc);

if (wouldBeActive)
{
    var otherActive = await context.ProductOffers.AnyAsync(
        x => x.Id != request.Id
             && x.ProductId == request.ProductId
             && x.IsEnabled
             && x.ValidUntilUtc.Date >= TodayUtc,
        ct);

    if (otherActive)
        throw new MarketConflictException("Product already has an active offer.");
}
```

`IsActive` već postoji u `ProductOfferRules`: uključena i datum danas ili kasnije. Istekla uključena ponuda ne blokira.

---

## 3. Delete: uključena ponuda se ipak obriše

Fajl: `Market.Application/Modules/Catalog/ProductOffers/Commands/Delete/DeleteProductOfferCommandHandler.cs`

Zadatak: brisanje samo kad je `IsEnabled = false`. Uključena ponuda, i kad je istekla, vraća 409 i zapis se ne dira.

Sad stoji:

```csharp
if (entity is null)
    throw new MarketNotFoundException("Offer not found.");

_context.ProductOffers.Remove(entity);
await _context.SaveChangesAsync(cancellationToken);
```

Treba, prije `Remove`:

```csharp
if (entity is null)
    throw new MarketNotFoundException("Offer not found.");

if (entity.IsEnabled)
    throw new MarketConflictException("Enabled offer cannot be deleted.");

_context.ProductOffers.Remove(entity);
await _context.SaveChangesAsync(cancellationToken);
```

`Remove` ostaje. Interceptor ga pretvori u `IsDeleted = true`.

---

## 4. Create i update: nepostojeći proizvod vraća 409

409 je samo za duplu oznaku i drugu aktivnu ponudu. Nepostojeći ili obrisan proizvod je osnovna validacija, HTTP 400, isto kao `CreateOrder` za loš `productId`.

Create, `CreateProductOfferCommandHandler.cs`, sad stoji:

```csharp
if (!productsExists)
{
    throw new MarketConflictException("Product not found.");
}
```

Update, isti `if`, sad stoji:

```csharp
if (!productsExists)
{
    throw new MarketConflictException("Product not found.");
}
```

U oba fajla treba:

```csharp
if (!productsExists)
{
    throw new ValidationException("Product does not exist or is deleted.");
}
```

`ValidationException` je već u global usings (`FluentValidation`). Nepostojeća **ponuda** i dalje ostaje `MarketNotFoundException` (404). To su update, get i delete kad `Id` ponude ne postoji ili je obrisan.
