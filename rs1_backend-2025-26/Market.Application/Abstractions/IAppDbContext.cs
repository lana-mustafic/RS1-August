using Market.Domain.Entities.Sales;
using Market.Domain.Entities.Inventory;

namespace Market.Application.Abstractions;

// Application layer
public interface IAppDbContext
{
    DbSet<ProductEntity> Products { get; }
    DbSet<ProductCategoryEntity> ProductCategories { get; }
    DbSet<PromotionEntity> Promotions { get; }
    DbSet<ProductOfferEntity> ProductOffers { get; }
    DbSet<MarketUserEntity> Users { get; }
    DbSet<RefreshTokenEntity> RefreshTokens { get; }

    DbSet<OrderEntity> Orders{ get; }
    DbSet<OrderItemEntity> OrderItems { get; }

    DbSet<InventoryCountEntity> InventoryCounts { get; }

    Task<int> SaveChangesAsync(CancellationToken ct);
}
