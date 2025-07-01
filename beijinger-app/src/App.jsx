import React, { useState } from 'react';
import { 
  SpeakerWaveIcon, 
  MicrophoneIcon, 
  GlobeAltIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { ApiKeyProvider, useApiKeys } from './context/ApiKeyContext';
import KeyConfigModal from './components/KeyConfigModal';
import TextToSpeech from './components/TextToSpeech';
import SpeechToText from './components/SpeechToText';
import WebToSpeech from './components/WebToSpeech';

function AppContent() {
  const [activeTab, setActiveTab] = useState('text-to-speech');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const { hasKeys } = useApiKeys();

  const tabs = [
    {
      id: 'text-to-speech',
      name: '文本转语音',
      icon: SpeakerWaveIcon,
      component: TextToSpeech
    },
    {
      id: 'speech-to-text',
      name: '语音转文本',
      icon: MicrophoneIcon,
      component: SpeechToText
    },
    {
      id: 'web-to-speech',
      name: '网页转语音',
      icon: GlobeAltIcon,
      component: WebToSpeech
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                北京人模拟器
              </h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Beta
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* API Key Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hasKeys ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {hasKeys ? 'API 已配置' : 'API 未配置'}
                </span>
              </div>
              
              {/* Settings Button */}
              <button
                onClick={() => setShowKeyModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="配置 API Key"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!hasKeys ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cog6ToothIcon className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  需要配置 API Key
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    请先配置您的 Qwen TTS 和 Exa API Key 才能使用相关功能。
                    <button
                      onClick={() => setShowKeyModal(true)}
                      className="ml-1 font-medium underline hover:text-yellow-900"
                    >
                      立即配置
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Active Component */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              北京人模拟器 - 文本语音转换工具 | 
              <a href="https://github.com" className="ml-1 text-blue-600 hover:text-blue-800">
                GitHub
              </a>
            </p>
            <p className="mt-1">
              所有 API 调用均在您的浏览器中直接进行，我们不会存储您的数据
            </p>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <KeyConfigModal 
        isOpen={showKeyModal} 
        onClose={() => setShowKeyModal(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  );
}

export default App;
