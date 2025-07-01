import React, { useState } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  SpeakerWaveIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useApiKeys } from '../context/ApiKeyContext';
import { synthesizeText, VOICE_OPTIONS } from '../api/qwenTtsApi';

export default function TextToSpeech() {
  const { qwenKey } = useApiKeys();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Dylan');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  const maxLength = 1000;
  const remainingChars = maxLength - text.length;

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setError('请输入要转换的文本');
      return;
    }

    if (!qwenKey) {
      setError('请先配置 Qwen API Key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = await synthesizeText(text.trim(), selectedVoice, qwenKey);
      setAudioUrl(url);
      
      // 创建新的音频对象
      const newAudio = new Audio(url);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.onerror = () => {
        setError('音频播放失败');
        setIsPlaying(false);
      };
      setAudio(newAudio);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setError('音频播放失败');
        });
      }
    }
  };

  const handleStop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
      setError('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SpeakerWaveIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">文本转语音</h2>
          <p className="text-sm text-gray-600">
            输入文本，使用 Qwen TTS 合成北京话语音
          </p>
        </div>
      </div>

      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择音色
        </label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(VOICE_OPTIONS).map(([voice, description]) => (
            <option key={voice} value={voice}>
              {description}
            </option>
          ))}
        </select>
      </div>

      {/* Text Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            输入文本
          </label>
          <span className={`text-sm ${remainingChars < 50 ? 'text-red-600' : 'text-gray-500'}`}>
            {remainingChars} 字符剩余
          </span>
        </div>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="请输入要转换为语音的文本..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        {remainingChars < 0 && (
          <p className="mt-1 text-sm text-red-600">
            文本长度超出限制
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSynthesize}
          disabled={isLoading || !text.trim() || remainingChars < 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              合成中...
            </>
          ) : (
            <>
              <SpeakerWaveIcon className="w-4 h-4" />
              生成语音
            </>
          )}
        </button>

        {audioUrl && (
          <>
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="w-4 h-4" />
                  暂停
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  播放
                </>
              )}
            </button>

            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <StopIcon className="w-4 h-4" />
              停止
            </button>
          </>
        )}
      </div>

      {/* Audio Player (Hidden) */}
      {audioUrl && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              语音已生成，使用上方按钮控制播放
            </span>
            <a
              href={audioUrl}
              download="speech.mp3"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              下载音频
            </a>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 推荐使用 Dylan 音色获得最佳北京话效果</li>
          <li>• 单次输入文本不超过 {maxLength} 字符</li>
          <li>• 支持下载生成的音频文件</li>
          <li>• 在移动设备上请先点击播放按钮进行用户交互</li>
        </ul>
      </div>
    </div>
  );
}