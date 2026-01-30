# Inke3 全栈开发指挥手册

> **项目状态**：基础架构已跑通（Vite + Vercel + Supabase + Lightsail DNS）
> **核心原则**：先同步代码再推送，先说明联动再写功能。

---

## 快速导航

1. [填坑历史记录](#填坑历史记录)
2. [Git 同步急救包](#git-同步急救包)
3. [function模块待办](#function模块待办)
4. [核心联动包逻辑](#核心联动包逻辑)
5. [部署与协作规范](#部署与协作规范)

---

## 填坑历史记录

### 2026-01-29 | 域名与部署排坑
* **域名解析**：`inke3.com` 不生效。  
  **解决**：将 DNS 换成 Lightsail 提供的 **4 个 NS 地址**。
* **存储空间**：作品无法上传。  
  **解决**：在 Supabase 新建 `works` **Bucket** 并将 RLS 设为公开。
* **刷新 404**：子页面刷新报错。  
  **解决**：根目录建 `vercel.json` 配置 `rewrites` 重定向。
* **推送失败**：报错 `rejected`。  
  **解决**：执行 `git pull --rebase` 同步后再 push。

### 2026-01-28 | 接口与基础调优
* **API 适配**：AI 生成接口无效。  
  **解决**：手动更换为 Supabase 官网 URL/Key。
* **pnpm 报错**：插件安装失败。  
  **解决**：删掉 `pnpm-lock.yaml` 或切换为 `npm install`。
* **Auth 注册**：注册无反应。  
  **解决**：在 Supabase 后台开启 Authentication 注册开关。

---

## Git 同步急救包

*注意：每次推送代码前，务必按照以下顺序操作，防止冲突*

```bash
# 1. 基础上传流程
git add . 
git commit -m "feat: 这里写你改了什么"
git push origin main

# 2. 推送失败修复
git pull origin main --rebase

# 3. 身份配置
git config user.email "你的邮箱"
git config user.name "你的名字"

---

# 1. 创建并切换到一个新分支 (比如叫 dev-comment)
git checkout -b dev-comment

# 2. 在这个分支上随便改代码，然后正常提交
git add .
git commit -m "feat: 尝试添加评论功能"

# 3. 如果写好了，想合并回主线
git checkout main       # 先回到主线
git merge dev-comment   # 把刚才写的评论功能合进来

---
### 🌿 开发分支流 (Feature Branch Workflow)
1. **开工**：`git checkout -b 分支名` (例如 `git checkout -b feat-join-btn`)
2. **提交**：`git add .` -> `git commit -m "完成某功能"`
3. **回主线**：`git checkout main`
4. **拿最新**：`git pull origin main` (防止别人改了代码)
5. **合代码**：`git merge 分支名`
6. **推线上**：`git push origin main`

```

---

## function模块待办

按板块划分，确保 UI 统一与数据联动。

### 1. 首页 (Home)
- [ ] **功能**：增加“加入我们”快捷按钮。
- [ ] **联动**：点击后判断登录状态，未登录跳转注册，已登录跳转作品库。

### 2. 作品库 (Works Library)
- [ ] **功能**：瀑布流展示作品，支持点击进入详情。
- [ ] **联动**：作品卡片 (`WorkCard`) 上的点赞数需从 `likes` 表实时读取。

### 3. 论坛板块 (Forum)
- [ ] **功能**：完善发帖表单（支持 Markdown 或富文本）。
- [ ] **联动**：增加评论回复功能；帖子分类（技术交流、作品反馈）。

### 4. 个人中心 (Profile)
- [ ] **功能**：展示“我的作品”与“我的收藏”。
- [ ] **联动**：当用户在作品库点击收藏，此处列表需同步增加。

---

## 核心联动包逻辑

> **提示**：开发新功能前，先将对应的联动逻辑发给 AI，确保全站风格与数据同步。

| 联动名称 | 出发点 (UI) | 存储点 (DB) | 同步影响 (Impact) |
| :--- | :--- | :--- | :--- |
| **身份权限** | 登录/退出按钮 | `auth.users` | 只有作者能编辑作品，未登录隐藏功能。 |
| **点赞热度** | 卡片爱心图标 | `likes` 表 | 图标变色，数字 +1，个人中心显示被赞总数。 |
| **评论社交** | 作品评论框 | `comments` 表 | 评论列表实时刷新，作者收到红点通知。 |
| **个人资料** | 设置页修改头像 | `profiles` 表 | 论坛、作品、评论区头像全站实时同步。 |

---

## 部署与协作规范

* **指挥 AI 规范**：先喂本日志，再给现有组件代码，最后下达“联动指令”。
* **Git 规范**：`pull --rebase` 同步后再 `push`。
* **测试规范**：Vercel 部署完成后，必须使用浏览器 **无痕模式** 访问测试。

### 长期待办
- [ ] 备份 Supabase 数据库表结构（SQL 脚本）。
- [ ] 接入评论系统（联动：作品详情页 <-> 个人中心消息提醒）。