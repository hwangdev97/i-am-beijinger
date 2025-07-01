/**
 * Qwen TTS API 封装
 */

// 支持的音色选项
export const VOICE_OPTIONS = {
  Dylan: '北京话男声（推荐）',
  Cherry: '普通话女声',
  Xiaoxiao: '甜美女声',
  Xiaogang: '温厚男声',
  Ruoxi: '知性女声',
  Siqi: '甜美女声',
  Sijia: '温暖女声',
  Sicheng: '厚重男声',
  Aiqi: '甜美女声',
  Aida: '知性女声',
  Aitong: '童真女声',
  Aiwei: '知性女声'
};

/**
 * 使用 Qwen TTS 合成语音
 * @param {string} text - 要合成的文本
 * @param {string} voice - 音色，默认为 Dylan（北京话）
 * @param {string} apiKey - API Key
 * @returns {Promise<string>} 音频文件的 URL
 */
export async function synthesizeText(text, voice = 'Dylan', apiKey) {
  if (!text || !text.trim()) {
    throw new Error('文本内容不能为空');
  }

  if (!apiKey) {
    throw new Error('API Key 不能为空');
  }

  // 文本长度限制
  if (text.length > 5000) {
    throw new Error('文本长度不能超过 5000 字符');
  }

  const requestBody = {
    model: 'qwen-audio-tts-v1',
    input: {
      text: text.trim(),
      voice: voice
    },
    parameters: {
      text_type: 'PlainText',
      sample_rate: 16000,
      format: 'mp3'
    }
  };

  try {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2speech/speech-synthesis',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // 如果无法解析错误响应，使用默认错误消息
      }

      throw new Error(`TTS 请求失败: ${errorMessage}`);
    }

    const result = await response.json();

    if (result.output && result.output.audio_url) {
      return result.output.audio_url;
    } else if (result.output && result.output.audio) {
      // 处理直接返回音频数据的情况
      return `data:audio/mp3;base64,${result.output.audio}`;
    } else {
      throw new Error('API 响应格式不正确，未找到音频数据');
    }

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查您的网络连接');
    }
    
    // 重新抛出已知错误
    throw error;
  }
}

/**
 * 将长文本分段处理
 * @param {string} text - 长文本
 * @param {number} maxLength - 每段最大长度
 * @returns {string[]} 分段后的文本数组
 */
export function splitTextForTTS(text, maxLength = 500) {
  if (text.length <= maxLength) {
    return [text];
  }

  const segments = [];
  let currentSegment = '';
  
  // 按句子分割（中文句号、问号、感叹号）
  const sentences = text.split(/([。！？\n])/);
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] + (sentences[i + 1] || '');
    
    if (currentSegment.length + sentence.length <= maxLength) {
      currentSegment += sentence;
    } else {
      if (currentSegment) {
        segments.push(currentSegment.trim());
        currentSegment = sentence;
      } else {
        // 单句超长，强制分割
        segments.push(sentence.substring(0, maxLength));
        currentSegment = sentence.substring(maxLength);
      }
    }
  }
  
  if (currentSegment.trim()) {
    segments.push(currentSegment.trim());
  }
  
  return segments.filter(segment => segment.length > 0);
}

/**
 * 批量合成语音
 * @param {string[]} textSegments - 文本段落数组
 * @param {string} voice - 音色
 * @param {string} apiKey - API Key
 * @param {function} onProgress - 进度回调函数
 * @returns {Promise<string[]>} 音频 URL 数组
 */
export async function synthesizeTextBatch(textSegments, voice = 'Dylan', apiKey, onProgress) {
  const audioUrls = [];
  
  for (let i = 0; i < textSegments.length; i++) {
    try {
      const audioUrl = await synthesizeText(textSegments[i], voice, apiKey);
      audioUrls.push(audioUrl);
      
      if (onProgress) {
        onProgress(i + 1, textSegments.length);
      }
      
      // 添加小延迟避免请求过于频繁
      if (i < textSegments.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      throw new Error(`第 ${i + 1} 段合成失败: ${error.message}`);
    }
  }
  
  return audioUrls;
}