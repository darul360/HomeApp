using System;

namespace HomeApp.Client.Models
{
    public class DocumentTag
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [System.Text.Json.Serialization.JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("color")]
        public string Color { get; set; } = "#007bff"; // Default blue
        [System.Text.Json.Serialization.JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;
    }
}
