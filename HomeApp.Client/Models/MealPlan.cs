using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HomeApp.Client.Models
{
    public class MealPlan
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("ingredients")]
        public string Ingredients { get; set; } = string.Empty;

        [JsonPropertyName("preferences")]
        public string Preferences { get; set; } = string.Empty;

        [JsonPropertyName("days")]
        public int Days { get; set; } = 1;

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty; // Markdown or structured text

        [JsonPropertyName("isFavorite")]
        public bool IsFavorite { get; set; } = false;

        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
