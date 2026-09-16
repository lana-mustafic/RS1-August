namespace Market.Application.Modules.Inventory.InventoryCounts.Queries.List;

public sealed class ListInventoryCountsQueryDto
{
    public required int Id { get; init; }
    public required string CountNumber { get; init; }
    public required string? Note { get; init; }
    public required int ItemsCount { get; init; }
    public required decimal TotalDifferenceValue { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}
