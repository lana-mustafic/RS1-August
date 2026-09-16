namespace Market.Infrastructure.Database.Configurations.Catelog;

public sealed class ProductOfferConfiguration : IEntityTypeConfiguration<ProductOfferEntity>
{
    public void Configure(EntityTypeBuilder<ProductOfferEntity> builder)
    {
        builder.ToTable("ProductOffers");

        builder
            .Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(ProductOfferEntity.Constraints.CodeMaxLength);

        builder
            .Property(x => x.DiscountPercent)
            .HasPrecision(5, 2)
            .IsRequired();

        builder
            .Property(x => x.ValidUntilUtc)
            .IsRequired();

        builder
            .Property(x => x.IsEnabled)
            .IsRequired();

        builder
            .HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
