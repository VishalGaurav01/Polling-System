# Intervue Poll - Real-Time Polling System

A real-time polling application designed for interactive classroom sessions. Built with **React**, **Node.js**, and **Socket.io**, this tool enables teachers to conduct live polls and receive instant responses from students with AI-powered insights.

### 🔗 [Live Demo](https://polling-system-1-d56x.onrender.com/)

---

## 📌 Features

- ⚡ **Real-Time Interaction** – Instant updates via Socket.io
- 👨‍🏫 **Dual Interfaces** – Separate views for teachers and students
- ❓ **Interactive Polls** – Multiple choice with customizable options
- ✅ **Correct Answer Feedback** – Students see results after each poll
- 📊 **Live Results** – Real-time visualization of responses
- 🧑‍🎓 **Participant Management** – View and manage connected students
- 🕓 **Poll History** – Access previous session results
- 💬 **Chat System** – Built-in communication channel
- 🌗 **Dark/Light Mode** – Theme toggle for enhanced experience
- 🖼️ **MCQ Image Parser** – Extract questions/options from images
- 📱 **Responsive UI** – Mobile-friendly interface
- 🤖 **AI-Enhanced Questions** – Improve questions with Claude AI
- 📈 **Results Analysis** – AI-powered insights about poll results
- 🚨 **Confusion Detection** – Automatically identify struggling students
- 🔄 **Follow-up Questions** – AI suggests relevant follow-up questions

---

## 📁 Project Structure

### Backend
- Built with **Node.js**, **Express**, and **Socket.io**
- Handles real-time communication and poll management
- Uses in-memory data models (no database)
- Integrates with **Anthropic Claude AI** for enhanced features

### Frontend
- Built with **React**, **Redux Toolkit**, and **Vite**
- Styled with **Tailwind CSS**
- Uses **Socket.io-client** for real-time updates
- Provides responsive and interactive UI

---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js (v14+)
- npm or yarn
- Anthropic API key (for AI features)

### 🔧 Installation
```bash
# Clone the repository
git clone https://github.com/VishalGaurav01/Polling-System.git
cd Polling-System

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

🏃‍♂️ Running the App

# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm run dev

🌐 Access the App

Frontend: http://localhost:5173

Backend: http://localhost:3000

🧭 Usage Guide
👨‍🏫 Teacher Interface
Click "I'm a Teacher" on landing page

Create a poll:

Enter question or use image parser

Add multiple options

Select correct answer

Enhance question with AI

Set time limit

Monitor live responses and AI insights

View confusion alerts and suggested follow-ups

Access poll history and chat

👨‍🎓 Student Interface
Click "I'm a Student"

Enter your name to join

Submit answers during active polls

See results and correct answers

Use chat to ask questions or express confusion

🤖 AI-Powered Features
Question Enhancement
Upload or type questions for AI to improve clarity and educational value

Get suggestions for better distractor options

Results Analysis
Key insights about student understanding

Identification of common misconceptions

Recommended next steps for instruction

Confusion Detection
Real-time analysis of chat messages

Identifies struggling students and specific issues

Alerts teacher with recommended actions

Follow-up Questions
AI-generated questions based on response patterns

Tailored to address knowledge gaps

One-click deployment to new polls

☁️ Deployment
Deployed on Render:

Frontend: Static Site Deployment

Backend: Node.js Web Service

🛠️ Technologies Used
Frontend	Backend
React	Node.js
Redux Toolkit	Express
Vite	Socket.io
Tailwind CSS	CORS
Socket.io-client	Anthropic Claude AI
React Router	
🌱 Future Enhancements
🔐 User authentication system

🗄️ Persistent storage with database

📝 Additional question types (text input, multiple select)

📁 File upload support

📈 Advanced analytics dashboard

🎯 Personalized learning paths

👥 Breakout room functionality

🤝 Contributing
Contributions are welcome!

Fork the repository

Create your feature branch

Commit your changes

Push to the branch

Open a pull request

📄 License
This project is licensed under the MIT License.
