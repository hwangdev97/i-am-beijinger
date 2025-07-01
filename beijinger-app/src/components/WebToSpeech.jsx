import React, { useState } from 'react';
import { 
  GlobeAltIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  LinkIcon 
} from '@heroicons/react/24/outline';
import { useApiKeys } from '../context/ApiKeyContext';
import { fetchArticleContent, isValidUrl } from '../api/exaApi';
import { synthesizeText, splitTextForTTS, synthesizeTextBatch } from '../api/qwenTtsApi';

export default function WebToSpeech() {
  const { exaKey, qwenKey } = useApiKeys();
  const [url, setUrl] = useState('');
  const [article, setArticle] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSynthesizing, setSynthesizing] = useState(false);
  const [error, setError] = useState('');
  const [audioUrls, setAudioUrls] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleExtractContent = async () => {
    if (!url.trim()) {
      setError('请输入网页 URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('请输入有效的 URL（必须包含 http:// 或 https://）');
      return;
    }

    if (!exaKey) {
      setError('请先配置 Exa API Key');
      return;
    }

    setIsExtracting(true);
    setError('');
    setArticle(null);

    try {
      const extractedArticle = await fetchArticleContent(url, exaKey);
      setArticle(extractedArticle);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSynthesizeArticle = async () => {
    if (!article || !article.content) {
      setError('没有可合成的内容');
      return;
    }

    if (!qwenKey) {
      setError('请先配置 Qwen API Key');
      return;
    }

    setSynthesizing(true);
    setError('');
    setAudioUrls([]);
    setCurrentAudioIndex(0);

    try {
      // 将长文本分段
      const textSegments = splitTextForTTS(article.content, 500);
      
      // 批量合成语音
      const urls = await synthesizeTextBatch(
        textSegments, 
        'Dylan', 
        qwenKey,
        (current, total) => {
          setProgress({ current, total });
        }
      );
      
      setAudioUrls(urls);
      
      // 自动播放第一个音频
      if (urls.length > 0) {
        playAudioAtIndex(0, urls);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSynthesizing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const playAudioAtIndex = (index, urls = audioUrls) => {
    if (index >= 0 && index < urls.length) {
      const audioUrl = urls[index];
      const newAudio = new Audio(audioUrl);
      
      newAudio.onended = () => {
        // 自动播放下一段
        const nextIndex = index + 1;
        if (nextIndex < urls.length) {
          playAudioAtIndex(nextIndex, urls);
        } else {
          setIsPlaying(false);
          setCurrentAudioIndex(0);
        }
      };
      
      newAudio.onerror = () => {
        setError('音频播放失败');
        setIsPlaying(false);
      };
      
      newAudio.play().then(() => {
        setAudio(newAudio);
        setCurrentAudioIndex(index);
        setIsPlaying(true);
      }).catch(() => {
        setError('音频播放失败');
      });
    }
  };

  const handlePlay = () => {
    if (audioUrls.length === 0) {
      setError('请先合成语音');
      return;
    }

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      playAudioAtIndex(currentAudioIndex);
    }
  };

  const handleStop = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      setCurrentAudioIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentAudioIndex > 0) {
      if (audio) {
        audio.pause();
      }
      playAudioAtIndex(currentAudioIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentAudioIndex < audioUrls.length - 1) {
      if (audio) {
        audio.pause();
      }
      playAudioAtIndex(currentAudioIndex + 1);
    }
  };

  const clearAll = () => {
    setUrl('');
    setArticle(null);
    setAudioUrls([]);
    setCurrentAudioIndex(0);
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GlobeAltIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">网页转语音</h2>
          <p className="text-sm text-gray-600">
            输入网页 URL，提取内容并转换为北京话语音
          </p>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          网页 URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleExtractContent}
            disabled={isExtracting || !url.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExtracting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                提取中...
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-4 h-4" />
                提取内容
              </>
            )}
          </button>
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

      {/* Article Preview */}
      {article && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {/* Article Header */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {article.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate max-w-xs"
                  >
                    {article.url}
                  </a>
                </div>
                {article.author && (
                  <span>作者: {article.author}</span>
                )}
                {article.publishedDate && (
                  <span>发布: {new Date(article.publishedDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Article Content Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">内容预览</h4>
              <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-3 text-sm text-gray-700">
                {article.content.substring(0, 500)}
                {article.content.length > 500 && '...'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                总字数: {article.content.length} 字符
              </p>
            </div>

            {/* Synthesis Controls */}
            <div className="flex flex-wrap gap-3 pt-2 border-t">
              <button
                onClick={handleSynthesizeArticle}
                disabled={isSynthesizing || !qwenKey}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSynthesizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    合成中... ({progress.current}/{progress.total})
                  </>
                ) : (
                  '转换为语音'
                )}
              </button>

              {audioUrls.length > 0 && (
                <>
                  <button
                    onClick={handlePlay}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevious}
                      disabled={currentAudioIndex === 0}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一段
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentAudioIndex + 1} / {audioUrls.length}
                    </span>
                    <button
                      onClick={handleNext}
                      disabled={currentAudioIndex === audioUrls.length - 1}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一段
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample URLs */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">示例网址</h3>
        <div className="space-y-2">
          {[
            'https://baike.baidu.com/item/北京/154606',
            'https://zh.wikipedia.org/wiki/北京话',
            'https://news.cctv.com'
          ].map((sampleUrl, index) => (
            <button
              key={index}
              onClick={() => setUrl(sampleUrl)}
              className="block text-sm text-blue-800 hover:text-blue-900 underline"
            >
              {sampleUrl}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支持大多数新闻网站和博客文章</li>
          <li>• 长文章会自动分段处理，可分段播放</li>
          <li>• 建议选择内容丰富的文章页面，避免纯导航页面</li>
          <li>• 某些网站可能有反爬虫保护，提取可能失败</li>
        </ul>
      </div>
    </div>
  );
}