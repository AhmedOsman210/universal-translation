markdown
Copy
# Universal Translator

![Screenshot 2025-04-03 224005](https://github.com/user-attachments/assets/5279e8f9-c804-4a04-88ec-0169cd4e30e6)

![Screenshot 2025-04-03 224205](https://github.com/user-attachments/assets/90209a96-cd20-4f2f-992f-4ce9117546b8)

![Screenshot 2025-04-03 224244](https://github.com/user-attachments/assets/736e0910-9ffd-4b01-9c6d-7cc19b08ca03)


A modern, feature-rich translation web application built with React and TypeScript, powered by the MyMemory Translation API.

![Universal Translator Screenshot](https://via.placeholder.com/800x600.png?text=Universal+Translator+Screenshot) 
*Note: Add actual screenshot here*

## Features

- **Multi-language Support**: Translate between 15+ languages including Somali, English, Arabic, French, Spanish, and more
- **Auto-detect Source Language**: Automatic language detection for source text
- **Real-time Translation**: Fast translation with time tracking
- **Text-to-Speech**: Listen to translations in both source and target languages
- **Translation History**: Maintains last 10 translations with timestamps
- **Favorites System**: Save important translations for quick access
- **Dark/Light Mode**: Toggle between dark and light themes
- **Advanced Text Management**:
  - Character/word count
  - Text spacing controls
  - Temporary text blurring
  - Copy to clipboard
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Performance Metrics**: Translation time tracking
- **Smart Limitations**:
  - 5,000 character limit
  - Input validation
  - Rate limit handling

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/universal-translator.git
Install dependencies:

bash
Copy
cd universal-translator
npm install
Start the development server:

bash
Copy
npm run dev
Open http://localhost:3000 in your browser

Usage
Select source and target languages from dropdown menus

Enter text in the source language (up to 5,000 characters)

Click "Translate" to get instant translation

Use additional features:

🔊 Listen to text with text-to-speech

⭐ Save to favorites

📋 Copy translation

↔ Swap languages

🌓 Toggle dark mode

👁️ Toggle text visibility

⏱️ View translation time

Configuration
The app uses the following environment variables (create a .env file):

ini
Copy
VITE_API_URL=https://api.mymemory.translated.net/get
VITE_CONTACT_EMAIL=your@email.com  # Replace with your email
Technologies Used
React + TypeScript

Axios for API calls

MyMemory Translation API

Web Speech API for text-to-speech

Lucide React Icons

LocalStorage for persistent history/favorites

CSS Modules with gradient animations and glass-morphism effects

Contributing
Contributions are welcome! Please follow these steps:

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License
Distributed under the MIT License. See LICENSE for more information.

Acknowledgements
MyMemory Translation API for translation services

Lucide for beautiful icons

Web Speech API for text-to-speech functionality

React community for awesome tools and libraries

Note: This project is intended for demonstration purposes. For production use, consider:

Implementing proper error handling

Adding loading states

Including proper API rate limiting

Adding user authentication for personalized history

