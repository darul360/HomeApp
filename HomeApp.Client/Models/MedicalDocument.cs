using System;

namespace HomeApp.Client.Models
{
    public class MedicalDocument
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [System.Text.Json.Serialization.JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("pdfBase64")]
        public string PdfBase64 { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("userId")]
        public string? UserId { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("date")]
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
