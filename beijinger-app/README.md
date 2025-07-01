# 北京人模拟器

一个基于 React 的 Web 应用，提供文本转语音、语音转文本和网页内容转语音功能，特别支持北京话语音合成。

![预览图](https://via.placeholder.com/800x400/1f2937/ffffff?text=北京人模拟器+预览)

## 🎯 功能特性

- **文本转语音**: 输入文本，使用 Qwen TTS 合成北京话语音
- **语音转文本**: 通过浏览器麦克风录音，实时转换为文本
- **网页转语音**: 输入网页 URL，提取内容并转换为语音
- **PWA 支持**: 支持安装到设备，离线使用
- **响应式设计**: 完美适配桌面和移动设备
- **隐私保护**: 所有 API 调用在浏览器端进行，不存储用户数据

## 🚀 在线体验

访问 [https://beijinger-app.vercel.app](https://beijinger-app.vercel.app) 立即体验

## 📋 使用前准备

使用本应用需要获取以下 API Key：

### 1. Qwen TTS API Key
- 访问 [阿里云大模型服务平台](https://dashscope.aliyuncs.com/)
- 注册账号并开通 Qwen 语音合成服务
- 获取 API Key

### 2. Exa API Key (网页转语音功能)
- 访问 [Exa AI](https://exa.ai/)
- 注册账号并获取 API Key

## 🛠️ 本地开发

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/your-username/beijinger-app.git
cd beijinger-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 项目结构

```
src/
├── components/          # React 组件
│   ├── TextToSpeech.jsx        # 文本转语音组件
│   ├── SpeechToText.jsx        # 语音转文本组件
│   ├── WebToSpeech.jsx         # 网页转语音组件
│   ├── KeyConfigModal.jsx      # API Key 配置组件
│   └── PWAInstallPrompt.jsx    # PWA 安装提示组件
├── api/                # API 封装
│   ├── qwenTtsApi.js          # Qwen TTS API
│   ├── exaApi.js              # Exa API
│   └── speechApi.js           # 语音识别 API
├── context/            # React Context
│   └── ApiKeyContext.jsx      # API Key 状态管理
├── App.jsx             # 主应用组件
└── main.jsx            # 应用入口
```

## 🔧 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **图标**: Heroicons
- **PWA**: vite-plugin-pwa
- **部署**: Vercel

## 📱 PWA 功能

本应用支持 Progressive Web App 特性：

- **离线使用**: Service Worker 缓存关键资源
- **安装到设备**: 支持添加到主屏幕
- **响应式**: 完美适配各种设备
- **快速加载**: 优化的缓存策略

### 安装 PWA

1. 在支持的浏览器中访问应用
2. 点击地址栏的"安装"图标
3. 或者等待应用显示安装提示
4. 点击"安装"按钮完成安装

## 🔒 隐私和安全

- **客户端处理**: 所有 API 调用都在浏览器中进行
- **不存储密钥**: API Key 仅在本地存储，不会上传到服务器
- **HTTPS 通信**: 所有外部 API 调用都通过 HTTPS 进行
- **数据保护**: 不收集或存储用户的音频或文本数据

## 🌐 部署

### Vercel 部署 (推荐)

1. Fork 本仓库到你的 GitHub 账号
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 选择 "Vite" 框架预设
4. 点击部署

### 其他平台部署

本项目是纯前端应用，可以部署到任何静态托管平台：

- Netlify
- GitHub Pages
- Firebase Hosting
- 腾讯云静态网站托管
- 阿里云 OSS

构建命令：`npm run build`
输出目录：`dist`

## 🔧 配置选项

### API 设置

在应用中点击右上角的设置图标，配置你的 API Key：

- **Qwen API Key**: 用于文本转语音功能
- **Exa API Key**: 用于网页内容提取功能

### 音色选择

支持多种音色，推荐使用：
- **Dylan**: 北京话男声（推荐）
- **Cherry**: 普通话女声
- **Xiaoxiao**: 甜美女声

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

### 开发指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 常见问题

### Q: 语音识别不工作？
A: 请确保：
- 使用支持的浏览器（Chrome、Edge、Safari）
- 已授予麦克风权限
- 网站通过 HTTPS 访问

### Q: API 调用失败？
A: 请检查：
- API Key 是否正确配置
- API Key 是否有足够的配额
- 网络连接是否正常

### Q: 音频播放失败？
A: 在移动设备上，需要用户先进行点击操作才能播放音频

### Q: 网页内容提取失败？
A: 某些网站可能有反爬虫保护，建议尝试其他网站

## 📞 支持

如有问题，请：
1. 查看[常见问题](#-常见问题)
2. 搜索现有的 [Issues](https://github.com/your-username/beijinger-app/issues)
3. 创建新的 Issue

---

**北京人模拟器** - 让文字发出北京的声音 🎤
