'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const useCases = [
  {
    title: 'Voice',
    icon: '🎤',
    features: [
      {
        title: 'Live Call CoPilot',
        description: 'Real-time AI assistant that provides live transcription with speaker identification while suggesting strategic responses to client objections and complex scenarios.',
        metrics: [
          { label: 'Higher Close Rates', value: '40%' },
          { label: 'Information Retention', value: '95%+' },
          { label: 'Preparation Time Reduction', value: '60%' }
        ]
      },
      {
        title: 'Call Analytics Agent',
        description: 'Amplify audio Insights. Analyze and unlock insights with audio intelligence.',
        metrics: [
          { label: 'Lower Cost', value: '80%' },
          { label: 'Risk Reduction', value: '6X' },
          { label: 'Feedback Increase', value: '4X' }
        ]
      }
    ]
  },
  {
    title: 'WhatsApp',
    icon: '💬',
    features: [
      {
        title: 'Conversational Growth Agent',
        description: 'AI-powered WhatsApp engagement system that transforms segment data into personalized conversations, guides users through conversion funnels, and creates memorable brand experiences.',
        metrics: [
          { label: 'Engagement Rate', value: '45%+' },
          { label: 'Conversion Rate', value: '3X' },
          { label: 'Sales Cycle Reduction', value: '50%' }
        ]
      },
      {
        title: 'Lead Qualification',
        description: '24/7 Virtual Receptionists and Intake Specialists that does lead qualification, handles initial client screening, management, and follow-ups.',
        metrics: [
          { label: 'Intake Time Reduction', value: '5 mins' },
          { label: 'Qualified Lead Value', value: '$500' }
        ]
      },
      {
        title: 'Customer Success',
        description: '24/7 intelligent customer success platform that proactively manages customer lifecycle, identifies expansion opportunities, and prevents churn before it happens.',
        metrics: [
          { label: 'First-time Resolution', value: '95%' },
          { label: 'Workload Reduction', value: '50%' }
        ]
      }
    ]
  },
  {
    title: 'Web',
    icon: '🌐',
    features: [
      {
        title: 'Personalized Reporting',
        description: 'AI-driven analytics and reporting system that provides personalized insights and recommendations.',
        metrics: [
          { label: 'Insight Generation', value: 'Real-time' },
          { label: 'Customization', value: '100%' }
        ]
      },
      {
        title: 'Deep Research',
        description: 'Advanced research capabilities for markets, use cases, and people analysis.',
        metrics: [
          { label: 'Research Speed', value: '10X' },
          { label: 'Accuracy', value: '99%' }
        ]
      },
      {
        title: 'Document Analysis',
        description: 'Intelligent document processing and analysis for better decision making.',
        metrics: [
          { label: 'Processing Time', value: '90%' },
          { label: 'Error Reduction', value: '95%' }
        ]
      }
    ]
  }
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-900/20 to-black" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            What&apos;s the{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              magic
            </span>{' '}
            you can expect?
          </h2>
        </div>

        {/* Tabs */}
        <div className="mt-16 flex justify-center space-x-4">
          {useCases.map((useCase, index) => (
            <button
              key={useCase.title}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 rounded-full text-lg font-semibold transition-all ${
                activeTab === index
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {useCase.icon} {useCase.title}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {useCases[activeTab].features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative p-6 bg-black rounded-lg border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 mb-4">
                  Here&apos;s how professionals are using SwanCity to transform their client interactions.
                </p>
                <div className="space-y-3">
                  {feature.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between">
                      <span className="text-gray-400">{metric.label}</span>
                      <span className="text-cyan-400 font-bold">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}