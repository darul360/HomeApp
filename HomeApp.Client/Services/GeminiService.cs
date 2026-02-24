using Microsoft.JSInterop;
using System.Threading.Tasks;

namespace HomeApp.Client.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly IJSRuntime _jsRuntime;

        public GeminiService(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
        }

        public async Task InitializeAsync(string apiKey)
        {
            await _jsRuntime.InvokeVoidAsync("geminiService.init", apiKey);
        }

        public async Task<string> AnalyzeTextAsync(string prompt)
        {
            return await _jsRuntime.InvokeAsync<string>("geminiService.analyzeText", prompt);
        }

        public async Task<string> AnalyzeImageAsync(string prompt, string base64Image, string mimeType)
        {
            return await _jsRuntime.InvokeAsync<string>("geminiService.analyzeImage", prompt, base64Image, mimeType);
        }

        public async Task<int> GetRemainingRequestsAsync()
        {
            return await _jsRuntime.InvokeAsync<int>("geminiService.getRemainingRequests");
        }

        public async Task<int> GetModelLimitAsync()
        {
            return await _jsRuntime.InvokeAsync<int>("geminiService.getModelLimit");
        }
    }
}
