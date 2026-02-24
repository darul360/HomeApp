window.geminiService = {
    model: null,
    modelName: null,
    modelLimit: 1500, // Default for Flash
    refreshHandler: null,

    init: async function (apiKey) {
        this.apiKey = apiKey;

        // Wait for ESM module to populate the window object (max 5 seconds)
        let retries = 0;
        while (!window.GoogleGenerativeAI && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        this.modelName = "gemma-3-12b-it";
        this.modelLimit = 14400; // Updated from user info: 14.4k RPD

        console.log("Gemma 3 AI initialized (Direct Fetch Mode)");
    },

    analyzeText: async function (prompt) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
            const body = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            this._handleHeaders(response.headers);

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini Error: ", error);
            throw error;
        }
    },

    analyzeImage: async function (prompt, base64Image, mimeType) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
            const body = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { data: base64Image, mimeType: mimeType } }
                    ]
                }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            this._handleHeaders(response.headers);

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini Error: ", error);
            throw error;
        }
    },

    _handleHeaders: function (headers) {
        // Log all headers for debugging (optional, for developer console)
        console.log("Gemini API Headers:", Object.fromEntries(headers.entries()));

        // Prioritize Daily Limit (RPD) headers
        const limitRPD = headers.get('x-ratelimit-limit-requests-per-day');
        const remainingRPD = headers.get('x-ratelimit-remaining-requests-per-day');

        // Fallback to general headers
        const limitGen = headers.get('x-ratelimit-limit') || headers.get('x-ratelimit-limit-requests');
        const remainingGen = headers.get('x-ratelimit-remaining') || headers.get('x-ratelimit-remaining-requests');

        let limitVal = limitRPD ? parseInt(limitRPD) : (limitGen ? parseInt(limitGen) : null);
        let remainingVal = remainingRPD ? parseInt(remainingRPD) : (remainingGen ? parseInt(remainingGen) : null);

        if (limitVal !== null && remainingVal !== null) {
            // Only update RPD tracking if the limit looks like a daily limit (usually > 100)
            // or if we explicitly found the -per-day headers.
            if (limitRPD || limitVal >= 100) {
                this.modelLimit = limitVal;
                const used = limitVal - remainingVal;

                const stats = {
                    count: used,
                    limit: limitVal,
                    lastUpdate: new Date().toDateString()
                };
                localStorage.setItem('gemini_stats_' + this.modelName, JSON.stringify(stats));
                console.log(`Updated RPD from headers: ${used} / ${limitVal}`);
            } else {
                // It was likely an RPM header, just increment local counter
                this._incrementLocalUsage();
            }

            if (this.refreshHandler) {
                this.refreshHandler.invokeMethodAsync('RefreshTokens');
            }
        } else {
            // No relevant headers found, fallback to local tracking
            this._incrementLocalUsage();
        }
    },

    _incrementLocalUsage: function () {
        const stats = this._getStats();
        stats.count++;
        stats.lastUpdate = new Date().toDateString();
        localStorage.setItem('gemini_stats_' + this.modelName, JSON.stringify(stats));
        if (this.refreshHandler) {
            this.refreshHandler.invokeMethodAsync('RefreshTokens');
        }
    },

    getRemainingRequests: function () {
        const stats = this._getStats();
        if (stats.limit) this.modelLimit = stats.limit;
        return Math.max(0, this.modelLimit - stats.count);
    },

    getModelLimit: function () {
        return this.modelLimit;
    },

    _trackTokenUsage: function () {
        const stats = this._getStats();
        stats.count++;
        stats.lastUpdate = new Date().toDateString();
        localStorage.setItem('gemini_stats_' + this.modelName, JSON.stringify(stats));

        // Notify Blazor if handler is registered
        if (this.refreshHandler) {
            this.refreshHandler.invokeMethodAsync('RefreshTokens');
        }
    },

    registerRefreshHandler: function (handler) {
        this.refreshHandler = handler;
    },

    _getStats: function () {
        const defaultStats = { count: 0, limit: this.modelLimit, lastUpdate: new Date().toDateString() };
        const stored = localStorage.getItem('gemini_stats_' + this.modelName);
        if (!stored) return defaultStats;

        const stats = JSON.parse(stored);
        if (stats.lastUpdate !== new Date().toDateString()) {
            return defaultStats;
        }
        return stats;
    }
};
