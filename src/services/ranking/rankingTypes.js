// rankingTypes.js
// Definition der Datenstrukturen für das WebGPU-Arena Ranking

/**
 * @typedef {Object} BenchmarkResult
 * @property {string} modelId
 * @property {string} modelName
 * @property {number} tokensPerSecond
 * @property {number} firstTokenMs
 * @property {number} totalTimeMs
 * @property {number} tokenCount
 * @property {string} timestamp
 * @property {string} deviceClass // 'mobile', 'desktop', 'tablet'
 */

/**
 * @typedef {Object} GlobalRankingPayload
 * @property {string} benchmark_version
 * @property {string} app_version
 * @property {string} model_id
 * @property {string} model_name
 * @property {number} tokens_per_second
 * @property {number} first_token_ms
 * @property {number} total_time_ms
 * @property {boolean} webgpu_supported
 * @property {string} webgpu_vendor
 * @property {string} webgpu_adapter
 * @property {string} install_id
 */
