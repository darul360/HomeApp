using System;

namespace HomeApp.Client.Models
{
    public class DocumentChunk
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty; // Format: DocumentId_Index
        [System.Text.Json.Serialization.JsonPropertyName("documentId")]
        public string DocumentId { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("index")]
        public int Index { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("data")]
        public string Data { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;
    }
}
