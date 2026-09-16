namespace Market.Application.Modules.Catalog.ExamProducts.Queries.Lookup;

public sealed class ExamProductLookupQueryHandler(IAppDbContext ctx)
    : IRequestHandler<ExamProductLookupQuery, IReadOnlyList<ExamProductLookupQueryDto>>
{
    public async Task<IReadOnlyList<ExamProductLookupQueryDto>> Handle(
        ExamProductLookupQuery request,
        CancellationToken ct)
    {
        return await ctx.Products
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ThenBy(x => x.Id)
            .Select(x => new ExamProductLookupQueryDto
            {
                Id = x.Id,
                Name = x.Name,
                Price = x.Price,
                StockQuantity = x.StockQuantity
            })
            .ToListAsync(ct);
    }
}
