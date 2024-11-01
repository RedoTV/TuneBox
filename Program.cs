using Microsoft.OpenApi.Models;
using Serilog;
using TuneBox.DbContexts;
using TuneBox.Mapper;
using TuneBox.Services;

string clientPolicy = "tuneBoxReactOrigin";

var builder = WebApplication.CreateBuilder(args);

string usersDbConnection = builder.Configuration.GetConnectionString("UsersDbConnection")!;
string tuneBoxDbConnection = builder.Configuration.GetConnectionString("TuneBoxDbConnection")!;

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: clientPolicy,
        policy =>
        {
            policy.WithOrigins("http://localhost:3434", "https://localhost:7156");
            policy.AllowAnyHeader();
            policy.AllowAnyMethod();
        });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TuneBox API", Version = "v1" });
});

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

// Use Serilog as the logging provider
builder.Host.UseSerilog();

builder.Services.AddAutoMapper(typeof(UserProfile));
builder.Services.AddHttpContextAccessor();

builder.Services.AddSqlite<UsersDbContext>(usersDbConnection);
builder.Services.AddSqlite<TuneBoxDbContext>(tuneBoxDbConnection);

builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddTransient<IMusicService>(provider =>
{
    var tuneBoxContext = provider.GetRequiredService<TuneBoxDbContext>();
    var fileStoragePath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot/audio/mp3");
    var httpContextAccessor = provider.GetRequiredService<IHttpContextAccessor>();

    return new MusicService(tuneBoxContext, fileStoragePath, httpContextAccessor);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors(clientPolicy);

app.UseStaticFiles();

app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();