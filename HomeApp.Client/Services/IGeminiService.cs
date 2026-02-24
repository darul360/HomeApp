using System.Threading.Tasks;

namespace HomeApp.Client.Services
{
    public interface IGeminiService
    {
        Task InitializeAsync(string apiKey);
        Task<string> AnalyzeTextAsync(string prompt);
        Task<string> AnalyzeImageAsync(string prompt, string base64Image, string mimeType);
        Task<int> GetRemainingRequestsAsync();
        Task<int> GetModelLimitAsync();
    }
}
