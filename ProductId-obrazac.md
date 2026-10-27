# ProductId obrazac

Dvije linije. Ne miješaju se.

## Linija 1 — da li proizvod postoji

Tabela je `Products`. Lijevo je `Id` proizvoda. Desno je `ProductId` koji je korisnik poslao.

```csharp
await ctx.Products.AnyAsync(x => x.Id == request.ProductId, ct);
```

Ovo je jedino mjesto u backendu gdje tačno stoji `x.Id == request.ProductId`. Create ponude, i tu je ispravno.

**Fajl:** `rs1_backend-2025-26/Market.Application/Modules/Catalog/ProductOffers/Commands/Create/CreateProductOfferCommandHandler.cs`

```csharp
var productExists = await context.Products
    .AnyAsync(x => x.Id == request.ProductId, cancellationToken);
```

Isti obrazac za kategoriju. Tabela je `ProductCategories`, polje iz requesta je `CategoryId`.

**Create proizvoda:** `Market.Application/Modules/Catalog/Products/Commands/Create/CreateProductCommandHandler.cs`

```csharp
var productCategory = await ctx.ProductCategories
    .Where(x => x.Id == request.CategoryId)
    .FirstOrDefaultAsync(ct);
```

**Update proizvoda:** `Market.Application/Modules/Catalog/Products/Commands/Update/UpdateProductCommandHandler.cs`

```csharp
var productCategory = await ctx.ProductCategories
    .Where(x => x.Id == request.CategoryId)
    .FirstOrDefaultAsync(ct);
```

Za ponudu zapamti samo ovu liniju, i na create i na update:

```csharp
await ctx.Products.AnyAsync(x => x.Id == request.ProductId, ct);
```

## Update ponude je kriv

**Fajl:** `rs1_backend-2025-26/Market.Application/Modules/Catalog/ProductOffers/Commands/Update/UpdateProductOfferCommandHandler.cs`

`request.Id` je Id ponude, ne proizvoda.

**Sad stoji:**

```csharp
var productsExists = await _ctx.Products
    .AnyAsync(x => x.Id == request.Id, ct);
```

**Treba:**

```csharp
var productsExists = await _ctx.Products
    .AnyAsync(x => x.Id == request.ProductId, ct);
```

## Linija 2 — filtriraj ponude tog proizvoda

Obe strane su `ProductId`. Ne tražiš red u `Products`. Tražiš ponude koje već pokazuju na taj proizvod.

```csharp
x.ProductId == request.ProductId
```

**Lista:** `Market.Application/Modules/Catalog/ProductOffers/Queries/List/ListProductOfferQueryHandler.cs`

```csharp
if (request.ProductId is > 0)
{
    q = q.Where(x => x.ProductId == request.ProductId);
}
```

**Druga aktivna ponuda na update-u:** `UpdateProductOfferCommandHandler.cs`

```csharp
var hasOtherActive = await _ctx.ProductOffers
    .AnyAsync(x => x.Id != request.Id
        && x.ProductId == request.ProductId
        && x.IsEnabled
        && x.ValidUntilUtc.Date >= todayUtc.Date, ct);
```

`x.Id != request.Id` ovdje izuzima trenutnu ponudu. To nije provjera proizvoda.

## Create: aktivna ponuda je kriva

**Fajl:** `CreateProductOfferCommandHandler.cs`

**Sad stoji:**

```csharp
var hasActiveForProduct = await context.ProductOffers
    .AnyAsync(x => x.Id != request.ProductId
        && x.ValidUntilUtc.Date >= todayUtc.Date
        && x.IsEnabled, cancellationToken);
```

`x.Id != request.ProductId` poredi Id ponude sa Id-om proizvoda. Nema filtera po proizvodu.

**Treba:**

```csharp
var hasActiveForProduct = await context.ProductOffers
    .AnyAsync(x => x.ProductId == request.ProductId
        && x.IsEnabled
        && x.ValidUntilUtc.Date >= todayUtc, cancellationToken);
```

## Ukratko

| Šta radiš | Tabela | Linija |
|-----------|--------|--------|
| Proizvod postoji | `Products` | `x.Id == request.ProductId` |
| Kategorija postoji | `ProductCategories` | `x.Id == request.CategoryId` |
| Ponude ovog proizvoda | `ProductOffers` | `x.ProductId == request.ProductId` |
| Učitaj ponudu po ruti | `ProductOffers` | `x.Id == request.Id` |
