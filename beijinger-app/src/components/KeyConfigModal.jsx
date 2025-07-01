import React, { useState } from 'react';
import { XMarkIcon, KeyIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useApiKeys } from '../context/ApiKeyContext';

export default function KeyConfigModal({ isOpen, onClose }) {
  const { qwenKey, exaKey, saveKeys } = useApiKeys();
  const [tempQwenKey, setTempQwenKey] = useState(qwenKey);
  const [tempExaKey, setTempExaKey] = useState(exaKey);
  const [errors, setErrors] = useState({});

  const validateKeys = () => {
    const newErrors = {};
    
    if (!tempQwenKey.trim()) {
      newErrors.qwen = 'Qwen API Key 不能为空';
    } else if (!tempQwenKey.startsWith('sk-')) {
      newErrors.qwen = 'Qwen API Key 格式不正确（应以 sk- 开头）';
    }
    
    if (!tempExaKey.trim()) {
      newErrors.exa = 'Exa API Key 不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateKeys()) {
      saveKeys(tempQwenKey, tempExaKey);
      onClose();
    }
  };

  const handleClose = () => {
    setTempQwenKey(qwenKey);
    setTempExaKey(exaKey);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <KeyIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">API Key 配置</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">使用说明</h3>
            <p className="text-sm text-blue-800 mb-3">
              为了保护您的隐私，本应用不会将您的 API Key 发送到我们的服务器。
              所有 API 调用都直接从您的浏览器发送到对应的服务提供商。
            </p>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <a 
                  href="https://help.aliyun.com/zh/dashscope/developer-reference/api-key-management" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  获取 Qwen API Key
                </a>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <a 
                  href="https://exa.ai/api/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  获取 Exa API Key
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Qwen API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qwen TTS API Key
              </label>
              <input
                type="password"
                value={tempQwenKey}
                onChange={(e) => setTempQwenKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.qwen ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.qwen && (
                <p className="mt-1 text-sm text-red-600">{errors.qwen}</p>
              )}
            </div>

            {/* Exa API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exa API Key
              </label>
              <input
                type="password"
                value={tempExaKey}
                onChange={(e) => setTempExaKey(e.target.value)}
                placeholder="输入您的 Exa API Key"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.exa ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.exa && (
                <p className="mt-1 text-sm text-red-600">{errors.exa}</p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">安全提示</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• API Key 使用 Base64 编码存储在本地浏览器中</li>
              <li>• 请勿在公共设备上保存 API Key</li>
              <li>• 定期更换您的 API Key 以确保安全</li>
              <li>• 如有安全担忧，请随时清除保存的密钥</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}