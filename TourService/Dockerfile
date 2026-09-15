FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "TourService.Api/TourService.Api.csproj"
RUN dotnet publish "TourService.Api/TourService.Api.csproj" -c Release --no-restore -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5281
EXPOSE 5281
ENTRYPOINT ["dotnet", "TourService.Api.dll"]
