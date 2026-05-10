# =============================================================================
# Smart Lock Service - .NET 8 Minimal API
# Multi-stage build: SDK -> publish -> runtime image
# =============================================================================

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore deps first for better caching
COPY SmartLockService.csproj ./
RUN dotnet restore SmartLockService.csproj

# Copy the rest and publish
COPY . .
RUN dotnet publish SmartLockService.csproj -c Release -o /app/publish /p:UseAppHost=false

# -----------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# wget for healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SmartLockService.dll"]
