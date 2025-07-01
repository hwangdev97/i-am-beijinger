/**
 * 语音识别 API 封装
 */

/**
 * 检查浏览器是否支持语音识别
 * @returns {boolean} 是否支持语音识别
 */
export function isSpeechRecognitionSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * 获取语音识别构造函数
 * @returns {function} SpeechRecognition 构造函数
 */
function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

/**
 * 创建语音识别实例
 * @param {Object} options - 配置选项
 * @returns {Object} 语音识别实例和控制方法
 */
export function createSpeechRecognition(options = {}) {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('当前浏览器不支持语音识别功能');
  }

  const {
    language = 'zh-CN',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  const SpeechRecognition = getSpeechRecognition();
  const recognition = new SpeechRecognition();

  // 配置识别参数
  recognition.lang = language;
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;
  recognition.maxAlternatives = maxAlternatives;

  let isListening = false;
  let finalTranscript = '';
  let interimTranscript = '';

  // 事件处理器
  const eventHandlers = {
    onStart: null,
    onEnd: null,
    onResult: null,
    onError: null,
    onInterim: null
  };

  recognition.onstart = () => {
    isListening = true;
    finalTranscript = '';
    interimTranscript = '';
    if (eventHandlers.onStart) {
      eventHandlers.onStart();
    }
  };

  recognition.onend = () => {
    isListening = false;
    if (eventHandlers.onEnd) {
      eventHandlers.onEnd(finalTranscript);
    }
  };

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    if (final) {
      finalTranscript += final;
      if (eventHandlers.onResult) {
        eventHandlers.onResult(finalTranscript, false);
      }
    }

    if (interim) {
      interimTranscript = interim;
      if (eventHandlers.onInterim) {
        eventHandlers.onInterim(interim);
      }
      if (eventHandlers.onResult) {
        eventHandlers.onResult(finalTranscript + interim, true);
      }
    }
  };

  recognition.onerror = (event) => {
    let errorMessage = '语音识别出错';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = '未检测到语音输入';
        break;
      case 'audio-capture':
        errorMessage = '无法访问麦克风';
        break;
      case 'not-allowed':
        errorMessage = '麦克风权限被拒绝';
        break;
      case 'network':
        errorMessage = '网络连接出错';
        break;
      case 'service-not-allowed':
        errorMessage = '语音识别服务不可用';
        break;
      case 'bad-grammar':
        errorMessage = '语法识别出错';
        break;
      case 'language-not-supported':
        errorMessage = '不支持的语言';
        break;
      default:
        errorMessage = `语音识别出错: ${event.error}`;
    }

    if (eventHandlers.onError) {
      eventHandlers.onError(new Error(errorMessage));
    }
  };

  return {
    start() {
      if (isListening) {
        throw new Error('语音识别已在进行中');
      }
      recognition.start();
    },

    stop() {
      if (isListening) {
        recognition.stop();
      }
    },

    abort() {
      if (isListening) {
        recognition.abort();
      }
    },

    isListening() {
      return isListening;
    },

    getFinalTranscript() {
      return finalTranscript;
    },

    getInterimTranscript() {
      return interimTranscript;
    },

    // 设置事件处理器
    onStart(handler) {
      eventHandlers.onStart = handler;
    },

    onEnd(handler) {
      eventHandlers.onEnd = handler;
    },

    onResult(handler) {
      eventHandlers.onResult = handler;
    },

    onError(handler) {
      eventHandlers.onError = handler;
    },

    onInterim(handler) {
      eventHandlers.onInterim = handler;
    }
  };
}

/**
 * 检查麦克风权限
 * @returns {Promise<boolean>} 是否有麦克风权限
 */
export async function checkMicrophonePermission() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // 立即停止流以释放麦克风
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 请求麦克风权限
 * @returns {Promise<boolean>} 是否获得权限
 */
export async function requestMicrophonePermission() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('浏览器不支持麦克风访问');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // 立即停止流以释放麦克风
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('麦克风权限被拒绝，请在浏览器设置中允许访问麦克风');
    } else if (error.name === 'NotFoundError') {
      throw new Error('未找到麦克风设备');
    } else if (error.name === 'NotReadableError') {
      throw new Error('麦克风设备被其他应用占用');
    } else {
      throw new Error(`无法访问麦克风: ${error.message}`);
    }
  }
}

/**
 * 获取支持的语言列表
 * @returns {Array} 语言选项
 */
export function getSupportedLanguages() {
  return [
    { code: 'zh-CN', name: '中文（普通话）' },
    { code: 'zh-TW', name: '中文（台湾）' },
    { code: 'zh-HK', name: '中文（香港）' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'es-ES', name: 'Español' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'ru-RU', name: 'Русский' }
  ];
}