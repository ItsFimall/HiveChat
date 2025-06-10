<div align="center">

<img width="32" height="32" src="https://jiantuku.oss-cn-beijing.aliyuncs.com/share/logo.png" />

<img height="32" alt="HiveChat" src="https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat.png" />

<p><a href="https://github.com/ItsFimall/HiveChat/blob/main/README.md">中文</a> ｜ English</p>

<a href="https://deepwiki.com/ItsFimall/HiveChat" target="_blank"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>

<p>An AI chat app designed for small teams, supporting models like DeepSeek, OpenAI, Claude, and Gemini.</p>

<p>Compared to the original HiveNexus version:</p>
<p>• Third-party login has been removed.</p>
<p>• A sharing feature has been added.</p>

</div>

---

## 1. Feature Overview

Only one administrator needs to configure it—then the whole team can easily access various AI models.

* Email login support
* User group management:

  * Assign different models to different user groups
  * Set monthly token limits for each group
* Support for MCP server (SSE mode)
* DeepSeek thought chain visualization
* LaTeX and Markdown rendering
* Image understanding
* AI agents
* Cloud data storage
* Supported AI providers:

  * OpenAI
  * Claude
  * Gemini
  * DeepSeek
  * Moonshot
  * Volcano Ark (Doubao)
  * Alibaba Qwen
  * Baidu Qianfan
  * Tencent Hunyuan
  * Zhipu
  * OpenRouter
  * Grok
  * Ollama
  * SiliconFlow
  * Custom OpenAI-compatible providers

### End-user Portal

Log in and start chatting.

![image](https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/01.png)

MCP in action:

![image](https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/02.png)

---

### Admin Dashboard

* Configure AI model providers
* Add users manually or enable/disable registration—ideal for companies, schools, or small teams
* View and manage all users

![image](https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/03.png)

<details>
<summary>More Images</summary>
User group settings, assign accessible models and token limits per group:

<img src="https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/04.png" />
<img src="https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/05.png" />

Email and third-party login options:

<img src="https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/06.png" />

MCP configuration:

<img src="https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/07.png" />

Search settings:

<img src="https://jiantuku.oss-cn-beijing.aliyuncs.com/share/hivechat/08.png" />
</details>

---

## 3. Tech Stack

* Next.js
* TailwindCSS
* Auth.js
* PostgreSQL
* Drizzle ORM
* Ant Design

---

## 4. Installation & Deployment

### Method 1: Local Deployment

> ⚠️ Note:
> If upgrading from an older version, there may be database changes. Run `npm run initdb` to update the schema. It’s safe to run even if no changes occurred.

1. Clone the project:

```bash
git clone https://github.com/HiveNexus/hivechat.git
```

2. Install dependencies:

```bash
cd hivechat
npm install
```

3. Copy and edit the config file:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
DATABASE_URL=postgres://postgres:password@localhost/hivechat
AUTH_SECRET=your_random_32_byte_string
ADMIN_CODE=your_admin_code
NEXTAUTH_URL=http://127.0.0.1:3000
EMAIL_AUTH_STATUS=ON
```

4. Initialize the database:

```bash
npm run initdb
```

5. Start the app:

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

6. Initialize admin account:
   Visit `http://localhost:3000/setup` to configure the admin account.

---

### Method 2: Docker Deployment

> Note:
> Currently, there is no SQL script for Docker upgrades. For testing, delete the `hivechat_postgres_data` volume to auto-reset the DB. For production upgrades, contact the author.

1. Clone the project:

```bash
git clone https://github.com/HiveNexus/hivechat.git
```

2. Copy and edit config:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
DATABASE_URL=
AUTH_SECRET=your_random_32_byte_string
ADMIN_CODE=your_admin_code
NEXTAUTH_URL=http://127.0.0.1:3000
EMAIL_AUTH_STATUS=ON
```

3. Launch containers:

```bash
docker compose up -d
```

4. Initialize admin account:
   Visit `http://localhost:3000/setup` to complete setup.

---

### Method 3: Deploy on Vercel

> ⚠️ Note:
> If upgrading from a version before April 5, 2025, and deployment hangs, manually rename `daily_token_limit` to `monthly_token_limit` in the `group` table via the Vercel DB UI. This applies only to upgrades.

Click to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HiveNexus/hivechat.git&project-name=hivechat&env=DATABASE_URL&env=AUTH_SECRET&env=ADMIN_CODE&env=EMAIL_AUTH_STATUS&env=FEISHU_AUTH_STATUS&env=FEISHU_CLIENT_ID&env=FEISHU_CLIENT_SECRET)

Fill in these variables:

```
DATABASE_URL=postgres://postgres:password@localhost/hivechat
AUTH_SECRET=your_random_32_byte_string
ADMIN_CODE=your_admin_code
NEXTAUTH_URL=https://your-vercel-url
EMAIL_AUTH_STATUS=ON
```

#### Appendix: Neon PostgreSQL on Vercel

1. In Vercel, go to **Storage** > **Create Database**
2. Choose **Neon (Serverless Postgres)**
3. Follow setup and copy the generated `DATABASE_URL` into `.env`
4. Visit `http://localhost:3000/setup` to finish admin setup

