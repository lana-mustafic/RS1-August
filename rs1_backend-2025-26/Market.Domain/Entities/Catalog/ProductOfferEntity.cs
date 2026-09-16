using Market.Domain.Common;

namespace Market.Domain.Entities.Catalog;

public class ProductOfferEntity : BaseEntity
{
    public required string Code { get; set; }

    public int ProductId { get; set; }

    public ProductEntity? Product { get; set; }

    public decimal DiscountPercent { get; set; }

    public DateTime ValidUntilUtc { get; set; }

    public bool IsEnabled { get; set; }

    public static class Constraints
    {
        public const int CodeMaxLength = 20;
    }
}
