using Microsoft.Extensions.DependencyInjection;
using Serilog;
using TuneBox.Controllers;
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
builder.Services.AddSwaggerGen();

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

// Use Serilog as the logging provider
builder.Host.UseSerilog();

builder.Services.AddAutoMapper(typeof(UserProfile));

builder.Services.AddSqlite<UsersDbContext>(usersDbConnection);
builder.Services.AddSqlite<TuneBoxDbContext>(tuneBoxDbConnection);
builder.Services.AddTransient<IAuthService, AuthService>();

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