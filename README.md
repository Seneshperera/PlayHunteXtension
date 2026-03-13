# PlayHunteXtension
PlayHunt is a smart Chrome extension that detects and discovers videos, music, and media across the web. It helps users explore media content, view movie information, interact with an AI assistant, and manage downloads in one place. Built with modern UI, AI integration, and a free + Pro subscription model.

🎯 PlayHunt

PlayHunt is a smart Chrome browser extension that detects, discovers, and interacts with videos, music, and media across the web. It helps users easily find media content, view information, and use AI-powered tools to explore content faster.

PlayHunt is built with a modern UI, AI integration, and a scalable architecture designed for future media discovery tools.

🚀 Features
🔎 Automatic Media Detection

PlayHunt scans web pages and detects embedded videos and media automatically.

🎬 Media Information

Fetch movie and media details such as title, overview, and posters using external APIs.

🤖 AI Chat Assistant

Ask questions about detected media or get help with content using an AI assistant.

📥 Media Download Support

Download supported media files directly from supported sources.

🎵 Music Recognition (Optional)

Identify songs in videos using audio recognition APIs.

⚡ Fast & Minimal UI

Modern, lightweight UI built for speed and ease of use.

🔐 Free & Pro Model

Free users have limited access while Pro users unlock advanced AI tools and features.

🧱 Tech Stack

Frontend

Chrome Extension (Manifest v3)

HTML

CSS

JavaScript / React

Backend

Node.js

Express.js

Database

MongoDB

APIs

OpenAI API (AI assistant)

TMDB API (movie data)

AudD / ACRCloud (music recognition)

Payments

Stripe (Pro subscription)

📂 Project Structure
playhunt/
│
├── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   └── styles/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   └── config/
│
├── assets/
│   └── icons/
│
└── README.md

🛠 Installation
1️⃣ Clone the repository
git clone https://github.com/yourusername/playhunt.git

2️⃣ Open Chrome Extensions

Go to:

chrome://extensions/


Enable Developer Mode.

3️⃣ Load the extension

Click Load Unpacked and select the extension folder.

🔑 Environment Variables (Backend)

Create a .env file inside the backend folder.

OPENAI_API_KEY=your_key
TMDB_API_KEY=your_key
AUDD_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
MONGODB_URI=your_database_url

📦 Future Improvements

AI-powered media summaries

Automatic clip generation

Social media sharing tools

More streaming platform support

Smart media recommendations

🤝 Contributing

Contributions are welcome. Feel free to open issues or submit pull requests to improve PlayHunt.

📄 License

This project is licensed under the MIT License.

⭐ If you like this project, consider giving it a star on GitHub.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
