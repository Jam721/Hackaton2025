FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Hackaton25/Hackaton25.csproj", "Hackaton25/"]
COPY ["Hackaton25.Domain/Hackaton25.Domain.csproj", "Hackaton25.Domain/"]
COPY ["Hackaton25.Application/Hackaton25.Application.csproj", "Hackaton25.Application/"]
RUN dotnet restore "Hackaton25/Hackaton25.csproj"
COPY . .
WORKDIR "/src/Hackaton25"
RUN dotnet build "Hackaton25.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Hackaton25.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Hackaton25.dll"]
