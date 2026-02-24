using System;

namespace HomeApp.Client.Models
{
    public class DocumentOcr
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty; // Linked to ScannedDocument.Id
        [System.Text.Json.Serialization.JsonPropertyName("fullText")]
        public string FullText { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;
    }
}
