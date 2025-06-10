HiveChat is an AI chat application designed specifically for small teams, offering support for a wide range of models including Deepseek, OpenAI, Claude, and Gemini. A key difference from the original HiveNexus is the removal of third-party login options, simplifying the authentication process. Additionally, HiveChat introduces a new sharing feature, enhancing collaboration within teams.

1. Feature Overview
One administrator configures, and the entire team can easily use various AI models.

Supports email login configuration

Supports user group management

Set different available models for grouped users

Set separate monthly token limits for grouped users

Supports MCP server configuration (SSE mode)

DeepSeek chain-of-thought display

LaTeX and Markdown rendering

Image understanding

AI agents

Cloud data storage

Supported large model service providers:

OpenAI

Claude

Gemini

DeepSeek

Moonshot

Volcano Ark (Doubao)

Ali Bailian (Qianwen)

Baidu Qianfan

Tencent Hunyuan

Zhipu

Open Router

Grok

Ollama

Aibee Flow

Also supports custom addition of any OpenAI-style service provider

Regular User Interface
Log in to your account and start chatting.

MCP Usage

Admin Backend
Administrator configures AI large model service providers

Can manually add users, and enable or disable account registration, suitable for small teams in companies/schools/organizations.

View and manage all users.

3. Technology Stack
Next.js

TailwindCSS

Auth.js

PostgreSQL

Drizzle ORM

Ant Design

4. Installation and Deployment
Method 1: Local Deployment
Note:
Upgrading from older versions might involve database structure changes. Please manually execute npm run initdb to update. Even if there are no updates, there are no side effects.

Clone this project locally

git clone https://github.com/HiveNexus/hivechat.git


Install dependencies

cd hivechat
npm install


Modify local configuration file

Copy the example file to .env

cp .env.example .env


Modify the .env file

# PostgreSQL database connection URL, this is an example, you need to install locally or connect to a remote PostgreSQL
# Note that local installation currently does not support Serverless PostgreSQL provided by Vercel or Neon.
DATABASE_URL=postgres://postgres:password@localhost/hivechat

# Used for encrypting sensitive information such as user information. You can use openssl rand -base64 32 to generate a random 32-bit string as the key. This is an example, please replace it with your own generated value.
AUTH_SECRET=hclqD3nBpMphLevxGWsUnGU6BaEa2TjrCQ77weOVpPg=

# Administrator authorization code. After initialization, use this value to set up the administrator account. This is an example, please replace it with your own generated value.
ADMIN_CODE=22113344

# Set to your official domain name in a production environment
NEXTAUTH_URL=http://127.0.0.1:3000

# Whether to enable email login. Set to ON to enable, OFF to disable. If not set, it defaults to ON.
EMAIL_AUTH_STATUS=ON


Initialize database

npm run initdb


Start the program

// For testing/development
npm run dev
// For official start
npm run build
npm run start


Initialize administrator account

Visit http://localhost:3000/setup (using your actual domain name and port number) to enter the administrator account setup page. After setup, you can use the system normally.

Method 2: Docker Deployment
Due to frequent recent updates, an SQL script for upgrading the database with Docker is not yet provided. If you are upgrading from a historical version and are using it for testing purposes, you can directly delete hivechat_postgres_data under the storage volume; the database will automatically reinitialize. If you have an upgrade requirement for a production Docker environment, please contact the author. Other deployment methods do not have this issue.

Clone this project locally

git clone https://github.com/HiveNexus/hivechat.git


Modify local configuration file

Copy the example file to .env

cp .env.example .env


Configure the following items according to your actual situation:
Modify AUTH_SECRET and ADMIN_CODE. It is essential to reset these in a production environment; you can leave them unchanged for testing purposes.
Modify the .env file

# PostgreSQL database connection URL, can be left blank for Docker deployment
DATABASE_URL=

# Used for encrypting sensitive information such as user information. You can use openssl rand -base64 32 to generate a random 32-bit string as the key. This is an example, please replace it with your own generated value. For testing purposes, you can leave it unchanged.
AUTH_SECRET=hclqD3nBpMphLevxGWsUnGU6BaEa2TjrCQ77weOVpPg=

# Administrator authorization code. After initialization, use this value to set up the administrator account. This is an example, please replace it with your own generated value.
ADMIN_CODE=22113344

# Set to your official domain name in a production environment; used for callbacks when enabling Feishu and other third-party logins.
NEXTAUTH_URL=http://127.0.0.1:3000

# Whether to enable email login. Set to ON to enable, OFF to disable. If not set, it defaults to ON.
EMAIL_AUTH_STATUS=ON


Start the container

docker compose up -d


Initialize administrator account

Visit http://localhost:3000/setup (using your actual domain name and port number) to enter the administrator account setup page. After setup, you can use the system normally.

Method 3: Deploy on Vercel
Note:
If you are upgrading from an older version to a version updated after April 5, 2025, and encounter a stuck upgrade, please manually log into the Vercel database management page and change the daily_token_limit field under the group table to monthly_token_limit, then redeploy. Because it involves table structure adjustments, the script execution cannot automatically confirm or skip, which may cause deployment to get stuck. This problem does not exist for fresh deployments. See here for details.

Click the button below to start deployment.

After cloning the code to your GitHub by default, you need to fill in the environment variables:

# PostgreSQL database connection URL. The Vercel platform provides a free hosting service. See the explanation below for details.
DATABASE_URL=postgres://postgres:password@localhost/hivechat

# Used for encrypting sensitive information such as user information. You can use openssl rand -base64 32 to generate a random 32-bit string as the key. This is an example, please replace it with your own generated value.
AUTH_SECRET=hclqD3nBpMphLevxGWsUnGU6BaEa2TjrCQ77weOVpPg=

# Administrator authorization code. After initialization, use this value to set up the administrator account. This is an example, please replace it with your own generated value.
ADMIN_CODE=22113344

# Set to your official domain name in a production environment
NEXTAUTH_URL=https://hivechat-xxx.vercel.app

# Whether to enable email login. Set to ON to enable, OFF to disable.
EMAIL_AUTH_STATUS=ON


Appendix 1: Vercel (Neon) PostgreSQL Configuration
On the Vercel platform's top navigation, select the "Storage" tab, then click "Create Database".

Select Neon (Serverless Postgres).

After completing creation as guided, copy the DATABASE_URL value from here and paste it into the DATABASE_URL field in the previous step.

Initialize administrator account

After completing the installation and deployment using the methods above, visit http://localhost:3000/setup (using your actual domain name and port number) to enter the administrator account setup page. After setup, you can use the system normally.
