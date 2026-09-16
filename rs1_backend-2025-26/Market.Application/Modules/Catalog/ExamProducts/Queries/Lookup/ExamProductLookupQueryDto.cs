namespace Market.Application.Modules.Catalog.ExamProducts.Queries.Lookup;

public sealed class ExamProductLookupQueryDto
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public required decimal Price { get; init; }
    public required int StockQuantity { get; init; }
}
