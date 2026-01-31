| AIGC |
| --- |
| | ContentProducer | ContentPropagator | Label | ProduceID | PropagateID | ReservedCode1 | ReservedCode2 |
| --- | --- | --- | --- | --- | --- | --- |
| Minimax Agent AI | Minimax Agent AI | AIGC | 00000000000000000000000000000000 | 00000000000000000000000000000000 | 304502206b2aef5a6f0d17e76c1871f14e0bbb73a767a1b508ba2cfff7486eec3b4acfeb022100e59d89ed3baeabe651f6763b966eae7fc5c46d48f67e482f04de81d252ed387b | 3045022028834c822fde0f89b213f7b1b533797c471d7e8b6b21d908534d8c8f8b41819b022100ae520acf4265569e423ae124964b9b3da57cb1cb2a11eccb72f146641ceb0a84 |

# 万维银客城 (INKE CITY)

一个赛博朋克风格的阅读社区网站，融合作品分享和社区交流功能。

🌐 **线上地址：[https://inke3.vercel.app](https://inke3.vercel.app)**

---

## 🎨 设计特征

- **赛博朋克主题**：霓虹紫、霓虹粉、霓虹蓝配色方案
- **炫酷特效**：发光效果、扫描线、粒子动画
- **响应式设计**：完美支持移动端、平板和桌面端（含汉堡菜单）
- **现代UI**：使用 Orbitron 和 Rajdhani 字体，锈银横版 Logo

---

## ✨ 核心功能

### 1. 用户系统
- ✅ 用户注册/登录（Supabase Auth）
- ✅ 用户个人主页
- ✅ 用户资料展示（昵称优先级：display_name > username）

### 2. 作品库（Works Library）
- ✅ 作品上传（标题、简介、内容、封面）
- ✅ 封面图片上传（Supabase Storage）
- ✅ 标签系统（多标签支持）
- ✅ 作品列表展示（网格布局）
- ✅ 作品详情页面
- ✅ 按标签筛选
- ✅ 作品点赞功能（实时计数更新）
- ✅ 作品收藏功能（实时计数更新）

### 3. 闲聊版面（Chat Forum）
- ✅ 发帖功能
- ✅ 回复/评论功能（支持嵌套回复）
- ✅ 帖子列表展示
- ✅ 帖子详情页

### 4. 通知系统（Notification）
- ✅ 作品点赞通知
- ✅ 作品收藏通知
- ✅ 帖子评论通知
- ✅ 评论回复通知
- ✅ 铃铛图标 + 未读数量红点
- ✅ 下拉通知列表（最近20条）
- ✅ 每30秒自动刷新未读数
- ✅ 点击通知跳转到相关内容
- ✅ 标记已读 / 全部已读
- ✅ 移动端响应式通知面板（全屏遮罩）

### 5. 搜索功能
- ✅ 按作者搜索
- ✅ 按作品名称搜索
- ✅ 按标签搜索
- ✅ 多类型筛选（作品/帖子/作者/标签）

### 6. Toast 提示系统
- ✅ 操作成功/失败反馈（点赞、收藏、评论等）
- ✅ 赛博朋克风格样式
- ✅ 登录/注册状态提示

### 7. 个人中心
- ✅ 我的作品列表
- ✅ 我的收藏列表

---

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** — 构建工具
- **Tailwind CSS** — 样式框架
- **React Router** — 路由管理
- **Lucide React** — SVG图标库
- **Sonner** — Toast 通知
- **date-fns** — 时间格式化（中文）
- **Radix UI** — 无样式组件库

### 后端
- **Supabase Auth** — 用户认证
- **Supabase Database** — PostgreSQL数据库
- **Supabase Storage** — 图片存储

---

## 📂 项目结构

```
inke3/
├── public/
│   └── 万维银客城横版 logo.png
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Hero.tsx
│   │   ├── InkeCityLogo.tsx
│   │   ├── MercuryDropsLogo.tsx
│   │   ├── Navbar.tsx              # 响应式导航（含汉堡菜单）
│   │   ├── NotificationBell.tsx    # 通知铃铛组件
│   │   ├── PostCard.tsx
│   │   ├── ProtectedRoute.tsx      # 鉴权路由守卫
│   │   ├── TagPill.tsx
│   │   ├── Toaster.tsx             # Toast 提示组件
│   │   └── WorkCard.tsx
│   ├── hooks/
│   ├── lib/
│   │   ├── AuthContext.tsx          # 认证上下文
│   │   └── supabase.ts             # Supabase 客户端
│   ├── pages/
│   │   ├── Forum.tsx
│   │   ├── ForumDetail.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── NewPost.tsx
│   │   ├── NewWork.tsx
│   │   ├── Profile.tsx             # 个人中心（含收藏列表）
│   │   ├── Register.tsx
│   │   ├── Search.tsx
│   │   ├── WorkDetail.tsx          # 作品详情（含点赞收藏）
│   │   └── Works.tsx
│   ├── types/
│   │   └── database.types.ts       # Supabase 类型定义
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .env.example
├── DEV_LOG.md                      # 开发日志
├── package.json
├── tailwind.config.js
├── tsconfig.app.json
└── vite.config.ts
```

---

## 🗄️ 数据库结构

### 核心表
| 表名 | 描述 |
|------|------|
| `profiles` | 用户资料（id, username, display_name, bio） |
| `works` | 作品（id, user_id, title, description, content, cover_url） |
| `tags` | 标签 |
| `work_tags` | 作品-标签关联表 |
| `posts` | 论坛帖子（id, user_id, title, content） |
| `comments` | 评论（id, post_id, user_id, content, parent_id） |
| `likes` | 点赞记录（user_id, work_id） |
| `favorites` | 收藏记录（user_id, work_id） |
| `notifications` | 通知（id, user_id, actor_id, type, is_read） |

### 通知触发器
| 触发器 | 触发条件 | 通知类型 |
|--------|----------|----------|
| `notify_work_like()` | 作品被点赞 | like |
| `notify_work_favorite()` | 作品被收藏 | favorite |
| `notify_post_comment()` | 帖子被评论 | comment |
| `notify_comment_reply()` | 评论被回复 | reply |

> 所有触发器包含 CHECK 约束，防止自己给自己发通知。

---

## 🚀 本地开发

### 环境要求
- Node.js 18+
- pnpm

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/mooner2666/inke3.git
cd inke3

# 安装依赖
pnpm install

# 配置环境变量（复制 .env.example 并填入 Supabase 密钥）
cp .env.example .env

# 启动开发服务器
pnpm dev

# 手机访问（局域网）
pnpm dev --host
```

### 环境变量

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📱 移动端适配

- ✅ 响应式导航栏（桌面端横向菜单 / 移动端汉堡菜单）
- ✅ 通知面板移动端全屏显示（带遮罩）
- ✅ Logo 响应式缩放（手机 h-12 / 桌面 h-16）
- ✅ 触摸友好的交互区域

---

## 🔒 安全配置

### 已完成
- ✅ Supabase RLS（行级安全）开启
- ✅ Function Search Path 固定（防止 SQL 注入）
- ✅ 通知表 RLS 策略配置
- ✅ 密码最低长度要求设置

### 待处理（上线前）
- ⏳ likes / favorites / notifications 表完善 RLS 策略
- ⏳ 密码泄露保护（需 Pro 计划）
- ⏳ Google / Apple 第三方登录配置

---

## 📝 功能使用指南

### 注册与登录
1. 访问网站首页
2. 点击右上角"注册"按钮
3. 填写邮箱、用户名、显示名称和密码
4. 或使用测试账号直接登录

### 发布作品
1. 登录账号后，点击导航栏"作品库"
2. 点击"发布作品"按钮
3. 填写标题、简介、内容
4. 上传封面图片（可选）
5. 添加标签（可选）
6. 点击"发布作品"

### 点赞与收藏
1. 进入任意作品详情页
2. 点击♡图标点赞，点击★图标收藏
3. 操作会触发 Toast 提示和通知

### 发表帖子
1. 登录后，访问"闲聊版面"
2. 点击"发新帖"按钮
3. 选择分类（闲聊/通用）
4. 填写标题和内容
5. 点击"发布帖子"

### 搜索功能
1. 点击导航栏"搜索"
2. 输入关键词
3. 选择搜索类型（全部/作品/帖子/作者/标签）
4. 点击"搜索"按钮查看结果

### 查看通知
1. 登录后，点击导航栏铃铛图标
2. 红点数字为未读通知数量
3. 点击通知项跳转到相关内容
4. 可逐条标记已读或点击"全部已读"

---

## 📋 许可证

本项目由 Minimax Agent AI 创建。