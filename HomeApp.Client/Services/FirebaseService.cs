using Microsoft.JSInterop;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace HomeApp.Client.Services
{
    public class FirebaseService : IFirebaseService
    {
        private readonly IJSRuntime _jsRuntime;
        public event Action<FirebaseUser?> OnAuthStateChanged = delegate { };

        public FirebaseService(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
        }

        public async Task InitializeAsync(object config)
        {
            await _jsRuntime.InvokeVoidAsync("firebaseService.init", config);
            
            // Register callback for auth state changes
            var dotNetObjRef = DotNetObjectReference.Create(this);
            await _jsRuntime.InvokeVoidAsync("firebaseService.registerAuthHandler", dotNetObjRef);
        }

        [JSInvokable]
        public void NotifyAuthStateChanged(FirebaseUser? user)
        {
            OnAuthStateChanged?.Invoke(user);
        }

        public async Task<string> AddDocumentAsync<T>(string collection, T document)
        {
             return await _jsRuntime.InvokeAsync<string>("firebaseService.addDocument", collection, document);
        }

        public async Task<bool> AddDocumentWithIdAsync<T>(string collection, string id, T document)
        {
            return await _jsRuntime.InvokeAsync<bool>("firebaseService.addDocumentWithId", collection, id, document);
        }

        public async Task<bool> DeleteDocumentAsync(string collection, string id)
        {
            try 
            {
                await _jsRuntime.InvokeVoidAsync("firebaseService.deleteDocument", collection, id);
                return true;
            }
            catch 
            {
                return false;
            }
        }

        public async Task<List<T>> GetDocumentsAsync<T>(string collection, int limit = 20, string? filterField = null, object? filterValue = null)
        {
            object? filter = null;
            if (filterField != null && filterValue != null)
            {
                filter = new { field = filterField, value = filterValue };
            }

            var result = await _jsRuntime.InvokeAsync<IEnumerable<T>>("firebaseService.getDocuments", collection, limit, filter);
             return new List<T>(result);
        }

        public async Task<string> UploadFileAsync(string path, string base64, string contentType)
        {
            return await _jsRuntime.InvokeAsync<string>("firebaseService.uploadFile", path, base64, contentType);
        }

        public async Task<string> RecognizeTextAsync(string imageUrl)
        {
             return await _jsRuntime.InvokeAsync<string>("firebaseService.recognizeText", imageUrl);
        }

        public async Task<string> CompressPdfAsync(string base64Pdf)
        {
            return await _jsRuntime.InvokeAsync<string>("firebaseService.compressPdf", base64Pdf);
        }

        public async Task<string> RecognizePdfAsync(string base64Pdf)
        {
            return await _jsRuntime.InvokeAsync<string>("firebaseService.recognizePdf", base64Pdf);
        }

        public async Task<string[]> ChunkStringAsync(string str, int size)
        {
            return await _jsRuntime.InvokeAsync<string[]>("firebaseService.chunkString", str, size);
        }

        public async Task<string> GetCombinedChunksAsync(string collection, string documentId, int chunkCount)
        {
            return await _jsRuntime.InvokeAsync<string>("firebaseService.getCombinedChunks", collection, documentId, chunkCount);
        }

        public async Task<bool> DeleteChunksAsync(string collection, string documentId, int chunkCount)
        {
            try 
            {
                await _jsRuntime.InvokeVoidAsync("firebaseService.deleteChunks", collection, documentId, chunkCount);
                return true;
            }
            catch 
            {
                return false;
            }
        }

        public async Task<bool> IsEmailWhitelistedAsync(string email)
        {
            if (string.IsNullOrEmpty(email)) return false;
            
            var result = await GetDocumentsAsync<System.Text.Json.JsonElement>(
                "whitelist", 
                limit: 1, 
                filterField: "email", 
                filterValue: email.ToLower().Trim());
            
            return result.Count > 0;
        }

        public async Task<FirebaseUser?> LoginWithGoogleAsync()
        {
            return await _jsRuntime.InvokeAsync<FirebaseUser?>("firebaseService.signInWithGoogle");
        }

        public async Task LogoutAsync()
        {
            await _jsRuntime.InvokeVoidAsync("firebaseService.signOut");
        }

        public async Task<FirebaseUser?> GetCurrentUserAsync()
        {
            return await _jsRuntime.InvokeAsync<FirebaseUser?>("firebaseService.getCurrentUser");
        }

        public async Task<FirebaseUser?> WaitForAuthAsync()
        {
            return await _jsRuntime.InvokeAsync<FirebaseUser?>("firebaseService.waitForAuth");
        }
    }
}
