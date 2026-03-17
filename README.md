# Task Management Mobile Application

A production-ready full-stack Task Management app designed for technical interview assessment.

## Why This Architecture

- **Frontend (React Native + TypeScript)**: Feature-first modules for scalability and clean ownership.
- **Backend (Node.js + Express + TypeScript)**: MVC pattern with centralized error handling.
- **Database (MongoDB + Mongoose)**: Task schema with strict validation and timestamping.
- **API Layer**: Dedicated Axios client with interceptors for consistent request/response behavior.

## Technologies Used

### Mobile
- React Native (Expo)
- TypeScript
- NativeWind (Tailwind CSS)
- React Navigation (Native Stack)
- React Hook Form + Zod
- Axios
- react-native-toast-message

### Backend
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- Zod
- Helmet, CORS, Morgan

## Project Structure

```text
Neonlabz/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── db.ts
│       │   └── env.ts
│       ├── controllers/
│       │   └── taskController.ts
│       ├── middlewares/
│       │   ├── errorHandler.ts
│       │   └── notFound.ts
│       ├── models/
│       │   └── Task.ts
│       ├── routes/
│       │   └── taskRoutes.ts
│       └── utils/
│           ├── ApiError.ts
│           └── asyncHandler.ts
├── mobile/
│   ├── .env.example
│   ├── App.tsx
│   ├── app.json
│   ├── babel.config.js
│   ├── global.css
│   ├── metro.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   └── navigation.tsx
│       ├── features/
│       │   └── tasks/
│       │       ├── components/
│       │       │   └── TaskCard.tsx
│       │       ├── screens/
│       │       │   ├── TaskFormScreen.tsx
│       │       │   └── TaskListScreen.tsx
│       │       ├── services/
│       │       │   └── taskApi.ts
│       │       ├── types/
│       │       │   └── task.ts
│       │       └── validation/
│       │           └── taskSchema.ts
│       └── shared/
│           └── config/
│               └── api.ts
└── README.md
```

## Data Model

Task Schema (`MongoDB`):
- `title`: `string` (required)
- `description`: `string` (required)
- `dueDate`: `date` (required, ISO-compatible)
- `createdAt`, `updatedAt`: auto-generated timestamps

## Setup Instructions

## 1. Backend Setup

1. Go to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example` and set values:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```
4. Run backend in development:
   ```bash
   npm run dev
   ```

Backend base URL: `http://localhost:5000/api`

## 2. Mobile Setup

1. Open a new terminal and go to mobile:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:5000/api
   ```
   Use your machine IP (not localhost) when running on a physical device.
4. Start Expo:
   ```bash
   npm run start
   ```

## API Endpoints

- `GET /api/health` - health check
- `GET /api/tasks` - list tasks
- `POST /api/tasks` - create task
- `GET /api/tasks/:id` - get single task
- `PATCH /api/tasks/:id` - update task
- `DELETE /api/tasks/:id` - delete task

## Assessment Checklist Coverage

- Feature-first mobile structure
- NativeWind UI with professional Indigo/Slate palette
- MVC backend architecture
- MongoDB Task schema (`title`, `description`, `dueDate`)
- CRUD APIs and mobile integration
- Form validation with Zod
- High-performance FlatList rendering
- Immediate UI updates after update/delete operations
- Global backend error middleware
- Frontend toast notifications
- Environment variables for sensitive config
- Dedicated Axios API service with interceptors
