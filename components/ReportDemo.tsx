'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, ExternalLink } from 'lucide-react'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'

interface ReportDemoProps {
  locale: Locale
}

export default function ReportDemo({ locale }: ReportDemoProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // 演示报告内容
  const demoSlides = [
    {
      id: 'overview',
      title: locale === 'zh' ? '概览' : 'Overview',
      content: locale === 'zh' ? 
        'Coinbase Global Inc (NASDAQ: COIN) 是美国领先的加密货币交易平台，为数字资产经济提供关键基础设施。成立于2012年，Coinbase已确立自己作为最值得信赖和合规的加密货币平台的地位，服务超过1.1亿已验证用户，覆盖100多个国家。' :
        'Coinbase Global Inc (NASDAQ: COIN) is a leading US cryptocurrency trading platform providing critical infrastructure for the digital asset economy. Founded in 2012, Coinbase has established itself as the most trusted and compliant cryptocurrency platform, serving over 110 million verified users across 100+ countries.',
      icon: '🏦',
      color: 'bg-blue-500'
    },
    {
      id: 'financials',
      title: locale === 'zh' ? '关键财务指标' : 'Key Financial Metrics',
      content: locale === 'zh' ?
        '2024年第三季度：收入$12.1B（同比增长79%），净利润$75M，调整后EBITDA $449M（37%利润率），经营现金流$392M。公司展示了显著的财务韧性，从加密货币寒冬期的亏损转变为持续盈利。' :
        'Q3 2024: Revenue $1.21B (79% YoY growth), Net Income $75M, Adjusted EBITDA $449M (37% margin), Operating Cash Flow $392M. The company demonstrates significant financial resilience, transitioning from losses during crypto winter to sustained profitability.',
      icon: '📊',
      color: 'bg-green-500'
    },
    {
      id: 'business',
      title: locale === 'zh' ? '业务细分分析' : 'Business Segments',
      content: locale === 'zh' ?
        '收入结构多元化：交易收入占56%，订阅和服务收入占44%。包括质押收入$207M、USDC利息收入$172M、托管费$89M、区块链奖励$54M。机构平台Prime处理4560亿美元交易量，占美国受监管机构加密平台68%市场份额。' :
        'Diversified revenue structure: Trading revenue 56%, Subscription & Services 44%. Includes Staking $207M, USDC Interest $172M, Custody Fees $89M, Blockchain Rewards $54M. Prime institutional platform handles $456B trading volume, 68% market share of US regulated institutional crypto platforms.',
      icon: '🏢',
      color: 'bg-purple-500'
    },
    {
      id: 'growth',
      title: locale === 'zh' ? '增长催化剂' : 'Growth Catalysts',
      content: locale === 'zh' ?
        '加密货币市场扩张至3.8万亿美元，比特币突破10万美元。机构采用预计到2026年达1.2万亿美元。监管明确性与合规领导地位，Base区块链生态系统发展，AI与自动化计划每年2亿美元研发投资。' :
        'Crypto market expansion to $3.8T, Bitcoin breaking $100K. Institutional adoption expected to reach $1.2T by 2026. Regulatory clarity and compliance leadership, Base blockchain ecosystem development, AI and automation initiatives with $200M annual R&D investment.',
      icon: '🚀',
      color: 'bg-orange-500'
    },
    {
      id: 'valuation',
      title: locale === 'zh' ? '估值分析' : 'Valuation Analysis',
      content: locale === 'zh' ?
        'DCF估值：基本情景$385（24%上行空间），乐观情景$485（56%上行空间），悲观情景$275（11%下行风险）。目标价格$395，基于市场领导地位、监管护城河、财务实力和平台演变。' :
        'DCF Valuation: Base case $385 (24% upside), Optimistic $485 (56% upside), Pessimistic $275 (11% downside). Target price $395, based on market leadership, regulatory moat, financial strength, and platform evolution.',
      icon: '💰',
      color: 'bg-yellow-500'
    },
    {
      id: 'conclusion',
      title: locale === 'zh' ? '投资建议' : 'Investment Recommendation',
      content: locale === 'zh' ?
        '目标价格：$395。作为领先的受监管加密货币平台，Coinbase代表了一个引人注目的投资机会，有望从机构采用、监管明确性和平台扩展中受益。44%的订阅收入提供下行保护，同时保持对加密采用的显著上行敞口。' :
        'Target Price: $395. As a leading regulated cryptocurrency platform, Coinbase represents a compelling investment opportunity benefiting from institutional adoption, regulatory clarity, and platform expansion. 44% subscription revenue provides downside protection while maintaining significant upside exposure to crypto adoption.',
      icon: '🎯',
      color: 'bg-red-500'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % demoSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + demoSlides.length) % demoSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleAutoPlay = () => {
    if (isAutoPlay) {
      setIsAutoPlay(false)
      setIsPlaying(false)
    } else {
      setIsAutoPlay(true)
      setIsPlaying(true)
    }
  }

  const resetDemo = () => {
    setCurrentSlide(0)
    setIsAutoPlay(false)
    setIsPlaying(false)
  }

  // 自动播放逻辑
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlay && isPlaying) {
      interval = setInterval(() => {
        nextSlide()
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [isAutoPlay, isPlaying, currentSlide])

  const currentSlideData = demoSlides[currentSlide]

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {locale === 'zh' ? 'AI驱动的股票分析报告演示' : 'AI-Driven Stock Analysis Report Demo'}
            </h2>
            <p className="text-blue-100">
              {locale === 'zh' ? '体验专业的股票估值分析报告' : 'Experience Professional Stock Valuation Analysis Reports'}
            </p>
          </div>
          <a 
            href="https://coinbase-gupiao-da030ly.gamma.site/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{locale === 'zh' ? '查看完整报告' : 'View Full Report'}</span>
          </a>
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-6">
        {/* Slide Display */}
        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 mb-6 min-h-[300px] flex items-center">
          {/* Slide Content */}
          <div className="w-full text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl mb-6 ${currentSlideData.color} text-white shadow-lg`}>
              {currentSlideData.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {currentSlideData.title}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-4xl mx-auto">
              {currentSlideData.content}
            </p>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={toggleAutoPlay}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isAutoPlay && isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isAutoPlay && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAutoPlay && isPlaying ? (locale === 'zh' ? '暂停' : 'Pause') : (locale === 'zh' ? '自动播放' : 'Auto Play')}</span>
          </button>
          
          <button
            onClick={resetDemo}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{locale === 'zh' ? '重置' : 'Reset'}</span>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2">
          {demoSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="text-center text-gray-500 mt-4">
          {currentSlide + 1} / {demoSlides.length}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
        <p>
          {locale === 'zh' ? 
            '本演示基于Coinbase (COIN) 的真实分析报告数据，展示了AI驱动的专业股票分析能力。' :
            'This demo is based on real analysis report data from Coinbase (COIN), showcasing AI-driven professional stock analysis capabilities.'
          }
        </p>
      </div>
    </div>
  )
} 