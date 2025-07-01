/**
 * Exa API 封装
 */

/**
 * 验证 URL 格式
 * @param {string} url - 要验证的 URL
 * @returns {boolean} 是否为有效 URL
 */
export function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * 清理和格式化提取的文本内容
 * @param {string} text - 原始文本
 * @returns {string} 清理后的文本
 */
function cleanExtractedText(text) {
  if (!text) return '';
  
  return text
    // 移除多余的空白字符
    .replace(/\s+/g, ' ')
    // 移除多余的换行符
    .replace(/\n{3,}/g, '\n\n')
    // 移除首尾空白
    .trim()
    // 移除过短的行（可能是导航元素）
    .split('\n')
    .filter(line => line.trim().length > 10)
    .join('\n');
}

/**
 * 使用 Exa API 抽取网页内容
 * @param {string} url - 要抽取内容的网页 URL
 * @param {string} apiKey - Exa API Key
 * @returns {Promise<{title: string, content: string, url: string}>} 抽取的内容
 */
export async function fetchArticleContent(url, apiKey) {
  if (!url || !url.trim()) {
    throw new Error('URL 不能为空');
  }

  if (!apiKey) {
    throw new Error('Exa API Key 不能为空');
  }

  if (!isValidUrl(url)) {
    throw new Error('请输入有效的 URL（必须包含 http:// 或 https://）');
  }

  const requestBody = {
    ids: [url],
    contents: {
      text: {
        maxCharacters: 10000,
        includeHtmlTags: false
      }
    }
  };

  try {
    const response = await fetch('https://api.exa.ai/contents', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // 如果无法解析错误响应，使用默认错误消息
      }

      if (response.status === 401) {
        throw new Error('API Key 无效或已过期');
      } else if (response.status === 403) {
        throw new Error('API 权限不足或配额已用完');
      } else if (response.status === 404) {
        throw new Error('无法访问指定的网页');
      } else if (response.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      }

      throw new Error(`内容抽取失败: ${errorMessage}`);
    }

    const result = await response.json();

    if (!result.results || result.results.length === 0) {
      throw new Error('未能从该网页抽取到内容');
    }

    const article = result.results[0];
    
    if (!article.text || article.text.trim().length === 0) {
      throw new Error('网页内容为空或无法解析');
    }

    const cleanedContent = cleanExtractedText(article.text);
    
    if (cleanedContent.length < 50) {
      throw new Error('抽取的内容过短，可能该网页不支持内容提取');
    }

    return {
      title: article.title || '无标题',
      content: cleanedContent,
      url: article.url || url,
      author: article.author || undefined,
      publishedDate: article.publishedDate || undefined
    };

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查您的网络连接');
    }
    
    // 重新抛出已知错误
    throw error;
  }
}

/**
 * 搜索相关内容
 * @param {string} query - 搜索查询
 * @param {string} apiKey - Exa API Key
 * @param {number} numResults - 结果数量，默认为 5
 * @returns {Promise<Array>} 搜索结果
 */
export async function searchContent(query, apiKey, numResults = 5) {
  if (!query || !query.trim()) {
    throw new Error('搜索查询不能为空');
  }

  if (!apiKey) {
    throw new Error('Exa API Key 不能为空');
  }

  const requestBody = {
    query: query.trim(),
    numResults: Math.min(numResults, 10),
    contents: {
      text: {
        maxCharacters: 1000,
        includeHtmlTags: false
      }
    },
    type: 'auto'
  };

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // 如果无法解析错误响应，使用默认错误消息
      }

      throw new Error(`搜索失败: ${errorMessage}`);
    }

    const result = await response.json();

    if (!result.results || result.results.length === 0) {
      return [];
    }

    return result.results.map(item => ({
      title: item.title || '无标题',
      url: item.url,
      snippet: item.text ? cleanExtractedText(item.text).substring(0, 200) + '...' : '',
      score: item.score || 0,
      publishedDate: item.publishedDate || undefined,
      author: item.author || undefined
    }));

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查您的网络连接');
    }
    
    throw error;
  }
}