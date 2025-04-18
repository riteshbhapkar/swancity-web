'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    company: 'Slater Gordon',
    quote: "The AI-powered platform has transformed our client interactions. We've seen a 40% increase in successful consultations and a significant reduction in preparation time.",
    metrics: [
      { label: 'Close Rate Increase', value: '40%' },
      { label: 'Time Saved', value: '60%' }
    ]
  },
  {
    company: 'TravelPlus',
    quote: "Our customer engagement has never been better. The AI assistant handles routine inquiries while our team focuses on complex cases, resulting in happier customers and more efficient operations.",
    metrics: [
      { label: 'Customer Satisfaction', value: '95%' },
      { label: 'Response Time', value: '2 mins' }
    ]
  },
  {
    company: 'Amazon Prime',
    quote: "The platform's ability to analyze and respond to customer needs in real-time has been a game-changer for our support team. We've seen a dramatic improvement in first-contact resolution.",
    metrics: [
      { label: 'Resolution Rate', value: '98%' },
      { label: 'Support Cost Reduction', value: '45%' }
    ]
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-900/20 to-black" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Success{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
        </div>

        <div className="relative h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25" />
                <div className="relative h-full p-8 bg-black rounded-2xl border border-gray-800">
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6">
                        {testimonials[currentIndex].company}
                      </h3>
                      <p className="text-gray-300 text-lg">
                        &ldquo;SwanCity has transformed how we engage with clients. Their AI-driven approach has increased our conversion rates by 40%.&rdquo;
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      {testimonials[currentIndex].metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="p-4 bg-gray-900/50 rounded-lg border border-gray-800"
                        >
                          <div className="text-cyan-400 font-bold text-2xl mb-1">
                            {metric.value}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentIndex === index
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}