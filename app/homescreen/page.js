'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, BarChart2, Cpu, TrendingUp, Settings } from 'lucide-react';

const features = [
  {
    icon: <Activity size={32} className="text-teal-400" />,
    title: 'Predictive Analytics',
    desc: 'Machine learning forecasts to anticipate market movements with precision.',
  },
  {
    icon: <BarChart2 size={32} className="text-teal-400" />,
    title: 'Real-Time Dashboards',
    desc: 'Dynamic charts and visuals updating live with the latest data.',
  },
  {
    icon: <Cpu size={32} className="text-teal-400" />,
    title: 'AI-Driven Insights',
    desc: 'Advanced algorithms providing actionable stock recommendations daily.',
  },
  {
    icon: <TrendingUp size={32} className="text-teal-400" />,
    title: 'Market Trends',
    desc: 'Comprehensive trend analysis to inform your strategic decisions.',
  },
  {
    icon: <Settings size={32} className="text-teal-400" />,
    title: 'Customizable Tools',
    desc: 'Configure the platform to align with your unique trading style.',
  },
];

const marketData = [
  { name: 'S&P 500', value: '4,587.64', change: '+0.74%' },
  { name: 'NASDAQ', value: '14,346.02', change: '+1.15%' },
  { name: 'Dow Jones', value: '36,204.44', change: '-0.12%' },
  { name: 'Russell 2000', value: '1,856.37', change: '+0.89%' },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 bg-white shadow-md z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-gray-800">StockVision Pro</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/login" className="hover:text-teal-500 transition">
                  Login
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl mx-auto">
            Elevate Your Trading with Precision Insights
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            StockVision Pro leverages advanced machine learning and real-time analytics to help you make informed investment decisions.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-8 px-8 py-3 bg-teal-500 text-white font-medium rounded-md shadow hover:bg-teal-600 transition"
          >
            Get Started
          </button>
        </motion.section>

        {/* Features */}
        <section className="mb-20">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-3xl font-semibold text-gray-800 text-center mb-8"
          >
            Our Core Capabilities
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h4>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Market Data */}
        <section>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-3xl font-semibold text-gray-800 text-center mb-8"
          >
            Market Overview
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {marketData.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ translateY: -4 }}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm transition"
              >
                <h5 className="text-lg font-medium mb-1">{item.name}</h5>
                <p className="text-2xl font-bold mb-1">{item.value}</p>
                <span className={item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {item.change}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          © 2025 StockVision Pro. Data presented for demonstration only.
        </div>
      </footer>
    </div>
  );
}
