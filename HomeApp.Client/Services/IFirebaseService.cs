using System.Threading.Tasks;
using System.Collections.Generic;

namespace HomeApp.Client.Services
{
    public interface IFirebaseService
    {
        Task InitializeAsync(object config);
        Task<string> AddDocumentAsync<T>(string collection, T document);
        Task<bool> AddDocumentWithIdAsync<T>(string collection, string id, T document);
        Task<bool> DeleteDocumentAsync(string collection, string id);
        Task<List<T>> GetDocumentsAsync<T>(string collection, int limit = 20, string? filterField = null, object? filterValue = null);
        Task<string> UploadFileAsync(string path, string base64, string contentType);
        Task<string> RecognizeTextAsync(string imageUrl);
        Task<string> RecognizePdfAsync(string base64Pdf);
        Task<string> CompressPdfAsync(string base64Pdf);
        Task<string[]> ChunkStringAsync(string str, int size);
        Task<string> GetCombinedChunksAsync(string collection, string documentId, int chunkCount);
        Task<bool> DeleteChunksAsync(string collection, string documentId, int chunkCount);
        
        // Auth
        event System.Action<FirebaseUser?> OnAuthStateChanged;
        Task<FirebaseUser?> LoginWithGoogleAsync();
        Task LogoutAsync();
        Task<FirebaseUser?> GetCurrentUserAsync();
        Task<FirebaseUser?> WaitForAuthAsync();
        Task<bool> IsEmailWhitelistedAsync(string email);
    }

    public class FirebaseUser
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string PhotoUrl { get; set; } = string.Empty;
    }
}
