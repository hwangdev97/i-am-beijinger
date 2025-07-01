# 部署指南

本文档详细说明如何将北京人模拟器部署到各种平台。

## 🚀 Vercel 部署（推荐）

Vercel 是最推荐的部署平台，支持自动部署和 PWA 功能。

### 方法一：通过 Vercel 网页界面

1. **准备代码**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择你的 GitHub 仓库

3. **配置项目**
   - Framework Preset: 选择 "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成
   - 获取部署 URL

### 方法二：使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 在项目根目录执行
   vercel

   # 生产部署
   vercel --prod
   ```

### 自动部署设置

项目已配置 GitHub Actions，每次推送到 main 分支时自动部署：

1. **获取 Vercel 令牌**
   - 访问 [Vercel Dashboard](https://vercel.com/account/tokens)
   - 创建新的令牌
   - 复制令牌值

2. **配置 GitHub Secrets**
   - 进入 GitHub 仓库设置
   - 选择 "Secrets and variables" > "Actions"
   - 添加以下 secrets：
     - `VERCEL_TOKEN`: 你的 Vercel 令牌
     - `ORG_ID`: 你的 Vercel 组织 ID
     - `PROJECT_ID`: 你的 Vercel 项目 ID

3. **获取 ID 值**
   ```bash
   # 在项目目录运行
   vercel link
   # 这会创建 .vercel/project.json 文件，包含所需的 ID
   ```

## 🌐 其他部署平台

### Netlify

1. **构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **部署**
   ```bash
   # 安装 Netlify CLI
   npm install -g netlify-cli

   # 构建项目
   npm run build

   # 部署
   netlify deploy --prod --dir=dist
   ```

### GitHub Pages

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **添加部署脚本到 package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **配置 base URL**
   在 `vite.config.js` 中添加：
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... 其他配置
   })
   ```

4. **部署**
   ```bash
   npm run build
   npm run deploy
   ```

### 腾讯云 COS

1. **安装腾讯云 CLI**
   ```bash
   npm install -g @tencent-cloud/cli
   ```

2. **配置访问密钥**
   ```bash
   tccli configure
   ```

3. **上传文件**
   ```bash
   # 构建项目
   npm run build

   # 上传到 COS（需要先创建存储桶）
   tccli cos sync ./dist/ cos://your-bucket-name/
   ```

### 阿里云 OSS

1. **安装阿里云 CLI**
   ```bash
   npm install -g @alicloud/cli
   ```

2. **配置访问密钥**
   ```bash
   aliyun configure
   ```

3. **上传文件**
   ```bash
   # 构建项目
   npm run build

   # 上传到 OSS
   aliyun oss sync ./dist/ oss://your-bucket-name/
   ```

## 🔧 环境配置

### 环境变量

如果需要配置环境变量，创建 `.env` 文件：

```env
# .env.local
VITE_APP_NAME=北京人模拟器
VITE_APP_VERSION=1.0.0
```

在代码中使用：
```javascript
const appName = import.meta.env.VITE_APP_NAME
```

### CDN 配置

对于大流量应用，建议配置 CDN：

1. **Vercel**: 自动提供全球 CDN
2. **Netlify**: 自动提供全球 CDN
3. **腾讯云/阿里云**: 需要单独配置 CDN 服务

## 🛡️ 安全配置

### HTTPS 强制

确保所有平台都启用 HTTPS，这对 PWA 功能是必需的。

### 安全头设置

在 `vercel.json` 中已配置安全头：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 📊 性能优化

### 构建优化

项目已配置代码分割和压缩：

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['@heroicons/react']
        }
      }
    }
  }
})
```

### PWA 缓存策略

Service Worker 已配置智能缓存：

- 静态资源：缓存优先
- API 请求：网络优先，缓存备用
- 音频文件：按需缓存

## 🔍 部署验证

部署完成后，验证以下功能：

### 基本功能检查

- [ ] 页面正常加载
- [ ] 所有路由工作正常
- [ ] API Key 配置界面可用
- [ ] 所有功能模块可访问

### PWA 功能检查

- [ ] Manifest 文件可访问 (`/manifest.webmanifest`)
- [ ] Service Worker 注册成功
- [ ] 应用可安装到桌面
- [ ] 离线访问正常

### 性能检查

使用以下工具检查性能：

1. **Lighthouse**: 
   - 打开 Chrome DevTools
   - 运行 Lighthouse 审计
   - 确保 PWA 得分 ≥ 90

2. **WebPageTest**: 
   - 访问 [webpagetest.org](https://www.webpagetest.org)
   - 测试加载速度

3. **GTmetrix**: 
   - 访问 [gtmetrix.com](https://gtmetrix.com)
   - 分析性能指标

## 🆘 常见问题

### Q: PWA 功能不工作？

A: 检查以下几点：
- 网站必须通过 HTTPS 访问
- Manifest 文件格式正确
- Service Worker 注册成功
- 图标文件存在且可访问

### Q: 构建失败？

A: 检查：
- Node.js 版本 ≥ 16
- 所有依赖已正确安装
- 没有 ESLint 错误

### Q: 部署后白屏？

A: 检查：
- 构建输出目录配置正确
- 静态资源路径正确
- 没有 JavaScript 错误

### Q: API 调用失败？

A: 确认：
- 部署平台支持外部 API 调用
- CORS 配置正确
- API Key 在生产环境中可用

## 📞 技术支持

如果遇到部署问题：

1. 查看构建日志
2. 检查浏览器控制台错误
3. 参考平台官方文档
4. 在 GitHub Issues 中提问

---

**祝您部署顺利！** 🚀