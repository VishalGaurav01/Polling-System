# Intervue Poll - Real-Time Polling System

A real-time polling application designed for interactive classroom sessions. Built with **React**, **Node.js**, and **Socket.io**, this tool enables teachers to conduct live polls and receive instant responses from students.

### 🔗 [Live Demo](https://polling-system-1.onrender.com/)

---

## 📌 Features

- ⚡ **Real-Time Interaction** – Instant updates via Socket.io
- 👨‍🏫 **Dual Interfaces** – Separate views for teachers and students
- ❓ **Interactive Polls** – Multiple choice with customizable options
- ✅ **Correct Answer Feedback** – Students can see results after each poll
- 📊 **Live Results** – Real-time visualization of responses
- 🧑‍🎓 **Participant Management** – View and manage connected students
- 🕓 **Poll History** – Access previous session results
- 💬 **Chat System** – Built-in communication channel
- 🌗 **Dark/Light Mode** – Theme toggle for enhanced experience
- 🖼️ **MCQ Image Parser** – Extract questions and options from uploaded images
- 📱 **Responsive UI** – Mobile-friendly interface

---

## 📁 Project Structure

This project consists of two main parts:

### Backend

- Built with **Node.js**, **Express**, and **Socket.io**
- Handles real-time communication, poll creation, and participant tracking
- Uses in-memory data models (no database)

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

### 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/VishalGaurav01/Polling-System.git
cd Polling-System


Install dependencies:

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install


Running the App

# Start backend
cd ../backend
npm run dev

# Start frontend
cd ../frontend
npm run dev

🌐 Access the App
Frontend: http://localhost:5173

Backend: http://localhost:3000

🧭 Usage Guide
👨‍🏫 Teacher Interface
Click "I'm a Teacher" on the landing page

Create a poll:

Enter your question

Add multiple options

Select the correct answer

Set a time limit

Start the poll and monitor live responses

Use the chat system to communicate

View history of past polls

👨‍🎓 Student Interface
Click "I'm a Student" on the landing page

Enter your name to join the session

Wait for the teacher to start the poll

Submit your answer before the timer ends

See correct answer and poll results

☁️ Deployment
The application is deployed on Render:

Frontend: Static Site Deployment

Backend: Node.js Web Service

🛠️ Technologies Used
Frontend
React

Redux Toolkit

Vite

Tailwind CSS

Socket.io-client

React Router

Backend
Node.js

Express

Socket.io

CORS

🌱 Future Enhancements
🔐 User authentication system

🗄️ Persistent storage with a database

📝 Additional question types (text input, multiple select)

📁 File upload support

📈 Advanced analytics for teachers

🤝 Contributing
Contributions are welcome!
Feel free to fork the repository and submit a pull request.

📄 License
This project is licensed under the MIT License.

