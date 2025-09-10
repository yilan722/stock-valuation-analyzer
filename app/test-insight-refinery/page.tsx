'use client'

import React, { useState, useEffect } from 'react'
import ReportHub from '../../components/InsightRefinery/ReportHub'

export default function TestInsightRefineryPage() {
  const [userId, setUserId] = useState('84402fbd-e3b0-4b0d-a349-e8306e7a6b5a') // 测试用户ID

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔬 Insight Refinery 测试页面
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            测试说明
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>此页面用于测试Insight Refinery功能</li>
            <li>请确保您已经生成过研报</li>
            <li>研报将显示在下面的研报中心中</li>
            <li>点击"开始Insight Refinery"可以开始深度讨论</li>
          </ul>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ReportHub
            userId={userId}
            locale="zh"
          />
        </div>
      </div>
    </div>
  )
}


