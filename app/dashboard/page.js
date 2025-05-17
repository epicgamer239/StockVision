// pages/dashboard.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '../../components/TopBar';
import GeminiAssistant from "../../components/GeminiAssistant";
import Link from 'next/link';

const TICKERS = [
  'AAPL','MSFT','GOOGL','AMZN','META',
  'TSLA','NVDA','NFLX','INTC','AMD',
  'BABA','V','MA','JPM','DIS',
  'PYPL','ADBE','CRM','PEP','KO'
];
const API_KEY = "rqqDz3eGWiEt9jsIfKt9QtRKZCaBi6Ay"; // Your FMP API Key

export default function DashboardPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStocks() {
      setLoading(true);
      setError(null);
      try {
        if (API_KEY === "YOUR_FMP_API_KEY_HERE" || !API_KEY) {
            console.warn("FMP API Key is placeholder or not set. Dashboard will show limited/mock data or an error.");
            setError("API Key not configured. Displaying limited information.");
            setStocks([]);
            setLoading(false);
            return;
        }

        const symbols = TICKERS.join(',');
        const res = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${API_KEY}`
        );
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`API request failed: ${res.status} - ${errorData.message || res.statusText}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
            setStocks(data);
        } else {
            console.error('Unexpected data format received:', data);
            setStocks([]);
            setError('Failed to load stock data due to unexpected format.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load stock data.');
        setStocks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStocks();
  }, []);

  const gainers = stocks.filter((s) => s.change > 0).length;
  const losers = stocks.filter((s) => s.change < 0).length;
  const avgChange = stocks.length && stocks.every(s => typeof s.changesPercentage === 'number')
    ? (stocks.reduce((sum, s) => sum + s.changesPercentage, 0) / stocks.length).toFixed(2)
    : '0.00';

  const apiKeyIsPlaceholder = API_KEY === "YOUR_FMP_API_KEY_HERE" || API_KEY === "SMQhDiA7A8IGlIGYWTFBAkijzPKuK2WR" || !API_KEY;


  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <div className="p-6 container mx-auto">
        {/* Page Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Market Overview Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
            Get a real-time snapshot of key market indicators and stock performance.
            Powered by live data from Financial Modeling Prep API.
          </p>
        </header>
        
        {error && !loading && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md text-center">
                <p><strong>Error:</strong> {error}</p>
                <p>Please check your API configuration or network connection.</p>
            </div>
        )}


        {/* Summary Cards Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center sm:text-left">Market Pulse</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-5 rounded-lg shadow-md border border-slate-200">
              <h4 className="text-sm uppercase font-medium text-gray-500">Total Stocks Tracked</h4>
              <p className="text-3xl font-bold text-indigo-600">{loading ? '...' : stocks.length}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-lg shadow-md border border-slate-200">
              <h4 className="text-sm uppercase font-medium text-gray-500">Gainers Today</h4>
              <p className="text-3xl font-bold text-green-600">{loading ? '...' : gainers}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-lg shadow-md border border-slate-200">
              <h4 className="text-sm uppercase font-medium text-gray-500">Losers Today</h4>
              <p className="text-3xl font-bold text-red-600">{loading ? '...' : losers}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-lg shadow-md border border-slate-200">
              <h4 className="text-sm uppercase font-medium text-gray-500">Avg. Change %</h4>
              <p
                className={`text-3xl font-bold ${
                  loading ? 'text-gray-700' : (parseFloat(avgChange) >= 0 ? 'text-green-600' : 'text-red-600')
                }`}
              >
                {loading ? '...' : `${avgChange}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/chronos">
              <button
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Explore Chronos Forecaster
              </button>
            </Link>
            <Link href="/recommendations">
              <button
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
              >
                View AI Recommendations
              </button>
            </Link>
        </div>


        {/* Stock Table Section */}
        <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center sm:text-left">Detailed Stock Performance</h2>
            {loading ? (
              <div className="text-center text-gray-500 py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-xl">Loading live stock data...</p>
              </div>
            ) : !stocks.length && !error ? (
              <p className="text-center text-gray-600 py-10 text-lg">No stock data available to display.</p>
            ) : stocks.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full table-auto rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      {['Symbol', 'Name', 'Price', 'Change', '% Change', 'Volume'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-sm">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stocks.map((s, i) => (
                      <tr
                        key={s.symbol}
                        className="hover:bg-indigo-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{s.symbol}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">${s.price ? s.price.toFixed(2) : 'N/A'}</td>
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                            s.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {s.change >= 0 ? `+${s.change ? s.change.toFixed(2) : '0.00'}` : (s.change ? s.change.toFixed(2) : '0.00')}
                        </td>
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                            s.changesPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {s.changesPercentage >= 0
                            ? `+${s.changesPercentage ? s.changesPercentage.toFixed(2) : '0.00'}%`
                            : `${s.changesPercentage ? s.changesPercentage.toFixed(2) : '0.00'}%`}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.volume ? s.volume.toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
      <GeminiAssistant />
    </div>
  );
}