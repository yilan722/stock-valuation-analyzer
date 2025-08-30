'use client'

import React from 'react'
import { CompanyAnalysis } from '../../../types'

interface RadarChartProps {
  companies: CompanyAnalysis[]
  geminiRadarData?: string // 新增：Gemini API返回的雷达图文本数据
  className?: string
}

export default function RadarChart({ companies, geminiRadarData, className = '' }: RadarChartProps) {
  // 如果有Gemini API数据，优先使用文本显示模式
  if (geminiRadarData && geminiRadarData.trim() !== '') {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">五维评分雷达图</h3>
          <p className="text-sm text-gray-600 mt-1">
            基于财务数据和市场环境的综合评分分析
          </p>
        </div>

        <div className="px-6 py-4">
          <div className="prose max-w-none">
            <div 
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: geminiRadarData
                  .replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/(\d+\.\s*)/g, '<br><strong>$1</strong>')
              }}
            />
          </div>
        </div>

        {/* 评分说明 */}
        <div className="px-6 py-3 bg-blue-50 border-t">
          <div className="text-xs text-blue-700">
            <strong>评分说明：</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>1-2分：表现较差，需要关注</li>
              <li>3-4分：表现一般，有待改善</li>
              <li>5-6分：表现良好，符合预期</li>
              <li>7-8分：表现优秀，超出预期</li>
              <li>9-10分：表现卓越，行业领先</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // 如果没有Gemini数据，使用原有的图表逻辑
  if (companies.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        暂无数据
      </div>
    )
  }

  const dimensions = [
    { key: 'profitability', label: '盈利能力', color: '#3B82F6' },
    { key: 'financialHealth', label: '财务健康', color: '#10B981' },
    { key: 'growth', label: '成长性', color: '#F59E0B' },
    { key: 'valuation', label: '估值', color: '#EF4444' },
    { key: 'policyBenefit', label: '政策受益', color: '#8B5CF6' }
  ]

  const maxScore = 100
  const centerX = 200
  const centerY = 200
  const radius = 150

  const getPoint = (angle: number, distance: number) => {
    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance
    return { x, y }
  }

  const getPolygonPoints = (company: CompanyAnalysis) => {
    return dimensions.map((dim, index) => {
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2
      const score = company.scores[dim.key as keyof typeof company.scores]
      const distance = (score / maxScore) * radius
      return getPoint(angle, distance)
    })
  }

  const getPolygonPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return ''
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + 'Z'
  }

  const getDimensionLabels = () => {
    return dimensions.map((dim, index) => {
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2
      const labelDistance = radius + 30
      const point = getPoint(angle, labelDistance)
      
      return (
        <text
          key={dim.key}
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-gray-700"
        >
          {dim.label}
        </text>
      )
    })
  }

  const getGridLines = () => {
    const lines = []
    for (let i = 1; i <= 5; i++) {
      const currentRadius = (radius * i) / 5
      const points = dimensions.map((_, index) => {
        const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2
        return getPoint(angle, currentRadius)
      })
      
      lines.push(
        <polygon
          key={i}
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
          opacity="0.5"
        />
      )
    }
    return lines
  }

  const getDimensionLines = () => {
    return dimensions.map((_, index) => {
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2
      const endPoint = getPoint(angle, radius)
      
      return (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke="#E5E7EB"
          strokeWidth="1"
          opacity="0.5"
        />
      )
    })
  }

  const getScoreLabels = () => {
    const labels = []
    for (let i = 1; i <= 5; i++) {
      const score = (i * maxScore) / 5
      const labelDistance = (radius * i) / 5
      const point = getPoint(0, labelDistance)
      
      labels.push(
        <text
          key={i}
          x={point.x - 20}
          y={point.y}
          textAnchor="end"
          dominantBaseline="middle"
          className="text-xs fill-gray-500"
        >
          {score}
        </text>
      )
    }
    return labels
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">五维评分雷达图</h3>
        <p className="text-sm text-gray-600 mt-1">
          基于财务数据和市场环境的综合评分分析
        </p>
      </div>

      <div className="px-6 py-4">
        <div className="flex justify-center">
          <svg width="400" height="400" className="border rounded-lg bg-gray-50">
            {/* 网格线和维度线 */}
            {getGridLines()}
            {getDimensionLines()}
            
            {/* 评分标签 */}
            {getScoreLabels()}
            
            {/* 维度标签 */}
            {getDimensionLabels()}
            
            {/* 公司多边形 */}
            {companies.map((company, companyIndex) => {
              const points = getPolygonPoints(company)
              const path = getPolygonPath(points)
              
              return (
                <g key={company.symbol}>
                  {/* 填充多边形 */}
                  <path
                    d={path}
                    fill={dimensions[companyIndex % dimensions.length].color}
                    fillOpacity="0.2"
                    stroke={dimensions[companyIndex % dimensions.length].color}
                    strokeWidth="2"
                  />
                  
                  {/* 数据点 */}
                  {points.map((point, pointIndex) => (
                    <circle
                      key={pointIndex}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={dimensions[companyIndex % dimensions.length].color}
                    />
                  ))}
                  
                  {/* 公司标签 */}
                  <text
                    x={centerX}
                    y={centerY + radius + 50 + companyIndex * 20}
                    textAnchor="middle"
                    className="text-sm font-medium fill-gray-700"
                  >
                    {company.symbol} ({company.name})
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* 图例 */}
      <div className="px-6 py-3 bg-gray-50 border-t">
        <div className="text-xs text-gray-600">
          <strong>图例说明：</strong>
          <div className="mt-2 grid grid-cols-2 gap-4">
            {companies.map((company, index) => (
              <div key={company.symbol} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: dimensions[index % dimensions.length].color }}
                />
                <span>{company.symbol}: {company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

