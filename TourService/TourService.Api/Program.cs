using TourService.Application.Interfaces;
using TourService.Infrastructure.Mongo;
using TourService.Infrastructure.Repositories;
using TourService.Application.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton(sp =>
{
    var settings = builder.Configuration
        .GetSection("MongoDbSettings")
        .Get<MongoDbSettings>();

    return settings!;
});

/*builder.Services.AddCors(options =>
{
    options.AddPolicy("React", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});*/

builder.Services.AddScoped<ITourRepository, TourRepository>();
builder.Services.AddScoped<IPositionRepository, PositionRepository>();
builder.Services.AddScoped<IShoppingCartRepository, ShoppingCartRepository>();
builder.Services.AddScoped<IPurchaseTokenRepository, PurchaseTokenRepository>();
builder.Services.AddScoped<ITourExecutionRepository, TourExecutionRepository>();
builder.Services.AddScoped<ToursService>();
builder.Services.AddScoped<PositionService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<TourExecutionService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

//app.UseCors("React");
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();

app.MapControllers();

app.Run();