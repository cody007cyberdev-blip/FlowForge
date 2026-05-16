/**
 * Financial APIs Node Executor
 * Integrates with financial data providers (Alpha Vantage, Binance, etc.)
 */

import axios from "axios";

export interface FinancialApisConfig {
  provider: "alpha-vantage" | "binance" | "coinmarketcap";
  apiKey: string;
  dataType: "stock" | "crypto" | "forex";
  symbol: string;
  interval?: string;
}

/**
 * Get stock data from Alpha Vantage
 */
export async function getStockData(config: { apiKey: string; symbol: string; interval?: string }) {
  try {
    const { apiKey, symbol, interval = "daily" } = config;

    if (!apiKey || !symbol) {
      throw new Error("API key and symbol are required");
    }

    const url = `https://www.alphavantage.co/query`;
    const params: any = {
      function: interval === "intraday" ? "TIME_SERIES_INTRADAY" : "TIME_SERIES_DAILY",
      symbol,
      apikey: apiKey,
    };

    if (interval === "intraday") {
      params.interval = "60min";
    }

    const response = await axios.get(url, { params, timeout: 10000 });

    if (response.data.Note) {
      throw new Error("API rate limit exceeded");
    }

    if (response.data.Error) {
      throw new Error(response.data.Error);
    }

    return {
      success: true,
      provider: "Alpha Vantage",
      symbol,
      interval,
      data: response.data,
      lastRefreshed: response.data["Meta Data"]?.["3. Last Refreshed"],
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Get crypto data from Binance
 */
export async function getCryptoData(config: { symbol: string; interval?: string }) {
  try {
    const { symbol, interval = "1d" } = config;

    if (!symbol) {
      throw new Error("Symbol is required");
    }

    // Binance doesn't require API key for public endpoints
    const url = `https://api.binance.com/api/v3/klines`;
    const params = {
      symbol: symbol.toUpperCase(),
      interval,
      limit: 100,
    };

    const response = await axios.get(url, { params, timeout: 10000 });

    // Format Binance response
    const formattedData = response.data.map((candle: any[]) => ({
      timestamp: new Date(candle[0]).toISOString(),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[7]),
    }));

    return {
      success: true,
      provider: "Binance",
      symbol,
      interval,
      data: formattedData,
      count: formattedData.length,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Get crypto market data from CoinMarketCap
 */
export async function getCryptoMarketData(config: { apiKey: string; symbol: string }) {
  try {
    const { apiKey, symbol } = config;

    if (!apiKey || !symbol) {
      throw new Error("API key and symbol are required");
    }

    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`;
    const params = {
      symbol: symbol.toUpperCase(),
      convert: "USD",
    };

    const response = await axios.get(url, {
      params,
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
      },
      timeout: 10000,
    });

    return {
      success: true,
      provider: "CoinMarketCap",
      symbol,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Calculate financial metrics
 */
export function calculateMetrics(data: any) {
  try {
    const prices = Array.isArray(data) ? data.map((d: any) => d.close || d[4]) : [];

    if (prices.length === 0) {
      throw new Error("No price data available");
    }

    const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const change = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

    return {
      average: avg,
      min,
      max,
      change: change.toFixed(2),
      dataPoints: prices.length,
    };
  } catch (error) {
    return {
      error: String(error),
    };
  }
}

/**
 * Execute Financial APIs node
 */
export async function executeFinancialApisNode(input: any, config: any) {
  try {
    const { provider, apiKey, dataType, symbol, interval } = config;

    if (provider === "alpha-vantage") {
      return await getStockData({ apiKey, symbol, interval });
    } else if (provider === "binance") {
      return await getCryptoData({ symbol, interval });
    } else if (provider === "coinmarketcap") {
      return await getCryptoMarketData({ apiKey, symbol });
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

export const financialApisExecutor = {
  execute: executeFinancialApisNode,
};
