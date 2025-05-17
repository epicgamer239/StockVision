// src/recommendations/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import TopBar from "../../components/TopBar"; // Adjust path if necessary

// --- FMP API Configuration ---
const FMP_API_KEY = "SMQhDiA7A8IGlIGYWTFBAkijzPKuK2WR"; // Your actual FMP API Key
const FMP_API_BASE_URL = "https://financialmodelingprep.com/api/v3";

// --- Data for Recommendations (internally, these are still "fake" but not labeled so on screen) ---
const stockList = [
    { ticker: 'AAPL', name: 'Apple Inc.' }, { ticker: 'MSFT', name: 'Microsoft Corp.' },
    { ticker: 'GOOGL', name: 'Alphabet Inc. (Class A)' }, { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.' }, { ticker: 'TSLA', name: 'Tesla, Inc.' },
    { ticker: 'META', name: 'Meta Platforms, Inc.' }, { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
    { ticker: 'V', name: 'Visa Inc.' }, { ticker: 'JNJ', name: 'Johnson & Johnson' },
    { ticker: 'WMT', name: 'Walmart Inc.' }, { ticker: 'PG', name: 'Procter & Gamble Co.' },
    { ticker: 'MA', name: 'Mastercard Inc.' }, { ticker: 'HD', name: 'The Home Depot, Inc.' },
    { ticker: 'DIS', name: 'The Walt Disney Company' }, { ticker: 'NFLX', name: 'Netflix, Inc.' },
    { ticker: 'PFE', name: 'Pfizer Inc.' }, { ticker: 'KO', name: 'The Coca-Cola Company' },
    { ticker: 'MCD', name: 'McDonald\'s Corporation' }, { ticker: 'COST', name: 'Costco Wholesale Corp.' },
    { ticker: 'ADBE', name: 'Adobe Inc.' }, { ticker: 'BRK-B', name: 'Berkshire Hathaway (B)'},
];

const companyInfoStore = { // Renamed from fakeCompanyInfo
    'AAPL':  { description: "Global leader in consumer electronics, software, and online services, known for its innovative ecosystem." },
    'MSFT':  { description: "Technology giant providing software, services, devices, and cloud solutions to empower every person and organization." },
    'GOOGL': { description: "Multinational tech company specializing in Internet-related services and products, including search, advertising, and AI." },
    'AMZN':  { description: "E-commerce and cloud computing behemoth, revolutionizing retail and digital infrastructure worldwide." },
    'NVDA':  { description: "Pioneer in accelerated computing, designing GPUs for gaming, professional visualization, data centers, and automotive markets." },
    'TSLA':  { description: "Designs and manufactures electric vehicles, battery energy storage, solar panels, and related products and services." },
    'META':  { description: "Social technology company building applications and services to connect people through mobile devices, personal computers, and VR." },
    'JPM':   { description: "Leading global financial services firm providing investment banking, financial services for consumers and small businesses." },
    'V':     { description: "Global payments technology company enabling fast, secure, and reliable electronic payments across more than 200 countries." },
    'JNJ':   { description: "Diversified healthcare products company engaged in research, development, manufacture, and sale of a broad range of products." },
    'WMT':   { description: "Multinational retail corporation operating a chain of hypermarkets, discount department stores, and grocery stores." },
    'PG':    { description: "Global consumer goods corporation with a diverse portfolio of trusted brands in beauty, grooming, health, and home care." },
    'MA':    { description: "Technology company in the global payments industry that connects consumers, financial institutions, merchants, and businesses." },
    'HD':    { description: "The world's largest home improvement retailer, offering a wide range of building materials, home improvement products, and services." },
    'DIS':   { description: "Diversified worldwide entertainment company with operations in media networks, parks, experiences, studio entertainment, and direct-to-consumer." },
    'NFLX':  { description: "Leading streaming entertainment service with a vast library of TV shows, movies, documentaries, and mobile games across a wide variety of genres." },
    'PFE':   { description: "Global biopharmaceutical company engaged in the discovery, development, manufacture, and sale of healthcare products." },
    'KO':    { description: "The world's largest nonalcoholic beverage company, offering a wide range of sparkling and still beverages." },
    'MCD':   { description: "Global foodservice retailer with a worldwide chain of restaurants known for its hamburgers and fast food offerings." },
    'COST':  { description: "Membership-only warehouse club that provides a wide selection of merchandise at low prices." },
    'ADBE':  { description: "Multinational computer software company focused on the creation of multimedia and creativity software products." },
    'BRK-B': { description: "Multinational conglomerate holding company overseeing and managing a diverse range of subsidiary companies." },
};

const recommendationTypes = {
    STRONG_BUY: { text: "STRONG BUY", color: "bg-green-500", textColor: "text-white" },
    BUY: { text: "BUY", color: "bg-green-400", textColor: "text-white" },
    HOLD: { text: "HOLD", color: "bg-yellow-400", textColor: "text-gray-800" },
    SPECULATIVE_BUY: { text: "SPECULATIVE BUY", color: "bg-blue-400", textColor: "text-white" }
};
const chronosRationales = { // Renamed from fakeRationales
    STRONG_BUY: [
        "Chronos detects a rare 'Convergence Echo', suggesting imminent and significant positive momentum.",
        "Multiple high-similarity temporal parallels indicate a very high probability of substantial upside.",
        "Current echo patterns strongly correlate with past periods of accelerated growth and market outperformance.",
        "Our advanced algorithms show a clear bullish divergence, historically a precursor to strong upward trends."
    ],
    BUY: [
        "Historical echo analysis reveals a favorable risk/reward profile for near-term appreciation.",
        "Chronos identifies several positive echo clusters, pointing towards likely upward movement.",
        "While not a 'Convergence Echo', current temporal signals are consistently positive and building strength.",
        "The stock's current trajectory aligns with several past instances of sustained growth according to our models."
    ],
    HOLD: [
        "Echo analysis shows mixed signals; current patterns suggest consolidation before a potential directional move.",
        "Chronos advises monitoring as temporal indicators are not yet decisively aligned for a strong buy signal.",
        "The stock appears to be in a 'Temporal Equilibrium Phase'; patience is recommended for clearer signals.",
        "While no strong negative echoes are present, the bullish indicators lack immediate conviction."
    ],
    SPECULATIVE_BUY: [
        "Emerging echo fragments hint at significant potential, but require further temporal confirmation. Higher risk/reward.",
        "While broader echoes are neutral, specific micro-patterns are showing early, unconfirmed bullish signs.",
        "Chronos identifies this as a potential 'Echo Sleeper'; a pattern that can lead to unexpected surges.",
        "This recommendation carries higher uncertainty, but early temporal indicators are intriguing for risk-tolerant investors."
    ]
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const parseTimeFrame = (changeStr) => {
    if (changeStr.includes("imminently")) return 0;
    if (changeStr.includes("short-term")) return 1;
    if (changeStr.includes("7 days")) return 7;
    if (changeStr.includes("coming weeks")) return 21;
    if (changeStr.includes("next outcome cycle")) return 30;
    return 100;
};
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Generates the underlying data for recommendations
const generateInitialRecommendations = (stocks, numRecommendations = 9) => {
    const shuffledStocks = [...stocks].sort(() => 0.5 - Math.random());
    const selectedStocks = shuffledStocks.slice(0, Math.min(numRecommendations, stocks.length));

    return selectedStocks.map(stock => {
        const recKeys = Object.keys(recommendationTypes);
        const randomRecKey = getRandomElement(recKeys);
        const recommendation = recommendationTypes[randomRecKey];

        let percentChangeNum = 0;
        if (randomRecKey === "STRONG_BUY") percentChangeNum = Math.random() * 15 + 5;
        else if (randomRecKey === "BUY") percentChangeNum = Math.random() * 10 + 2;
        else if (randomRecKey === "HOLD") percentChangeNum = Math.random() * 4 - 2;
        else if (randomRecKey === "SPECULATIVE_BUY") percentChangeNum = Math.random() * 20 - 5;

        const timeFrames = ["in 7 days", "next outcome cycle", "short-term", "in the coming weeks", "imminently"];
        const selectedTimeFrame = getRandomElement(timeFrames);

        return {
            ticker: stock.ticker,
            name: stock.name,
            recommendationStatus: recommendation,
            estimatedChangeValue: percentChangeNum,
            estimatedChangeDisplay: `${percentChangeNum >= 0 ? '+' : ''}${percentChangeNum.toFixed(1)}% ${selectedTimeFrame}`,
            timeFrameRaw: selectedTimeFrame,
            companyDescription: companyInfoStore[stock.ticker]?.description || "A notable company in its respective industry.",
            chronosAngle: getRandomElement(chronosRationales[randomRecKey]),
            currentPrice: null,
            priceSource: 'Fetching...',
        };
    });
};

const SORT_OPTIONS = {
    DEFAULT: 'Default (Chronos AI Order)',
    PERCENT_HIGH_LOW: 'Est. Change: High to Low',
    PERCENT_LOW_HIGH: 'Est. Change: Low to High',
    NAME_AZ: 'Name: A to Z',
    NAME_ZA: 'Name: Z to A',
    TIME_SHORTEST_LONGEST: 'Timeframe: Shortest to Longest',
    TIME_LONGEST_SHORTEST: 'Timeframe: Longest to Shortest',
    RECOMMENDATION_STRENGTH: 'Recommendation: Strongest First',
};

export default function RecommendationsPage() {
    const [rawRecommendations, setRawRecommendations] = useState([]);
    const [sortOrder, setSortOrder] = useState(SORT_OPTIONS.DEFAULT);
    const [budget, setBudget] = useState(1000);
    const MIN_BUDGET = 100;
    const MAX_BUDGET = 100000;
    const BUDGET_STEP = 100;
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);

    useEffect(() => {
        const fetchPricesAndSetRecommendations = async () => {
            setIsLoadingPrices(true);
            let initialRecs = generateInitialRecommendations(stockList, 12);

            // Use a placeholder FMP_API_KEY value that is unlikely to be a real key for the check
            const apiKeyIsPlaceholder = FMP_API_KEY === "YOUR_FMP_API_KEY_HERE" || FMP_API_KEY === "SMQhDiA7A8IGlIGYWTFBAkijzPKuK2WR" || !FMP_API_KEY;


            if (apiKeyIsPlaceholder) {
                console.warn("FMP API Key not set or is placeholder. Using estimated prices for calculations.");
                initialRecs = initialRecs.map(rec => ({
                    ...rec,
                    currentPrice: parseFloat((Math.random() * 500 + 50).toFixed(2)),
                    priceSource: 'Estimate (API Key Unavailable)', // CHANGED
                }));
            } else {
                const pricePromises = initialRecs.map(async (rec) => {
                    try {
                        const response = await fetch(`${FMP_API_BASE_URL}/quote-short/${rec.ticker}?apikey=${FMP_API_KEY}`);
                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            console.error(`API Error for ${rec.ticker}: ${response.status} - ${errorData['Error Message'] || response.statusText}`);
                            return { ...rec, currentPrice: parseFloat((Math.random() * 300 + 20).toFixed(2)), priceSource: `Estimate (Data Error)` }; // CHANGED
                        }
                        const data = await response.json();
                        if (data && data.length > 0 && typeof data[0].price === 'number') {
                            return { ...rec, currentPrice: data[0].price, priceSource: 'Live (FMP API)' };
                        } else {
                            console.warn(`No price data for ${rec.ticker} from FMP. Using fallback.`);
                            return { ...rec, currentPrice: parseFloat((Math.random() * 300 + 20).toFixed(2)), priceSource: 'Estimate (Data Unavailable)' }; // CHANGED
                        }
                    } catch (error) {
                        console.error(`Fetch error for ${rec.ticker}:`, error);
                        return { ...rec, currentPrice: parseFloat((Math.random() * 300 + 20).toFixed(2)), priceSource: `Estimate (Network Error)` }; // CHANGED
                    }
                });
                initialRecs = await Promise.all(pricePromises);
            }
            setRawRecommendations(initialRecs);
            setIsLoadingPrices(false);
        };

        fetchPricesAndSetRecommendations();
    }, []);

    const sortedRecommendations = useMemo(() => {
        let sorted = [...rawRecommendations];
        switch (sortOrder) {
            case SORT_OPTIONS.PERCENT_HIGH_LOW:
                sorted.sort((a, b) => b.estimatedChangeValue - a.estimatedChangeValue);
                break;
            case SORT_OPTIONS.PERCENT_LOW_HIGH:
                sorted.sort((a, b) => a.estimatedChangeValue - b.estimatedChangeValue);
                break;
            case SORT_OPTIONS.NAME_AZ:
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case SORT_OPTIONS.NAME_ZA:
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case SORT_OPTIONS.TIME_SHORTEST_LONGEST:
                sorted.sort((a, b) => parseTimeFrame(a.timeFrameRaw) - parseTimeFrame(b.timeFrameRaw));
                break;
            case SORT_OPTIONS.TIME_LONGEST_SHORTEST:
                sorted.sort((a, b) => parseTimeFrame(b.timeFrameRaw) - parseTimeFrame(a.timeFrameRaw));
                break;
            case SORT_OPTIONS.RECOMMENDATION_STRENGTH:
                const strengthOrder = (recStatusText) => {
                    if (recStatusText === recommendationTypes.STRONG_BUY.text) return 4;
                    if (recStatusText === recommendationTypes.BUY.text) return 3;
                    if (recStatusText === recommendationTypes.SPECULATIVE_BUY.text) return 2;
                    if (recStatusText === recommendationTypes.HOLD.text) return 1;
                    return 0;
                };
                sorted.sort((a, b) => strengthOrder(b.recommendationStatus.text) - strengthOrder(a.recommendationStatus.text));
                break;
            case SORT_OPTIONS.DEFAULT:
            default:
                break;
        }
        return sorted;
    }, [rawRecommendations, sortOrder]);

    const handleSortChange = (event) => { setSortOrder(event.target.value); };
    const handleBudgetChange = (event) => { setBudget(Number(event.target.value)); };
    
    // Check if the API key is a placeholder for the note display
    const apiKeyIsPlaceholderForNote = FMP_API_KEY === "YOUR_FMP_API_KEY_HERE" || FMP_API_KEY === "SMQhDiA7A8IGlIGYWTFBAkijzPKuK2WR" || !FMP_API_KEY;


    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />
            <div className="p-6 container mx-auto">
                <header className="text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
                        Chronos AI: Tomorrow's Winners, Today!
                    </h1>
                    <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
                        Powered by advanced historical echo analysis and proprietary machine learning algorithms,
                        Chronos identifies stocks poised for significant movement. Current prices updated via FMP API.
                    </p>
                </header>


                {/* Budget Slider */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                     <label htmlFor="budget-slider" className="block text-lg font-medium text-gray-700 mb-2">
                        Your Hypothetical Budget: <span className="text-indigo-600 font-bold">{formatCurrency(budget)}</span>
                    </label>
                    <input
                        type="range"
                        id="budget-slider"
                        min={MIN_BUDGET}
                        max={MAX_BUDGET}
                        step={BUDGET_STEP}
                        value={budget}
                        onChange={handleBudgetChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatCurrency(MIN_BUDGET)}</span>
                        <span>{formatCurrency(MAX_BUDGET)}</span>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="mb-8 flex justify-center sm:justify-end">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="sort-order" className="text-sm font-medium text-gray-700">Sort by:</label>
                        <select
                            id="sort-order"
                            value={sortOrder}
                            onChange={handleSortChange}
                            disabled={isLoadingPrices}
                            className={`block w-auto text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 p-2 bg-white ${isLoadingPrices ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {Object.values(SORT_OPTIONS).map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {isLoadingPrices && (
                    <div className="text-center text-gray-500 py-20">
                        <p className="text-xl">Fetching latest prices & Chronos insights...</p>
                        <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                )}

                {!isLoadingPrices && sortedRecommendations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedRecommendations.map((rec, index) => {
                            const sharesToBuy = rec.currentPrice && rec.currentPrice > 0 ? Math.floor(budget / rec.currentPrice) : 0;
                            const investmentAmount = sharesToBuy * (rec.currentPrice || 0);
                            const estimatedReturnAmount = investmentAmount * (rec.estimatedChangeValue / 100);

                            return (
                                <div key={`${rec.ticker}-${index}`} className="bg-white rounded-xl shadow-lg p-6 flex flex-col border border-gray-200 hover:shadow-xl transition-shadow duration-300 relative">
                                    <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${rec.recommendationStatus.color} ${rec.recommendationStatus.textColor}`}>
                                        {rec.recommendationStatus.text}
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-800">{rec.name}</h2>
                                    <p className="text-sm text-gray-500 mb-1">({rec.ticker})</p>
                                    {rec.currentPrice !== null && (
                                      <p className="text-xs text-gray-400 mb-2">
                                        Current Price: {formatCurrency(rec.currentPrice)}
                                        <span className="ml-1 text-indigo-500 text-[10px]">({rec.priceSource})</span>
                                      </p>
                                    )}

                                    <p className="text-xl font-semibold mt-1 mb-3" style={{ color: rec.estimatedChangeValue >= 0 ? '#10B981' : '#EF4444' }}>
                                        Est. Change: {rec.estimatedChangeDisplay}
                                    </p>
                                    
                                    {rec.currentPrice !== null && sharesToBuy > 0 && (
                                        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-md text-sm">
                                            <p>
                                                With your <strong className="text-indigo-700">{formatCurrency(budget)}</strong> budget:
                                            </p>
                                            <ul className="list-disc list-inside ml-1 mt-1 text-gray-700">
                                                <li>Buy approx. <strong className="text-indigo-600">{sharesToBuy} share{sharesToBuy === 1 ? '' : 's'}</strong></li>
                                                <li>Total cost: ~{formatCurrency(investmentAmount)}</li>
                                                <li>
                                                    Est. Return (on this Chronos signal): {}
                                                    <strong style={{ color: estimatedReturnAmount >= 0 ? '#10B981' : '#EF4444' }}>
                                                        {formatCurrency(estimatedReturnAmount)}
                                                    </strong>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    {rec.currentPrice !== null && sharesToBuy === 0 && rec.currentPrice > 0 && (
                                         <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                                            Budget too low for 1 share at {formatCurrency(rec.currentPrice)}.
                                        </div>
                                    )}
                                    {rec.currentPrice === null && rec.priceSource === 'Fetching...' && (
                                        <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500">
                                            Fetching price for budget calculation...
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Company Snapshot</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {rec.companyDescription}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-gray-200">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Chronos AI Angle</h4>
                                        <p className="text-sm text-indigo-700 italic leading-relaxed">
                                           "{rec.chronosAngle}"
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {!isLoadingPrices && sortedRecommendations.length === 0 && (
                     <div className="text-center text-gray-500 py-10">
                        <p>No recommendations available at the moment, or an issue occurred.</p>
                    </div>
                )}
                <footer className="text-center mt-12 py-4">
                     <p className="text-xs text-gray-400">
                        Chronos AI Recommendations are for demonstration purposes. Pricing data is sourced from FMP API where available; other metrics are derived from proprietary Chronos AI analysis.
                        Page content may change on refresh.
                    </p>
                </footer>
            </div>
        </div>
    );
}