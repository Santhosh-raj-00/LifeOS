# LifeOS – Personal Discipline & Accountability Tracker

LifeOS is a full-stack personal discipline and accountability system built using Java Spring Boot (backend), React.js (frontend), and MySQL (database). 

Unlike typical to-do trackers, LifeOS implements **time-based lock accountability**: if you do not complete a task within its assigned time window, the system automatically locks the task as `MISSED`, making it read-only. Completing tasks rewards you with XP points, allowing you to level up from a Beginner to Consistent, Disciplined, and Elite status.

---

## Technical Stack

* **Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide Icons.
* **Backend:** Java 21, Spring Boot 3.2.4, Spring Security, JWT (jjwt), Spring Data JPA.
* **Database:** MySQL 8.0.
* **Containers:** Docker, Docker Compose.
* **Build Tool:** Apache Maven.

---

## Project Structure

```
lifeos/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/lifeos/         # Spring Boot controllers, services, repositories
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── schema.sql            # MySQL Database Schema
│   │   └── test/                         # Unit & integration tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/                   # Navbar, ProtectedRoute
│   │   ├── context/                      # AuthContext (JWT auth state)
│   │   ├── pages/                        # Dashboard, Tasks, Journal, Stats, etc.
│   │   ├── App.jsx                       # Routing
│   │   ├── index.css                     # Tailwind & custom glass/fonts
│   │   └── main.jsx                      # Vite entry point
│   ├── Dockerfile
│   ├── tailwind.config.js
│   └── package.json
└── docker-compose.yml                    # Run whole stack with single command
```

---

## Setup & Running Guide

### Option 1: Using Docker Compose (Recommended)

1. Make sure you have **Docker** and **Docker Compose** installed on your system.
2. In the root directory (where `docker-compose.yml` resides), run:
   ```bash
   docker-compose up --build
   ```
3. This will start:
   * **MySQL** container on port `3306` (creates `lifeos` database)
   * **Spring Boot Backend** container on port `8080`
   * **React Frontend** container on port `80` (accessible at `http://localhost`)
4. Open your browser and navigate to `http://localhost`.

---

### Option 2: Running Locally

#### Step 1: Set up MySQL Database
1. Open your MySQL client and run:
   ```sql
   CREATE DATABASE IF NOT EXISTS lifeos;
   ```
2. If your database password/username is not the default `root` with an empty password, modify the credentials in `backend/src/main/resources/application.properties`.


#### Step 2: Run Backend
1. Navigate to the `backend/` folder.
2. Compile and run the Spring Boot application using Maven:
   ```bash
   # Using local maven binary
   mvn spring-boot:run
   ```
   *(If you don't have Maven globally installed, you can use the local maven downloaded during setup located at `lifeos/apache-maven-3.9.16/bin/mvn.cmd`)*:
   ```powershell
   # On Windows
   ..\apache-maven-3.9.16\bin\mvn.cmd spring-boot:run
   ```
3. The backend will start on `http://localhost:8080`.

#### Step 3: Run Frontend
1. Navigate to the `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

---

## Seed Data for Testing

You can use the following default credentials to sign in or test:
1. Register a new user with Name, Password (min 8 chars), and an Email OR Phone Number.
   * *Example:* Email `test@lifeos.com` or Phone `9876543210`
   * *Password:* `password123`
2. Create a Schedule ending 1 minute from now to test immediate completion.
3. Create a Schedule ending 1 minute in the past. Wait 1 minute and witness the backend scheduler automatically locking it as `MISSED`.

---

## API Documentation Summary

All endpoints require JWT authorization header `Authorization: Bearer <token>` except the auth endpoints.

### Authentication
* `POST /api/auth/register` - Create an account.
* `POST /api/auth/login` - Authenticate credentials, returns JWT token.

### Tasks
* `GET /api/tasks?date=YYYY-MM-DD` - Retrieve tasks for target date.
* `PUT /api/tasks/{id}/complete` - Mark a pending task as completed.

### Schedules
* `GET /api/schedules` - Retrieve all user schedules.
* `POST /api/schedules` - Create a recurring routine.
* `DELETE /api/schedules/{id}` - Delete a routine.

### Habits
* `GET /api/habits` - Retrieve user habits.
* `POST /api/habits` - Initialize a habit.
* `DELETE /api/habits/{id}` - Remove a habit.
* `GET /api/habits/logs?date=YYYY-MM-DD` - Fetch habit checks for a date.
* `POST /api/habits/{id}/log?status=COMPLETED` - Toggle check.

### Journals
* `GET /api/journals?date=YYYY-MM-DD` - Fetch reflection entry.
* `POST /api/journals?date=YYYY-MM-DD` - Save reflection (autosave enabled, midnight locked).

### Statistics & Profile
* `GET /api/stats?range=weekly|monthly|yearly` - Analytics & heatmaps.
* `GET /api/profile` - Streaks, join date, achievements.
* `PUT /api/profile` - Edit user information.
* `PUT /api/profile/password` - Change password.

