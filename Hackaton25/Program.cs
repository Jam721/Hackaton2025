using System.Text.Json.Serialization;
using Hackaton25.Application.Interfaces;
using Hackaton25.Application.Services;
using Hackaton25.Extensions;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

services.AddCors(options => {
    options.AddPolicy("ReactPolicy", policy => {
        policy.WithOrigins("http://172.20.10.3:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
services.AddHttpClient();

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



app.MapControllers();

app.Run("http://0.0.0.0:5075/");