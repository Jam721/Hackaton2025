using System.Text;
using System.Text.Json.Serialization;
using Hackaton25.Application.Interfaces;
using Hackaton25.Application.Services;
using Hackaton25.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

services.AddCors(options => {
    options.AddPolicy("ReactPolicy", policy => {
        policy.WithOrigins("http://172.20.10.3:5173", "http://172.20.10.2:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
services.AddHttpClient();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("ahdahudhahdoahwwohdauhdoahdoaudhoudhoawhdouhawodawhdaod")),
            ClockSkew = TimeSpan.Zero
        };

        // Для получения токена из куки
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["tasty"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

services.AddOpenApi();
services.AddSwaggerGen();
services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

services.AddDbContextExtensions(configuration);
services.AddMinioExtension(configuration);

services.AddScoped<IFileStorageService, FileStorageService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ReactPolicy");

app.UseDbContextExtensions();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run("http://0.0.0.0:5075/");