# ShriNeo Vittiyam - Digital Lending Platform

**ShriNeo Vittiyam** is a next-generation AI-powered digital lending aggregator designed to democratize credit access for "Bharat" (Tier 2/3/4 cities). It connects borrowers with multiple lenders through a unified, paperless, and assisted platform.

## 🚀 Key Features

- **🏆 Single Application, Multiple Lenders**: Borrowers fill one form and get matched with offers from HDFC, ICICI, SBI, etc.
- **🤖 Neo AI Assistant**: A multilingual (Hinglish) voice-enabled chatbot that assists users in applying for loans, tracking status, and answering financial queries.
- **🔐 Digital Trust & Security**:
  - **Live Identity Verification**: Real-time face liveness detection to prevent fraud.
  - **Secure Document Handling**: OCR-based extraction for PAN and Aadhaar cards.
- **🤝 Sahayak Agent Program**: Empowering local agents to assist borrowers and earn commissions.
- **📊 Comprehensive Dashboard**: Real-time status tracking for borrowers and agents.

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Glassmorphism UI).
- **Backend**: Python FastAPI.
- **AI/ML**:
  - **Chatbot**: Powered by Llama 3.1 (via Groq API) for intelligent conversations.
  - **Computer Vision**: OpenCV & Face-API.js for liveness detection; EasyOCR for document parsing.

## 💻 Local Developement

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Deadevil609/ShriNeo_Vittyam.git
    cd ShriNeo_Vittyam
    ```

2.  **Setup Backend**

    ```bash
    cd server
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

    - Create a `.env` file in `server/` with your API keys (GROQ_API_KEY, etc.).
    - Run server: `uvicorn main:app --reload`

3.  **Setup Frontend**
    - Serve the `client/` directory using any static file server.
    - Example: `python3 -m http.server 3000` inside the `client` folder.

## 🌐 Deployment (Vercel)

The frontend is designed to be easily deployed on Vercel.

1.  Push the code to GitHub.
2.  Import the project in Vercel.
3.  Set the **Root Directory** to `client` (if deploying just the frontend) or configure the build settings for a full-stack deployment if using Vercel's Python runtime support.
    - _Note: For a full demo with the Python backend, you may need to deploy the server separately (e.g., on Render/Railway) or use Vercel Serverless Functions for Python._

## 📄 License

This project is licensed under the MIT License.
