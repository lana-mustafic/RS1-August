using Market.Application.Modules.Inventory.InventoryCounts.Queries.List;

namespace Market.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Policy = "Staff")]
public sealed class InventoryCountsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<PageResult<ListInventoryCountsQueryDto>> List(
        [FromQuery] ListInventoryCountsQuery query,
        CancellationToken ct)
    {
        return await sender.Send(query, ct);
    }
}
