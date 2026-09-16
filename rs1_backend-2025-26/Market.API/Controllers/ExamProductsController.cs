using Market.Application.Modules.Catalog.ExamProducts.Queries.Lookup;

namespace Market.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Policy = "Staff")]
public sealed class ExamProductsController(ISender sender) : ControllerBase
{
    [HttpGet("lookup")]
    public async Task<IReadOnlyList<ExamProductLookupQueryDto>> Lookup(CancellationToken ct)
    {
        return await sender.Send(new ExamProductLookupQuery(), ct);
    }
}
