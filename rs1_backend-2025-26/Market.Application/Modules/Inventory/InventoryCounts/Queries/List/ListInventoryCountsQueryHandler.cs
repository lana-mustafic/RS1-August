using Market.Domain.Entities.Inventory;

namespace Market.Application.Modules.Inventory.InventoryCounts.Queries.List;

public sealed class ListInventoryCountsQueryHandler(IAppDbContext ctx)
    : IRequestHandler<ListInventoryCountsQuery, PageResult<ListInventoryCountsQueryDto>>
{
    public async Task<PageResult<ListInventoryCountsQueryDto>> Handle(
        ListInventoryCountsQuery request,
        CancellationToken ct)
    {
        var query = ctx.InventoryCounts
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .ThenByDescending(x => x.Id)
            .Select(x => new ListInventoryCountsQueryDto
            {
                Id = x.Id,
                CountNumber = x.CountNumber,
                Note = x.Note,
                ItemsCount = x.ItemsCount,
                TotalDifferenceValue = x.TotalDifferenceValue,
                CreatedAtUtc = x.CreatedAtUtc
            });

        var page = await PageResult<ListInventoryCountsQueryDto>.FromQueryableAsync(
            query,
            request.Paging,
            ct);

        return new PageResult<ListInventoryCountsQueryDto>
        {
            Items = page.Items.Select(item => new ListInventoryCountsQueryDto
            {
                Id = item.Id,
                CountNumber = item.CountNumber,
                Note = item.Note,
                ItemsCount = item.ItemsCount,
                TotalDifferenceValue = item.TotalDifferenceValue,
                CreatedAtUtc = DateTime.SpecifyKind(item.CreatedAtUtc, DateTimeKind.Utc)
            }).ToList(),
            PageSize = page.PageSize,
            CurrentPage = page.CurrentPage,
            IncludedTotal = page.IncludedTotal,
            TotalItems = page.TotalItems,
            TotalPages = page.TotalPages
        };
    }
}
