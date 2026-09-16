using Market.Domain.Common;

namespace Market.Domain.Entities.Inventory;

public class InventoryCountEntity : BaseEntity
{
    public required string CountNumber { get; set; }

    public string? Note { get; set; }

    public int ItemsCount { get; set; }

    public decimal TotalDifferenceValue { get; set; }

    public static class Constraints
    {
        public const int CountNumberMaxLength = 20;
        public const int NoteMaxLength = 500;
    }
}
