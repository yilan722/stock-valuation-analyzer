import React, { useState } from 'react'
import { X, Check } from 'lucide-react'

interface UserAgreementModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  locale: string
}

export default function UserAgreementModal({ isOpen, onClose, onConfirm, locale }: UserAgreementModalProps) {
  const [agreements, setAgreements] = useState({
    aiAnalysis: false,
    investmentRisk: false,
    selfResponsibility: false,
    noLiability: false,
    serviceFee: false
  })

  const allAgreed = Object.values(agreements).every(agreed => agreed)

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleConfirm = () => {
    if (allAgreed) {
      onConfirm()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            AI股票基本面估值分析平台用户服务协议
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
          <div className="text-center text-gray-500 mb-4">
            生效日期：用户签署当日
          </div>

          {/* 重要提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2">重要提示</h3>
            <p className="text-yellow-700">
              在使用本平台服务前，请您务必仔细阅读并充分理解本协议所有条款，特别是涉及免责、限制责任的条款。您点击"同意"或使用本平台服务，即表示您已充分阅读、理解并接受本协议的全部内容。
            </p>
          </div>

          {/* 协议条款 */}
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-gray-900 mb-2">第一条 服务性质说明</h3>
              <div className="space-y-2 text-gray-700">
                <p>1.1 本平台提供的是基于人工智能技术的股票基本面数据分析工具服务，所有分析结果均由AI算法自动生成，不构成任何投资建议、推荐或承诺。</p>
                <p>1.2 本平台收取的费用仅为提供AI算力、数据处理和技术服务的对价，不是投资咨询费用或投资收益分成。</p>
                <p>1.3 本平台不是持牌金融机构，不提供证券投资咨询、资产管理或任何需要金融牌照的服务。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第二条 AI生成内容声明</h3>
              <div className="space-y-2 text-gray-700">
                <p>2.1 本平台所有分析报告、估值结果、数据解读均为人工智能算法基于公开数据自动生成，可能存在以下局限性：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>数据准确性和时效性受限于数据源</li>
                  <li>AI模型可能存在偏差或错误</li>
                  <li>分析结果可能与实际情况存在重大差异</li>
                  <li>无法预测突发事件和市场异常波动</li>
                </ul>
                <p>2.2 AI生成的内容仅供参考，不能替代专业投资顾问的判断和建议。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第三条 投资风险警示</h3>
              <div className="space-y-2 text-gray-700">
                <p>3.1 股票投资具有高风险性，可能导致本金的部分或全部损失。用户应当充分认识到：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>股票市场价格波动剧烈且不可预测</li>
                  <li>过往业绩不代表未来表现</li>
                  <li>任何分析工具都无法保证投资收益</li>
                  <li>投资决策应基于个人风险承受能力</li>
                </ul>
                <p>3.2 用户应当具备相应的风险识别和承受能力，审慎做出投资决策。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第四条 免责条款</h3>
              <div className="space-y-2 text-gray-700">
                <p>4.1 完全免责：在法律允许的最大范围内，本平台及其运营方对以下情况不承担任何责任：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>用户基于本平台提供的信息做出投资决策导致的任何损失</li>
                  <li>AI分析结果的准确性、完整性、及时性或适用性</li>
                  <li>因使用或无法使用本服务导致的直接、间接、偶然、特殊或后果性损害</li>
                  <li>第三方数据源的错误或延迟</li>
                  <li>不可抗力导致的服务中断或数据丢失</li>
                </ul>
                <p>4.2 本平台不对任何投资结果做出任何明示或暗示的保证，包括但不限于盈利保证、适销性保证或特定用途适用性保证。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第五条 用户承诺与保证</h3>
              <p className="text-gray-700 mb-2">用户在使用本服务时承诺：</p>
              <div className="space-y-2 text-gray-700">
                <p>5.1 已年满18周岁，具有完全民事行为能力。</p>
                <p>5.2 充分理解股票投资风险，自愿承担全部投资风险和损失。</p>
                <p>5.3 不会仅依赖本平台提供的分析结果做出投资决策。</p>
                <p>5.4 已经或将会咨询专业投资顾问，根据自身情况做出独立判断。</p>
                <p>5.5 不会因投资损失向本平台及其运营方、员工、合作伙伴提出任何形式的索赔或诉讼。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第六条 知识产权</h3>
              <div className="space-y-2 text-gray-700">
                <p>6.1 本平台的AI模型、算法、界面设计、分析框架等知识产权归平台运营方所有。</p>
                <p>6.2 用户仅获得服务使用权，不得对平台进行反向工程、复制或商业利用。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第七条 数据安全与隐私</h3>
              <div className="space-y-2 text-gray-700">
                <p>7.1 本平台将采取合理措施保护用户数据安全。</p>
                <p>7.2 本平台不会主动泄露用户个人信息，但法律法规要求披露的除外。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第八条 服务变更与终止</h3>
              <div className="space-y-2 text-gray-700">
                <p>8.1 本平台有权随时修改、暂停或终止部分或全部服务。</p>
                <p>8.2 用户可随时停止使用本服务，但已支付的费用不予退还。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第九条 争议解决</h3>
              <div className="space-y-2 text-gray-700">
                <p>9.1 本协议受中华人民共和国法律管辖。</p>
                <p>9.2 因本协议产生的争议，双方应友好协商解决；协商不成的，提交平台运营方所在地有管辖权的人民法院诉讼解决。</p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 mb-2">第十条 其他条款</h3>
              <div className="space-y-2 text-gray-700">
                <p>10.1 本协议构成双方就本服务达成的完整协议。</p>
                <p>10.2 本协议任何条款被认定无效，不影响其他条款的效力。</p>
                <p>10.3 本平台保留对本协议的最终解释权和修改权。</p>
              </div>
            </section>
          </div>

          {/* 用户确认 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-4">用户确认</h3>
            <p className="text-gray-700 mb-4">
              本人已仔细阅读、充分理解并同意接受上述所有条款，特别是免责条款和风险提示。本人确认：
            </p>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.aiAnalysis}
                  onChange={() => handleAgreementChange('aiAnalysis')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">我理解AI分析仅供参考，不构成投资建议</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.investmentRisk}
                  onChange={() => handleAgreementChange('investmentRisk')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">我理解股票投资存在亏损风险，包括全部本金损失</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.selfResponsibility}
                  onChange={() => handleAgreementChange('selfResponsibility')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">我承诺自行承担所有投资风险和损失</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.noLiability}
                  onChange={() => handleAgreementChange('noLiability')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">我同意平台对投资损失不承担任何责任</span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.serviceFee}
                  onChange={() => handleAgreementChange('serviceFee')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">我理解所支付费用仅为技术服务费，与投资收益无关</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allAgreed}
            className={`px-6 py-2 rounded-md transition-colors flex items-center space-x-2 ${
              allAgreed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>同意并继续</span>
          </button>
        </div>
      </div>
    </div>
  )
} 