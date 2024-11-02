using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
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
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();
// Use Serilog as the logging provider
builder.Host.UseSerilog();

// Add Authentication with JWT Bearer (parameters read from AuthService configuration)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// Add Authorization with Role and Ownership Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserPolicy", policy => policy.RequireRole("User"));
});

builder.Services.AddAutoMapper(typeof(UserProfile));
builder.Services.AddHttpContextAccessor();

builder.Services.AddSqlite<UsersDbContext>(usersDbConnection);
builder.Services.AddSqlite<TuneBoxDbContext>(tuneBoxDbConnection);

builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddTransient<IMusicService>(provider =>
{
    var tuneBoxContext = provider.GetRequiredService<TuneBoxDbContext>();
    var fileStoragePath = Path.Combine(builder.Environment.ContentRootPath, "audios");
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

// Обслуживает статические файлы из wwwroot
app.UseStaticFiles();

// Добавляем отдельную настройку для аудиофайлов из папки audios
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "audios")),
    RequestPath = "/audios"
});

app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();