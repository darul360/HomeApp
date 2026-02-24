using System;

namespace HomeApp.Client.Models
{
    public class TestResult
    {
        [System.Text.Json.Serialization.JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [System.Text.Json.Serialization.JsonPropertyName("testName")]
        public string TestName { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("value")]
        public double Value { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("unit")]
        public string Unit { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonPropertyName("rangeLow")]
        public double RangeLow { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("rangeHigh")]
        public double RangeHigh { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("remark")]
        public string? Remark { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("examinationTitle")]
        public string? ExaminationTitle { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("pdfUrl")]
        public string? PdfUrl { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("userId")]
        public string? UserId { get; set; }
        [System.Text.Json.Serialization.JsonPropertyName("date")]
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
