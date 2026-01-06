import os
import google.generativeai as genai
from dotenv import load_dotenv

# Try loading from same path as server
load_dotenv(dotenv_path="server/.env")

api_key = os.getenv("GEMINI_API_KEY")
print(f"Loaded Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("❌ No API Key found in env")
else:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Hello, are you working?")
        print(f"✅ API Success: {response.text}")
    except Exception as e:
        print(f"❌ API Failed: {e}")
