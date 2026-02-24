using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using HomeApp.Client;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddScoped<HomeApp.Client.Services.IFirebaseService, HomeApp.Client.Services.FirebaseService>();
builder.Services.AddScoped<HomeApp.Client.Services.IGeminiService, HomeApp.Client.Services.GeminiService>();

await builder.Build().RunAsync();
