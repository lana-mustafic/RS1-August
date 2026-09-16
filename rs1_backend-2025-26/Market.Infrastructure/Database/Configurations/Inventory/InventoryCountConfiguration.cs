using Market.Domain.Entities.Inventory;

namespace Market.Infrastructure.Database.Configurations.Inventory;

public sealed class InventoryCountConfiguration : IEntityTypeConfiguration<InventoryCountEntity>
{
    public void Configure(EntityTypeBuilder<InventoryCountEntity> builder)
    {
        builder.ToTable("InventoryCounts");

        builder
            .Property(x => x.CountNumber)
            .IsRequired()
            .HasMaxLength(InventoryCountEntity.Constraints.CountNumberMaxLength);

        builder
            .Property(x => x.Note)
            .HasMaxLength(InventoryCountEntity.Constraints.NoteMaxLength);

        builder
            .Property(x => x.ItemsCount)
            .IsRequired();

        builder
            .Property(x => x.TotalDifferenceValue)
            .HasPrecision(18, 2)
            .IsRequired();
    }
}
