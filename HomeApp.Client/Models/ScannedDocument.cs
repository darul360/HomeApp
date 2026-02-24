using System;

namespace HomeApp.Client.Models
{
    public class ScannedDocument
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [System.Text.Json.Serialization.JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("chunkCount")]
        public int ChunkCount { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("fileName")]
        public string FileName { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("tagIds")]
        public List<string> TagIds { get; set; } = new();
        [System.Text.Json.Serialization.JsonPropertyName("contentType")]
        public string ContentType { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("uploadedDate")]
        public DateTime UploadedDate { get; set; } = DateTime.Now;
    }
}
