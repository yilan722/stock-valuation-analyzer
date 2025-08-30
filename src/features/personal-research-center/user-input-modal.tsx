'use client'

import React, { useState, useEffect } from 'react'
import { X, Lightbulb, FileText, TrendingUp, Send, MessageSquare } from 'lucide-react'
import { AIDiscussionService, DiscussionSession, DiscussionMessage } from '../../services/ai-discussion-service'

interface UserInputModalProps {
  isOpen: boolean
  onClose: () => void
  stockSymbol: string
  stockName: string
  onSubmit: (customInsights: string) => void
  isLoading?: boolean
}

export default function UserInputModal({
  isOpen,
  onClose,
  stockSymbol,
  stockName,
  onSubmit,
  isLoading = false
}: UserInputModalProps) {
  const [customInsights, setCustomInsights] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showDiscussion, setShowDiscussion] = useState(false)
  const [discussionSession, setDiscussionSession] = useState<DiscussionSession | null>(null)
  const [userMessage, setUserMessage] = useState('')
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(false)
  const [discussionSummary, setDiscussionSummary] = useState('')
  
  const aiDiscussionService = new AIDiscussionService()

  const categories = [
    { id: 'fundamentals', label: '基本面变化', icon: TrendingUp, description: '财务数据、业务模式、管理团队等变化' },
    { id: 'market', label: '市场信息', icon: Lightbulb, description: '未被市场充分定价的信息、行业趋势等' },
    { id: 'policy', label: '政策影响', icon: FileText, description: '政策变化、监管环境、补贴等影响' },
    { id: 'custom', label: '自定义', icon: Lightbulb, description: '其他个性化见解和分析' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customInsights.trim()) {
      onSubmit(customInsights)
    }
  }

  const startAIDiscussion = async () => {
    if (!customInsights.trim()) {
      alert('请先输入您的投资见解')
      return
    }
    
    setIsDiscussionLoading(true)
    try {
      const session = await aiDiscussionService.startDiscussion(stockSymbol, customInsights)
      setDiscussionSession(session)
      setShowDiscussion(true)
    } catch (error) {
      console.error('Failed to start discussion:', error)
      alert('启动AI讨论失败，请重试')
    } finally {
      setIsDiscussionLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!userMessage.trim() || !discussionSession) return
    
    setIsDiscussionLoading(true)
    try {
      const updatedSession = await aiDiscussionService.continueDiscussion(discussionSession, userMessage)
      setDiscussionSession(updatedSession)
      setUserMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('发送消息失败，请重试')
    } finally {
      setIsDiscussionLoading(false)
    }
  }

  const generateSummary = async () => {
    if (!discussionSession) return
    
    setIsDiscussionLoading(true)
    try {
      const summary = await aiDiscussionService.generateDiscussionSummary(discussionSession)
      setDiscussionSummary(summary)
    } catch (error) {
      console.error('Failed to generate summary:', error)
      alert('生成总结失败，请重试')
    } finally {
      setIsDiscussionLoading(false)
    }
  }

  const finishDiscussion = () => {
    if (discussionSummary) {
      onSubmit(customInsights + '\n\nAI讨论总结：\n' + discussionSummary)
    } else {
      onSubmit(customInsights)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // 根据类别提供示例提示
    const examples = {
      fundamentals: '例如：公司最近发布了超预期的季度财报，净利润同比增长30%，毛利率提升2个百分点...',
      market: '例如：市场可能低估了公司在AI领域的布局，其技术储备和人才优势未被充分定价...',
      policy: '例如：国家新政策支持新能源发展，公司作为行业龙头将获得更多政策红利...',
      custom: '请详细描述您的见解，包括具体数据、分析逻辑和预期影响...'
    }
    setCustomInsights(examples[categoryId as keyof typeof examples] || '')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header - 固定头部 */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              个性化研究中心
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              为 {stockSymbol} ({stockName}) 添加您的专业见解
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - 可滚动内容区域 */}
        <div 
          className="flex-1 overflow-y-auto p-6 pb-20 min-h-0"
          style={{ 
            maxHeight: 'calc(90vh - 150px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {!showDiscussion ? (
            <>
              {/* Category Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  选择分析类别
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          selectedCategory === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Icon size={20} className="text-blue-600 mr-2" />
                          <span className="font-medium text-gray-900">
                            {category.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Insights Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细描述您的见解
                </label>
                <textarea
                  value={customInsights}
                  onChange={(e) => setCustomInsights(e.target.value)}
                  placeholder="请详细描述您认为需要更新或补充的信息，包括具体数据、分析逻辑和预期影响..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  建议包含：具体数据、时间范围、影响程度、分析逻辑等
                </p>
              </div>

              {/* AI Discussion Button */}
              <div className="mb-6">
                <button
                  onClick={startAIDiscussion}
                  disabled={!customInsights.trim() || isDiscussionLoading}
                  className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <MessageSquare size={20} className="mr-2" />
                  {isDiscussionLoading ? '启动中...' : '与AI讨论您的见解'}
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!customInsights.trim() || isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '生成中...' : '生成更新报告'}
                </button>
              </div>
            </>
          ) : (
            /* AI Discussion Interface */
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  AI投资顾问讨论
                </h3>
                <p className="text-sm text-gray-600">
                  与AI深入讨论您的投资见解
                </p>
              </div>

              {/* Discussion Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {discussionSession?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="输入您的消息..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!userMessage.trim() || isDiscussionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={generateSummary}
                  disabled={!discussionSession || isDiscussionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  生成讨论总结
                </button>
                <button
                  onClick={finishDiscussion}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  完成讨论
                </button>
              </div>

              {/* Discussion Summary */}
              {discussionSummary && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">讨论总结：</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {discussionSummary}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
