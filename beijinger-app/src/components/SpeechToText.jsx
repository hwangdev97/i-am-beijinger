import React, { useState, useEffect, useRef } from 'react';
import { 
  MicrophoneIcon, 
  StopIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useApiKeys } from '../context/ApiKeyContext';
import { 
  createSpeechRecognition, 
  isSpeechRecognitionSupported,
  requestMicrophonePermission 
} from '../api/speechApi';
import { synthesizeText } from '../api/qwenTtsApi';

export default function SpeechToText() {
  const { qwenKey } = useApiKeys();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // 检查浏览器支持
    if (!isSpeechRecognitionSupported()) {
      setError('当前浏览器不支持语音识别功能，请使用 Chrome、Edge 或 Safari');
    }

    return () => {
      // 清理资源
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const requestPermission = async () => {
    try {
      await requestMicrophonePermission();
      setHasPermission(true);
      setError('');
    } catch (err) {
      setError(err.message);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (!isSpeechRecognitionSupported()) {
      setError('当前浏览器不支持语音识别功能');
      return;
    }

    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) return;
    }

    try {
      const recognition = createSpeechRecognition({
        language: 'zh-CN',
        continuous: true,
        interimResults: true
      });

      recognitionRef.current = recognition;

      recognition.onStart(() => {
        setIsRecording(true);
        setError('');
        setTranscriptText('');
        setInterimText('');
      });

      recognition.onResult((text, isInterim) => {
        if (isInterim) {
          setInterimText(text.replace(transcriptText, ''));
        } else {
          setTranscriptText(text);
          setInterimText('');
        }
      });

      recognition.onEnd((finalText) => {
        setIsRecording(false);
        setTranscriptText(finalText);
        setInterimText('');
      });

      recognition.onError((err) => {
        setIsRecording(false);
        setError(err.message);
        setInterimText('');
      });

      recognition.start();

    } catch (err) {
      setError(err.message);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearText = () => {
    setTranscriptText('');
    setInterimText('');
    setAudioUrl('');
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!transcriptText.trim()) {
      setError('没有可转换的文本');
      return;
    }

    if (!qwenKey) {
      setError('请先配置 Qwen API Key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = await synthesizeText(transcriptText.trim(), 'Dylan', qwenKey);
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

  const copyToClipboard = async () => {
    if (transcriptText) {
      try {
        await navigator.clipboard.writeText(transcriptText);
        // 可以添加一个成功提示
      } catch (err) {
        setError('复制到剪贴板失败');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MicrophoneIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">语音转文本</h2>
          <p className="text-sm text-gray-600">
            通过麦克风录音，实时转换为文本并可再次合成语音
          </p>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isSpeechRecognitionSupported()}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <StopIcon className="w-8 h-8" />
            ) : (
              <MicrophoneIcon className="w-8 h-8" />
            )}
          </button>

          {/* Status Text */}
          <div className="text-center">
            {isRecording ? (
              <div className="space-y-1">
                <p className="text-lg font-medium text-red-600">正在录音...</p>
                <p className="text-sm text-gray-500">点击停止按钮结束录音</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-medium text-gray-700">点击开始录音</p>
                <p className="text-sm text-gray-500">
                  {hasPermission ? '已获得麦克风权限' : '需要麦克风权限'}
                </p>
              </div>
            )}
          </div>
        </div>
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

      {/* Transcript Display */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            识别结果
          </label>
          {transcriptText && (
            <button
              onClick={copyToClipboard}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              复制文本
            </button>
          )}
        </div>
        <div className="min-h-[120px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
          {transcriptText || interimText ? (
            <div className="text-gray-900">
              {transcriptText}
              {interimText && (
                <span className="text-gray-400 italic">{interimText}</span>
              )}
            </div>
          ) : (
            <div className="text-gray-400 italic">
              识别的文本将显示在这里...
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {transcriptText && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTextToSpeech}
            disabled={isLoading || !qwenKey}
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
                朗读文本
              </>
            )}
          </button>

          {audioUrl && (
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
          )}

          <button
            onClick={clearText}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4" />
            清除
          </button>
        </div>
      )}

      {/* Browser Support Info */}
      {!isSpeechRecognitionSupported() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">浏览器兼容性提示</h3>
              <p className="text-sm text-yellow-700 mt-1">
                语音识别功能需要现代浏览器支持，推荐使用：
              </p>
              <ul className="text-sm text-yellow-700 mt-1 ml-4">
                <li>• Chrome 25+</li>
                <li>• Edge 79+</li>
                <li>• Safari 14.1+</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 首次使用需要授权麦克风权限</li>
          <li>• 清晰地说话以获得更好的识别效果</li>
          <li>• 识别结果可以直接转换为北京话语音</li>
          <li>• 支持实时显示识别过程中的临时结果</li>
        </ul>
      </div>
    </div>
  );
}