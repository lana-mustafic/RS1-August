# ProductOffers — ProductId

Samo modul ponuda. Dvije linije. Ne miješaju se.

## 1. Da li proizvod postoji

Tabela je `Products`. Lijevo je `Id` proizvoda. Desno je `ProductId` iz forme.

```csharp
await ctx.Products.AnyAsync(x => x.Id == request.ProductId, ct);
```

Ista linija ide i na create i na update.

**Create, ispravno.** `ProductOffers/Commands/Create/CreateProductOfferCommandHandler.cs`

```csharp
var productExists = await context.Products
    .AnyAsync(x => x.Id == request.ProductId, cancellationToken);
```

**Update, krivo.** `ProductOffers/Commands/Update/UpdateProductOfferCommandHandler.cs`

`request.Id` je Id ponude iz rute, ne proizvoda.

Sad stoji:

```csharp
var productsExists = await _ctx.Products
    .AnyAsync(x => x.Id == request.Id, ct);
```

Treba:

```csharp
var productsExists = await _ctx.Products
    .AnyAsync(x => x.Id == request.ProductId, ct);
```

## 2. Ponude tog proizvoda

Tabela je `ProductOffers`. Obe strane su `ProductId`. Ovo ne traži proizvod. Traži ponude koje već pokazuju na njega.

```csharp
x.ProductId == request.ProductId
```

**Lista.** `ProductOffers/Queries/List/ListProductOfferQueryHandler.cs`

```csharp
if (request.ProductId is > 0)
{
    q = q.Where(x => x.ProductId == request.ProductId);
}
```

**Druga aktivna ponuda na update-u.** `UpdateProductOfferCommandHandler.cs`

```csharp
var hasOtherActive = await _ctx.ProductOffers
    .AnyAsync(x => x.Id != request.Id
        && x.ProductId == request.ProductId
        && x.IsEnabled
        && x.ValidUntilUtc.Date >= todayUtc.Date, ct);
```

`x.Id != request.Id` izuzima trenutnu ponudu. To nije provjera proizvoda.

**Create, krivo.** `CreateProductOfferCommandHandler.cs`

Sad stoji:

```csharp
var hasActiveForProduct = await context.ProductOffers
    .AnyAsync(x => x.Id != request.ProductId
        && x.ValidUntilUtc.Date >= todayUtc.Date
        && x.IsEnabled, cancellationToken);
```

`x.Id != request.ProductId` poredi Id ponude sa Id-om proizvoda. Nema filtera po proizvodu.

Treba:

```csharp
var hasActiveForProduct = await context.ProductOffers
    .AnyAsync(x => x.ProductId == request.ProductId
        && x.IsEnabled
        && x.ValidUntilUtc.Date >= todayUtc, cancellationToken);
```

## 3. Učitaj ovu ponudu

`request.Id` je Id iz rute. Tabela je `ProductOffers`.

```csharp
x.Id == request.Id
```

To stoji na update-u, get-by-id i delete-u. Tu se ne piše `ProductId`.

## Ukratko

| Šta radiš | Tabela | Linija |
|-----------|--------|--------|
| Proizvod postoji | `Products` | `x.Id == request.ProductId` |
| Ponude ovog proizvoda | `ProductOffers` | `x.ProductId == request.ProductId` |
| Učitaj ponudu po ruti | `ProductOffers` | `x.Id == request.Id` |
