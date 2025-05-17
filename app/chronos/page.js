// src/chronos/page.js
"use client"

import React, { useState, useEffect } from 'react';
import TopBar from "../../components/TopBar";
import Link from 'next/link';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale );


const FMP_API_KEY = "rqqDz3eGWiEt9jsIfKt9QtRKZCaBi6Ay"; // THE FMP API Key
const FMP_API_BASE_URL = "https://financialmodelingprep.com/api/v3";

const PATTERN_LENGTH = 30;
const OUTCOME_LENGTH = 7;
const MIN_ECHOES_TO_FIND = 2;
const MAX_ECHOES_TO_FIND = 4;
const ECHO_AVOID_RECENT_BUFFER = 15;
const SIMILARITY_BASE = 0.60;
const SIMILARITY_RANGE = 0.35;
const OPTIMISTIC_THRESHOLD = 0.66;
const PESSIMISTIC_THRESHOLD = 0.33;
const BASE_HISTORICAL_YEARS = 3;
const DAYS_IN_YEAR = 365;
const TOTAL_DAYS_TO_GENERATE_HISTORY = (DAYS_IN_YEAR * BASE_HISTORICAL_YEARS) + PATTERN_LENGTH + OUTCOME_LENGTH + ECHO_AVOID_RECENT_BUFFER + 50;

const generateHistoricalPrices = (basePrice, volatility, trend, days, endDate = new Date()) => {
    const prices = [];
    let currentPrice = basePrice;
    const minPrice = Math.max(1, basePrice * 0.2);
    for (let i = 0; i < days; i++) {
        const date = new Date(endDate);
        date.setDate(endDate.getDate() - (days - 1 - i));
        prices.push({ x: date, y: parseFloat(currentPrice.toFixed(2)) });
        let nextPrice = currentPrice * (1 + trend + (Math.random() - 0.5) * volatility);
        currentPrice = Math.max(minPrice, nextPrice);
    }
    return prices;
};

const stockDataStore = {
    'AAPL':  { name: 'Apple Inc.',                historicalDailyPrices: generateHistoricalPrices(170, 0.025, 0.0003, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'MSFT':  { name: 'Microsoft Corp.',           historicalDailyPrices: generateHistoricalPrices(400, 0.022, 0.0004, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'GOOGL': { name: 'Alphabet Inc. (Class A)', historicalDailyPrices: generateHistoricalPrices(150, 0.028, 0.00035,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'AMZN':  { name: 'Amazon.com, Inc.',          historicalDailyPrices: generateHistoricalPrices(180, 0.03,  0.00025,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'NVDA':  { name: 'NVIDIA Corp.',              historicalDailyPrices: generateHistoricalPrices(900, 0.05,  0.0009, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'TSLA':  { name: 'Tesla, Inc.',               historicalDailyPrices: generateHistoricalPrices(175, 0.045, 0.0005, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'META':  { name: 'Meta Platforms, Inc.',      historicalDailyPrices: generateHistoricalPrices(480, 0.035, 0.0004, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'BRK-B': { name: 'Berkshire Hathaway (B)',    historicalDailyPrices: generateHistoricalPrices(400, 0.015, 0.0002, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'JPM':   { name: 'JPMorgan Chase & Co.',      historicalDailyPrices: generateHistoricalPrices(190, 0.018, 0.00015,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'V':     { name: 'Visa Inc.',                 historicalDailyPrices: generateHistoricalPrices(270, 0.017, 0.0003, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'JNJ':   { name: 'Johnson & Johnson',         historicalDailyPrices: generateHistoricalPrices(160, 0.013, 0.0001, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'WMT':   { name: 'Walmart Inc.',              historicalDailyPrices: generateHistoricalPrices(60,  0.016, 0.00012,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'PG':    { name: 'Procter & Gamble Co.',      historicalDailyPrices: generateHistoricalPrices(160, 0.012, 0.0001, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'MA':    { name: 'Mastercard Inc.',           historicalDailyPrices: generateHistoricalPrices(450, 0.020, 0.00035,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'HD':    { name: 'The Home Depot, Inc.',      historicalDailyPrices: generateHistoricalPrices(380, 0.019, 0.0002, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'DIS':   { name: 'The Walt Disney Company',   historicalDailyPrices: generateHistoricalPrices(110, 0.026, 0.00005,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'NFLX':  { name: 'Netflix, Inc.',             historicalDailyPrices: generateHistoricalPrices(600, 0.038, 0.00045,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'PFE':   { name: 'Pfizer Inc.',               historicalDailyPrices: generateHistoricalPrices(28,  0.023, -0.00005,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'KO':    { name: 'The Coca-Cola Company',     historicalDailyPrices: generateHistoricalPrices(60,  0.011, 0.00008,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'MCD':   { name: 'McDonald\'s Corporation',   historicalDailyPrices: generateHistoricalPrices(280, 0.014, 0.00013,TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'COST':  { name: 'Costco Wholesale Corp.',    historicalDailyPrices: generateHistoricalPrices(700, 0.018, 0.0004, TOTAL_DAYS_TO_GENERATE_HISTORY) },
    'ADBE':  { name: 'Adobe Inc.',                historicalDailyPrices: generateHistoricalPrices(500, 0.030, 0.0003, TOTAL_DAYS_TO_GENERATE_HISTORY) },
};

const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;
const formatPercentage = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
};

const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: { type: 'time', time: { unit: 'day', tooltipFormat: 'MMM dd', displayFormats: {day: 'MMM dd'} }, grid: { display: false }, ticks: { display: false, maxRotation: 0, autoSkip: true, padding: 5, font: {size: 8} } },
        y: { grid: { color: 'rgba(200, 200, 200, 0.1)' }, ticks: { display: false, padding: 5, font: {size: 8} } }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true, mode: 'index', intersect: false,
            callbacks: {
                title: function(context) { if(context[0]) return new Date(context[0].parsed.x).toLocaleDateString(); return ''; },
                label: function(context) { if(context.parsed) return `Price: ${formatCurrency(context.parsed.y)}`; return '';}
            }
        }
    },
    elements: { line: { tension: 0.1, borderWidth: 1.5 }, point: { radius: 0 } }
};


export default function ChronosPage() {
  const [selectedStockTicker, setSelectedStockTicker] = useState(Object.keys(stockDataStore)[0]);
  const [currentStockInfo, setCurrentStockInfo] = useState({
    ticker: selectedStockTicker,
    name: stockDataStore[selectedStockTicker]?.name || 'Unknown',
    currentPrice: null,
    priceSource: 'Fetching...'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPatternChartData, setCurrentPatternChartData] = useState({ datasets: [] });
  const [foundEchoes, setFoundEchoes] = useState([]);
  const [chronosSentiment, setChronosSentiment] = useState({
    text: 'Calculating...',
    color: 'text-gray-500',
    confidenceValue: 0,
    confidenceText: 'N/A'
  });

  useEffect(() => {
    if (!selectedStockTicker || !stockDataStore[selectedStockTicker]) {
        setIsLoading(false);
        setCurrentStockInfo(prev => ({
            ...prev,
            ticker: selectedStockTicker || '',
            name: selectedStockTicker ? (stockDataStore[selectedStockTicker]?.name || 'Unknown Ticker') : 'Select a Stock',
            currentPrice: null,
            priceSource: selectedStockTicker ? 'Data Error' : 'N/A'
        }));
        setCurrentPatternChartData({ datasets: [] });
        setFoundEchoes([]);
        setChronosSentiment({ text: 'N/A', color: 'text-gray-500', confidenceValue: 0, confidenceText: 'N/A' });
        console.warn("Selected stock ticker not found in data store or selection is invalid.");
        return;
    }

    setIsLoading(true);
    setCurrentStockInfo(prev => ({
        ...prev,
        ticker: selectedStockTicker,
        name: stockDataStore[selectedStockTicker]?.name || 'Unknown Stock',
        currentPrice: null,
        priceSource: 'Fetching...'
    }));
    setCurrentPatternChartData({ datasets: [] });
    setFoundEchoes([]);
    setChronosSentiment({ text: 'Calculating...', color: 'text-gray-500', confidenceValue: 0, confidenceText: 'N/A' });

    console.log(`EFFECT: Processing forecast for ${selectedStockTicker}...`);

    async function fetchRealPriceAndProcess() {
        let fetchedPrice = null;
        let priceSourceMessage = 'Estimate (API Error)'; // Default for API error

        if (FMP_API_KEY === "YOUR_FMP_API_KEY_HERE" || !FMP_API_KEY) { // Check if the demo key is still there
            console.warn("FMP API Key not set. Using estimated current price.");
            priceSourceMessage = 'Estimate (API Key Missing)';
            const lastHistoricalPriceObj = stockDataStore[selectedStockTicker]?.historicalDailyPrices.slice(-1)[0];
            fetchedPrice = lastHistoricalPriceObj ? lastHistoricalPriceObj.y : (Math.random() * 200 + 50);
        } else {
            try {
                const response = await fetch(`${FMP_API_BASE_URL}/quote-short/${selectedStockTicker}?apikey=${FMP_API_KEY}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`API request failed: ${response.status} - ${errorData['Error Message'] || response.statusText}`);
                }
                const data = await response.json();
                if (data && data.length > 0 && typeof data[0].price === 'number') {
                    fetchedPrice = data[0].price;
                    priceSourceMessage = 'Live (FMP API)';
                } else {
                     console.warn(`Price not found in FMP API response for ${selectedStockTicker} or invalid data format. Data:`, data);
                    throw new Error("Price not found in FMP API response or invalid data format.");
                }
            } catch (error) {
                console.error(`Error fetching real stock price for ${selectedStockTicker}:`, error);
                const lastHistoricalPriceObj = stockDataStore[selectedStockTicker]?.historicalDailyPrices.slice(-1)[0];
                fetchedPrice = lastHistoricalPriceObj ? lastHistoricalPriceObj.y : (Math.random() * 200 + 50);
                priceSourceMessage = `Estimate (API Error: ${error.message.substring(0,30)}...)`;
            }
        }

        setCurrentStockInfo(prev => ({
            ...prev,
            currentPrice: fetchedPrice,
            priceSource: priceSourceMessage
        }));

        const stockHistData = stockDataStore[selectedStockTicker];
        if (!stockHistData || !stockHistData.historicalDailyPrices) {
            setIsLoading(false);
            console.error("Historical data missing for stock:", selectedStockTicker);
            setChronosSentiment({ text: 'Data Error', color: 'text-red-500', confidenceValue: 0, confidenceText: 'N/A' });
            return;
        }
        const allHistoricalPrices = stockHistData.historicalDailyPrices;

        if (allHistoricalPrices.length < PATTERN_LENGTH) {
            setIsLoading(false);
            console.error("Not enough HISTORICAL data for current pattern for", selectedStockTicker);
            setChronosSentiment({ text: 'Insufficient Historical Data', color: 'text-yellow-500', confidenceValue: 0, confidenceText: 'N/A' });
            return;
        }

        const currentPatternPoints = allHistoricalPrices.slice(-PATTERN_LENGTH);
        setCurrentPatternChartData({
            datasets: [{ label: 'Recent Pattern', data: currentPatternPoints, borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: 'start' }]
        });

        const echoes = [];
        const historyToSearch = allHistoricalPrices.slice(0, allHistoricalPrices.length - PATTERN_LENGTH - ECHO_AVOID_RECENT_BUFFER);
        let upwardOutcomes = 0;
        const numEchoesToAttempt = Math.floor(Math.random() * (MAX_ECHOES_TO_FIND - MIN_ECHOES_TO_FIND + 1)) + MIN_ECHOES_TO_FIND;
        let echoesFoundCount = 0;
        if (historyToSearch.length >= (PATTERN_LENGTH + OUTCOME_LENGTH)) {
            for (let attempt = 0; attempt < numEchoesToAttempt * 3 && echoesFoundCount < numEchoesToAttempt; attempt++) {
              const maxStartIndex = historyToSearch.length - (PATTERN_LENGTH + OUTCOME_LENGTH);
              if (maxStartIndex < 0) break;
              const randomIndex = Math.floor(Math.random() * (maxStartIndex + 1));
              const historicalPatternSlice = historyToSearch.slice(randomIndex, randomIndex + PATTERN_LENGTH);
              const futureOutcomeSlice = historyToSearch.slice(randomIndex + PATTERN_LENGTH, randomIndex + PATTERN_LENGTH + OUTCOME_LENGTH);

              if (historicalPatternSlice.length === PATTERN_LENGTH && futureOutcomeSlice.length === OUTCOME_LENGTH && historicalPatternSlice[0] && futureOutcomeSlice[0]) {
                  const outcomeStartPrice = futureOutcomeSlice[0].y;
                  const outcomeEndPrice = futureOutcomeSlice[futureOutcomeSlice.length - 1].y;
                  let outcomeColor = 'rgb(156, 163, 175)';
                  if (outcomeEndPrice > outcomeStartPrice) { upwardOutcomes++; outcomeColor = 'rgb(16, 185, 129)'; }
                  else if (outcomeEndPrice < outcomeStartPrice) { outcomeColor = 'rgb(239, 68, 68)';}
                  echoes.push({
                    id: `echo-${echoesFoundCount}-${selectedStockTicker}`,
                    similarityScore: SIMILARITY_BASE + (Math.random() * SIMILARITY_RANGE),
                    historicalDateRange: `${new Date(historicalPatternSlice[0].x).toLocaleDateString()} - ${new Date(historicalPatternSlice[PATTERN_LENGTH-1].x).toLocaleDateString()}`,
                    historicalPatternData: { datasets: [{ data: historicalPatternSlice, borderColor: 'rgb(107, 114, 128)', fill: false, label: `Hist. Echo ${echoesFoundCount+1}` }] },
                    futureOutcomeData: { datasets: [{ data: futureOutcomeSlice, borderColor: outcomeColor, fill: false, label: `Outcome ${echoesFoundCount+1}` }] }
                  });
                  echoesFoundCount++;
              }
            }
        }
        setFoundEchoes(echoes);

        const randomConfidenceValue = 0.55 + Math.random() * 0.40;
        let confidenceText = "Moderate";
        if (randomConfidenceValue > 0.85) confidenceText = "High";
        else if (randomConfidenceValue < 0.65) confidenceText = "Low";

        if (echoes.length > 0) {
            const upwardRatio = upwardOutcomes / echoes.length;
            if (upwardRatio > OPTIMISTIC_THRESHOLD) setChronosSentiment({ text: 'Optimistic', color: 'text-green-500', confidenceValue: randomConfidenceValue, confidenceText });
            else if (upwardRatio < PESSIMISTIC_THRESHOLD) setChronosSentiment({ text: 'Pessimistic', color: 'text-red-500', confidenceValue: randomConfidenceValue, confidenceText });
            else setChronosSentiment({ text: 'Neutral', color: 'text-yellow-500', confidenceValue: randomConfidenceValue, confidenceText });
        } else if (allHistoricalPrices.length >= PATTERN_LENGTH) {
            setChronosSentiment({ text: 'Indeterminate', color: 'text-gray-500', confidenceValue: 0, confidenceText: "N/A" });
        }
        setIsLoading(false);
        console.log("EFFECT: Price processed. Echoes found:", echoes.length, "for", selectedStockTicker);
    }

    const processingTimer = setTimeout(fetchRealPriceAndProcess, 300);

    return () => clearTimeout(processingTimer);

  }, [selectedStockTicker]);


  const handleStockSelect = (event) => {
    setSelectedStockTicker(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <div className="p-6 container mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Chronos Forecaster</h1>
          <p className="text-lg text-gray-600 mt-2">
            Exploring potential futures by finding echoes from the <strong className="text-indigo-600">past</strong>,
            with a touch of <strong className="text-teal-600">real-time pricing</strong>.
          </p>
           {/* Button to Recommendations Page */}
          <div className="mt-4">
            <Link href="/recommendations">
              <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2.5 px-5 rounded-full shadow-md transition-all duration-300 transform hover:scale-105">
                View Recommendations (Statistically Modeled)
              </button>
            </Link>
          </div>
        </div>

        {FMP_API_KEY === "YOUR_FMP_API_KEY_HERE" && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md text-sm">
                <strong>Note:</strong> Live pricing API key is not set. Current prices will be estimates.
            </div>
        )}

        {/* About Chronos */}
        <div className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-lg shadow text-sm text-gray-700">
            <h3 className="font-semibold text-sky-700 mb-1">About the Chronos Forecaster</h3>
            <p className="leading-relaxed">
                The Chronos Forecaster employs a proprietary Temporal Statistical Echoing™ algorithm.
                It scans historical data to find periods exhibiting similar market behavior to the present.
                By analyzing the outcomes of these "historical echoes," Chronos offers a glimpse into potential future trajectories.
                The current price displayed is fetched from a live data source (Financial Modeling Prep API).
            </p>
        </div>

        {/* Stock Selection Area */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col sm:flex-row items-center justify-center gap-4">
          <label htmlFor="stock-selector" className="text-md font-medium text-gray-700">Select Stock:</label>
          <select
            id="stock-selector"
            value={selectedStockTicker}
            onChange={handleStockSelect}
            disabled={isLoading}
            className={`block w-full sm:w-auto text-lg rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2 ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {Object.keys(stockDataStore).map(ticker => (
              <option key={ticker} value={ticker}>{stockDataStore[ticker].name} ({ticker})</option>
            ))}
          </select>
          {isLoading && (
            <div className="flex items-center text-blue-600" aria-live="polite" aria-busy="true">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Forecasting...
            </div>
          )}
        </div>

        {/*Chronos Forecast Summary*/}
        {!isLoading && currentStockInfo && currentStockInfo.currentPrice !== null && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow text-center">
                <p className="text-md text-gray-700 leading-relaxed">
                    Forecast for <strong className="text-blue-700">{selectedStockTicker}</strong> (Current Price: {formatCurrency(currentStockInfo.currentPrice)} - <em className="text-xs">{currentStockInfo.priceSource}</em>, as of {new Date().toLocaleDateString()}):
                    The Chronos Forecaster's analysis shows a <strong className={chronosSentiment.color}>{chronosSentiment.text.toLowerCase()}</strong> outlook.
                    {chronosSentiment.confidenceText !== "N/A" && chronosSentiment.confidenceValue > 0 && (
                        <span>
                            {" "}Chronos Confidence: <strong className={chronosSentiment.color}>{chronosSentiment.confidenceText} ({formatPercentage(chronosSentiment.confidenceValue)})</strong>.
                        </span>
                    )}
                    {foundEchoes.length > 0 && (
                        <span>
                           {" "}Historical <strong className="text-indigo-600">patterns</strong> suggest a potential for
                            {(() => {
                                let totalOutcomeDelta = 0;
                                let positiveOutcomesCount = 0;
                                foundEchoes.forEach(echo => {
                                    if (echo.futureOutcomeData.datasets[0].data.length > 0) {
                                        const startPrice = echo.futureOutcomeData.datasets[0].data[0].y;
                                        const endPrice = echo.futureOutcomeData.datasets[0].data[echo.futureOutcomeData.datasets[0].data.length - 1].y;
                                        if (endPrice > startPrice) positiveOutcomesCount++;
                                        totalOutcomeDelta += (endPrice - startPrice);
                                    }
                                });
                                const averageOutcomeDelta = foundEchoes.length > 0 ? totalOutcomeDelta / foundEchoes.length : 0;
                                const chanceOfGain = foundEchoes.length > 0 ? (positiveOutcomesCount / foundEchoes.length) * 100 : 0;

                                if (averageOutcomeDelta > 0.005) {
                                    return (<> an average gain of <strong className="text-green-600">{formatCurrency(averageOutcomeDelta)}</strong> over the next {OUTCOME_LENGTH} days, with approx. <strong className="text-green-600">{chanceOfGain.toFixed(0)}%</strong> chance of positive returns based on these echoes.</>);
                                } else if (averageOutcomeDelta < -0.005) {
                                    return (<> an average loss of <strong className="text-red-600">{formatCurrency(Math.abs(averageOutcomeDelta))}</strong> over the next {OUTCOME_LENGTH} days, with approx. <strong className="text-red-600">{(100 - chanceOfGain).toFixed(0)}%</strong> chance of negative returns.</>);
                                } else {
                                    return " a relatively flat movement in the near term (based on echoes).";
                                }
                            })()}
                        </span>
                    )}
                     {foundEchoes.length === 0 && chronosSentiment.text !== 'Calculating...' && chronosSentiment.text !== 'N/A' && !chronosSentiment.text.toLowerCase().includes("error") && (
                        <span> However, not enough distinct <strong className="text-indigo-600">historical</strong> echoes were found to provide a confident projection.</span>
                    )}
                </p>
            </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-6 bg-gray-50 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              {currentStockInfo.name ? `${currentStockInfo.name} (${currentStockInfo.ticker})` : (isLoading ? "Loading..." : (selectedStockTicker ? "Data Error" : "Select a Stock"))}
            </h2>
            {currentStockInfo.currentPrice !== null && (
              <p className="text-lg text-blue-600 font-medium mb-1">
                Current Price: {formatCurrency(currentStockInfo.currentPrice)}
                <span className="text-xs text-gray-500 ml-2">({currentStockInfo.priceSource})</span>
              </p>
            )}
             {isLoading && currentStockInfo.currentPrice === null && (
                <p className="text-lg text-gray-400 font-medium mb-1">Fetching current price...</p>
            )}
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">Chronos Sentiment: </span>
                <span className={`font-semibold ${chronosSentiment.color}`}>{chronosSentiment.text}</span>
                 {chronosSentiment.confidenceText !== "N/A" && chronosSentiment.confidenceValue > 0 && (
                    <span className="text-xs text-gray-500"> (Confidence: {chronosSentiment.confidenceText} - {formatPercentage(chronosSentiment.confidenceValue)})</span>
                )}
            </div>
            <h3 className="text-md font-medium text-gray-700 mb-1">Recent <strong className="text-indigo-600"></strong> Performance ({PATTERN_LENGTH} Data Points)</h3>
            <div className="h-64">
              {currentPatternChartData.datasets && currentPatternChartData.datasets.length > 0 && currentPatternChartData.datasets[0].data.length > 0 ? (
                <Line options={commonChartOptions} data={currentPatternChartData} />
              ) : !isLoading && selectedStockTicker && currentStockInfo.currentPrice !== null ? (
                <div className="flex items-center justify-center h-full text-gray-400 italic">No pattern data available.</div>
              ): isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400 italic">Loading pattern...</div>
              ) : null}
            </div>
          </div>

          {/* Found Echoes Display */}
          <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4"><strong className="text-indigo-600"></strong> Historical Echoes & Potential Futures</h2>
            {isLoading ? (
                 <div className="flex items-center justify-center h-full text-gray-500 italic py-10">Searching for temporal echoes...</div>
            ) : foundEchoes.length > 0 ? (
                <div className="space-y-6">
                    {foundEchoes.map(echo => (
                        <div key={echo.id} className="p-3 border border-gray-200 rounded-md bg-gray-50 shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out">
                            <h4 className="text-sm font-semibold text-gray-700">
                                Echo from: <span className="font-normal">{echo.historicalDateRange}</span>
                                <span className="text-xs text-gray-600"> (Est. Similarity: {formatPercentage(echo.similarityScore)})</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5 text-center">Historical Pattern</p>
                                    <div className="h-32">
                                        {echo.historicalPatternData.datasets?.length > 0 ? (
                                            <Line options={commonChartOptions} data={echo.historicalPatternData} />
                                        ): <p className="text-xs text-center italic text-gray-400 pt-12">No data</p>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5 text-center">Subsequent Outcome ({echo.futureOutcomeData.datasets[0].data.length} Days)</p>
                                    <div className="h-32">
                                        {echo.futureOutcomeData.datasets?.length > 0 ? (
                                            <Line options={commonChartOptions} data={echo.futureOutcomeData} />
                                        ): <p className="text-xs text-center italic text-gray-400 pt-12">No data</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic py-10">
                    {currentStockInfo.currentPrice !== null && !chronosSentiment.text.toLowerCase().includes("error") && !isLoading
                        ? (
                            <>
                                The current <strong className="text-indigo-500"></strong> market pattern for {selectedStockTicker} appears unique in its recent history. Chronos found no strong <strong className="text-indigo-500"></strong> historical parallels.
                            </>
                          )
                        : (isLoading ? 'Analyzing...' : 'Select a stock to begin forecasting.')
                    }
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}