# Kanvas 🎨

[![Live Site](https://img.shields.io/badge/Live%20Demo-kanvas.usecerebro.co.in-orange?style=for-the-badge&logo=google-chrome&logoColor=white)](https://kanvas.usecerebro.co.in)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/)
[![Prisma](https://img.shields.io/badge/Prisma-39827F?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

🔗 **Live Application URL**: [http://kanvas.usecerebro.co.in](http://kanvas.usecerebro.co.in)

**Kanvas** is a cloud-based development environment platform (similar to Replit, Gitpod, or GitHub Codespaces) designed to provision, lifecycle-manage, and host full VS Code development environments on-demand in the cloud. It allows developers to start coding in seconds from any browser with zero local configuration.

## 🖥️ Preview

![Kanvas Dashboard Preview](Frontend/ReplitFrontend/public/image.png)

---

## 🚀 Unique Selling Proposition (USP)

### 💡 Auto-Scaling with Active-Heartbeat Lifecycling

The biggest challenge with self-hosted cloud IDE platforms is **cloud compute waste**. Developers frequently leave workspaces open, forgetting to terminate them, which results in massive, unnecessary cloud bills.

Kanvas solves this with a **custom-engineered Heartbeat Lifecycling Mechanism**:

1. **Active Heartbeats**: When a developer is active in their cloud workspace, the environment (or dashboard) periodically pings the Kanvas backend API (`/heartBeat/:projectId`).
2. **Idle Detection**: The backend runs a background monitor every 60 seconds to scan all active virtual machines (`ALL_MACHINES`).
3. **Graceful Auto-Termination**: If a machine does not receive a heartbeat signal within the defined `GRACE_PERIOD` (configured in seconds), it is deemed idle/dead.
4. **AWS Auto-Scaling Integration**: The backend automatically triggers the termination of the idle EC2 instance via the AWS Auto Scaling SDK and decrements the desired capacity of the Auto Scaling Group (ASG).

> [!IMPORTANT]
> **Why this is a game-changer:** You only pay for active development time. If a developer walks away or closes their laptop, the underlying server is terminated automatically, reducing idle cloud costs by up to **90%** compared to traditional persistent VM setups.

---

## 🏗️ Architecture & How It Works

Kanvas uses a React-based frontend dashboard, an Express backend orchestration layer, a MongoDB database for persistence, and directly interfaces with AWS Auto Scaling Groups to handle dynamic instance spawning.

```mermaid
graph TD
    User([Developer]) -->|1. Request Workspace| FE[React Frontend]
    FE -->|2. JWT Auth / API Call| BE[Node/Express Backend]
    BE -->|3. Check & Update| DB[(MongoDB / Prisma)]
    BE -->|4. Check Pool & Spin Up| AWS_ASG[AWS Auto Scaling Group]
    AWS_ASG -->|5. Provision VM| EC2[EC2 VS Code Instance]
    EC2 -->|6. Establish Connection| User
    EC2 -->|7. Heartbeat Pings| BE
    BE -.->|8. No Heartbeat / Idle| AWS_ASG
    AWS_ASG -.->|9. Terminate & Decrement| EC2
```

1. **Pre-Warmed Pool**: The backend maintains a pool of pre-warmed running instances in the AWS Auto Scaling Group.
2. **Instant Assignment**: When a user selects a runtime (Node, React, Python, or Full Stack), the backend assigns an unused machine from the pool, registers it to the user's project in the database, and provides the access DNS/IP.
3. **Capacity Adjustment**: As pool instances are claimed, the backend calls AWS SDK v3 to increase the ASG's desired capacity, making sure another pre-warmed instance starts booting up for the next user.
4. **Safety Limits**: To prevent abuse and runaway budgets, users are capped at a maximum of **2 active projects** concurrently.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 (TypeScript)
- **Bundler**: Vite
- **Styling**: TailwindCSS
- **State & Routing**: React Router DOM
- **Authentication**: JWT & Google OAuth2 Integration

### Backend

- **Runtime**: Node.js & Express (TypeScript)
- **Database ORM**: Prisma Client (with MongoDB adapter)
- **Cloud Orchestration**: AWS SDK v3 (`@aws-sdk/client-auto-scaling` & `@aws-sdk/client-ec2`)
- **Authentication**: Google Auth Library & JsonWebToken (JWT)

---

## ⚙️ Configuration & Environment Variables

You need to configure both the backend and frontend environment files. Use the `.env.example` templates provided in the respective directories.

### Backend Configurations (`Backend/.env`)

```env
PORT=9092
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=mongodb+srv://...  # MongoDB connection string

# AWS Configuration
ACC_KEY_ID=your_aws_access_key_id
SECRET_ACC_KEY=your_aws_secret_access_key
AUTO_SCALING_GROUP_NAME=your_aws_asg_name

# Heartbeat & Lifecyling
GRACE_PERIOD=300000             # Time in milliseconds (e.g. 5 minutes) before terminating idle VMs

# OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret
```

### Frontend Configurations (`Frontend/ReplitFrontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:9092
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_GOOGLE_SECRET=your_google_oauth_client_secret
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB database instance (Atlas or local)
- AWS Account with an Auto Scaling Group containing pre-configured AMI instances running VS Code Server (code-server).

### 1. Database Setup (Prisma)

Navigate to the `Backend` directory, install packages, and generate the Prisma Client:

```bash
cd Backend
npm install
npx prisma generate
```

### 2. Running the Backend

Start the Express server in development mode:

```bash
# In the Backend directory
npm run dev
```

The server will boot on port `9092` (or your configured `PORT`) and begin syncing with the AWS Auto Scaling Group.

### 3. Running the Frontend

Navigate to the frontend directory, install dependencies, and launch Vite's HMR dev server:

```bash
cd ../Frontend/ReplitFrontend
npm install
npm run dev
```

Open your browser to `http://localhost:5173` to access the Kanvas dashboard.

---

## 📦 Containerization & Deployment

Both the frontend and backend are equipped with `dockerfile` configurations for rapid container deployment.

To build and run the services via Docker:

#### Build Backend:

```bash
cd Backend
docker build -t kanvas-backend .
docker run -p 9092:9092 --env-file .env kanvas-backend
```

#### Build Frontend:

```bash
cd Frontend/ReplitFrontend
docker build -t kanvas-frontend .
docker run -p 80:80 kanvas-frontend
```

---

## 👥 Authors

- **Brijesh** ([@Brijesh-0106](https://github.com/Brijesh-0106))
