# MockSync

A real-time collaborative coding and interview practice platform where users can create or join rooms, code together live, chat instantly, run a shared timer, and get AI-based feedback.

## Live Demo

- Frontend: https://mocksync-ui.vercel.app  
- Backend: https://mocksync-api.onrender.com

## Highlights

- Secure authentication with JWT (signup, login, protected routes)
- Real-time room collaboration with Socket.IO
- Live code synchronization between participants
- Live room chat
- Shared interview timer for all users in a room
- AI feedback API for reviewing answers
- MongoDB persistence for user accounts

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO
- Mongoose
- JWT
- bcrypt

### Database
- MongoDB Atlas

### Deployment
- Vercel (Frontend)
- Render (Backend)

## Local Setup
1. Clone the repository
   git clone https://github.com/Itisamanrai/MOCKSYNC.git
   cd MOCKSYNC

2. Install dependencies
   cd client
   npm install

  cd ../server
  npm install

3. Create environment files
4. Run the app

   cd server
   npm run dev

   cd client
   npm run dev

API Endpoints
Auth
POST /auth/signup
POST /auth/login
GET /auth/me
AI
POST /ai/feedback
Socket Events
join_room
send_message and receive_message
code_change and code_update
timer_start and timer_started
timer_reset
Deployment Notes
This project uses split deployment:

Frontend on Vercel
Backend on Render (required for persistent Socket.IO connections)
Detailed production steps are in DEPLOYMENT.md.

Security Notes
Never commit .env files
Rotate keys immediately if they are exposed
Use a strong JWT secret in production
Restrict CORS to your production frontend domain
Roadmap
Add collaborative cursor indicators
Save room history and code snapshots
Add role-based room permissions
Add test coverage and CI workflow


Author
Aman Rai
GitHub: https://github.com/Itisamanrai
