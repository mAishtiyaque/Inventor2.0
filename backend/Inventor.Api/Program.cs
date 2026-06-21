using Inventor.Api.Data;
using Inventor.Api.Interfaces;
using Inventor.Api.Middleware;
using Inventor.Api.Services;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Text.Json.Serialization;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog early so startup logs are captured
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Read connection string from configuration (prefer environment or secrets in production)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? builder.Configuration["DATABASE_URL"] // optional: support env var
                       ?? throw new InvalidOperationException("Connection string not found. Please set 'DefaultConnection' in configuration or 'DATABASE_URL' environment variable.");

// Register DB Context
builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseNpgsql(connectionString));


// Register Multi-Tenant Services
builder.Services.AddScoped<ITenantProvider, TenantProvider>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProcessService, ProcessService>();
builder.Services.AddScoped<ILedgerService, LedgerService>();
builder.Services.AddScoped<IReportingService, ReportingService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IVendorFinanceService, VendorFinanceService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<TenantContextMiddleware>();

//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

