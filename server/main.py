import json
import os
import uuid
import numpy as np
# import cv2
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
# from ultralytics import YOLO
from dotenv import load_dotenv
# import google.generativeai as genai
import auth
import re

# Load environment variables
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / "server" / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# print("DEBUG: main.py - database config")
# Database Configuration
DATA_FILE = BASE_DIR / "server" / "applications.json"

# Ensure Data File Exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)

# Create uploads directory
UPLOAD_DIR = BASE_DIR / "server" / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

# print("DEBUG: main.py - app created")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Groq API (Open Source LLM Host)
# Get your free key from: https://console.groq.com
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# OCR Reader (Lazy Loaded)
_ocr_reader = None

def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        print("⌛ Initializing EasyOCR Reader (Lazy Loading)...")
        try:
            import easyocr
            _ocr_reader = easyocr.Reader(['en', 'hi'], gpu=False)
        except Exception as e:
            print(f"⚠️ OCR Init Error: {e}")
            _ocr_reader = None
    return _ocr_reader

def extract_document_info(text_list):
    full_text = " ".join(text_list).upper()
    info = {
        "id_number": None,
        "name": None,
        "dob": None,
        "doc_type": "Unknown"
    }

    # PAN CARD REGEX (ABCDE1234F)
    pan_match = re.search(r'[A-Z]{5}[0-9]{4}[A-Z]', full_text)
    if pan_match:
        info["id_number"] = pan_match.group()
        info["doc_type"] = "PAN"

    # AADHAAR REGEX (12 digits, often spaced or grouped)
    aadhaar_match = re.search(r'\d{4}[\s-]?\d{4}[\s-]?\d{4}', full_text)
    if aadhaar_match:
        info["id_number"] = aadhaar_match.group().replace(" ", "").replace("-", "")
        info["doc_type"] = "Aadhaar"

    # Simple Name extraction heuristics 
    # (Checking common patterns found in Indian IDs)
    for i, line in enumerate(text_list):
        u_line = line.upper()
        if "NAME" in u_line and ":" in u_line:
            info["name"] = u_line.split(":")[1].strip()
        elif "NAME" == u_line and i + 1 < len(text_list):
             info["name"] = text_list[i+1].strip()
    
    # Simple DOB extraction
    dob_match = re.search(r'\d{2}/\d{2}/\d{4}', full_text)
    if dob_match:
        info["dob"] = dob_match.group()

    return info

def call_groq(prompt: str) -> str:
    """Call Groq API with Llama 3.1 model for open-source AI."""
    import requests
    
    if not GROQ_API_KEY or len(GROQ_API_KEY) < 10:
        return "AI service not configured. Please add GROQ_API_KEY to .env file."
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": NEO_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"❌ Groq API Error: {e}")
        return "Maaf kijiye, abhi AI service available nahi hai. Please try again later."

print("✅ Groq API configured (Open Source LLM)")



# NEO AI System Prompt (Knowledge Base)
NEO_SYSTEM_PROMPT = """
You are Neo, the intelligent AI assistant for **ShriNeo Vittiyam**.

**IDENTITY CORE:**
*   **What are you?** ShriNeo Vittiyam is India’s first-of-its-kind **multilingual, AI-powered digital lending platform (Aggregator)**.
*   **Are you a Bank?** **NO.** We are a platform that bridges the gap between borrowers and lenders. We do NOT provide loans directly; we connect you with Banks and NBFCs.
*   **Mission:** To democratize and simplify credit access for "Bharat" (Tier 2/3/4 cities & rural India).

**KEY VALUE PROPOSITIONS:**
1.  **One Application → Multiple Lenders:** "You fill one form, we match you with multiple bank/NBFC offers."
2.  **End-to-End Lifecycle:** "We handle everything: Application -> Verification -> Tracking -> Disbursement -> Repayment."
3.  **Agent Support (Sahayak):** "Local agents available to help you personally."
4.  **100% Digital:** Paperless and fast.

**FOR BORROWERS (The "Bharat" User):**
*   **Products:** Personal Loans, Business Loans, Home Loans.
*   **Why Us?** Fast approvals, diverse lender network, secure.

**FOR AGENTS (The "Sahayak" Program):**
*   **Join Us:** "Become a certified Sahayak and earn commission."
*   **Benefits:** Official ID Card, Lead Dashboard, Timely Payouts.
*   **Earnings:** Commission on every disbursed loan (e.g., 1-2%).

**RESPONSE GUIDELINES:**
*   **Tone:** "Hinglish" (friendly Indian English), Empathetic, Trustworthy. Use words like "Ji", "Namaste", "Sahayak", "Samajh gaya".
*   **Greeting:** Always start with a warm "Namaste!" or "Hello ji!".
*   **Correction:** If user thinks you are a bank, clarify politely: "Arre nahi sir/madam, hum bank nahi hain. We are a platform that connects you to the best banks."
*   **Agent Queries (Crucial):** If anyone asks about jobs, earning money, or becoming an agent, immediately pitch the **Sahayak Program**. Say: "Aap hamare Sahayak ban kar paise kama sakte hain!" and provide the Agent Signup link.

**NAVIGATION COMMANDS:**
*   Apply: `{"navigation": "/apply.html"}`
*   Track Status: `{"navigation": "/dashboard.html"}`
*   Agent Signup: `{"navigation": "/agent_signup.html"}`
*   Help: `{"navigation": "#footer"}`
"""

class ChatRequest(BaseModel):
    message: str

class OCRRequest(BaseModel):
    image_data: str # base64 encoded image

class GeminiChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    language: Optional[str] = 'en'  # Added language field

class LoanApplication(BaseModel):
    fullName: str
    phone: str
    pan: str
    employmentType: str
    income: str
    amount: str
    loanType: Optional[str] = "Not Specified"
    fraud_signals: Optional[dict] = {}
    session_id: Optional[str] = None
    risk_score: Optional[int] = None

class VerificationReport(BaseModel):
    session_id: str
    user_id: str
    match_score: float
    liveness_status: str
    frames_count: int
    flags: List[str]

# ... (omitted lines)

@app.post("/api/submit-application")
async def submit_application(application: LoanApplication):
    # Logic: Trust Score Calculation (Financial)
    try:
        monthly_income = float(application.income)
        loan_amount = float(application.amount)
        
        # Financial Ratio (Max score 95, Min 10)
        ratio = (monthly_income * 12) / loan_amount
        financial_score = min(95, max(10, int(ratio * 50))) 
    except:
        financial_score = 50

    # --- FRAUD RISK ENGINE (Phase 1) ---
    fraud_score = 0
    risk_flags = []
    
    signals = application.fraud_signals or {}
    
    # 1. Bot Speed Check (Form filled too fast)
    time_taken = signals.get('time_to_fill', 100)
    if time_taken < 10:
        fraud_score += 50
        risk_flags.append("BOT_SPEED_DETECTED")
    elif time_taken < 30:
        fraud_score += 20
        risk_flags.append("FAST_FILLER")
        
    # 2. Paste Detection (Sensitive fields pasted)
    paste_count = signals.get('paste_count', 0)
    if paste_count > 2:
        fraud_score += 30
        risk_flags.append("HIGH_PASTE_ACTIVITY")
        
    # 3. Focus Loss (Tab Switching - comparing answers?)
    tab_switches = signals.get('tab_switches', 0)
    if tab_switches > 4:
        fraud_score += 10
        risk_flags.append("FREQUENT_TAB_SWITCH")
        
    # 4. Device Fingerprint (Basic Hash Check)
    device_hash = signals.get('device_hash', 'UNKNOWN')
    
    # Calculate Final Status
    if fraud_score >= 80:
        status = "Flagged for Review"
        final_trust_score = 10 # Penalize trust score heavily
    elif fraud_score >= 50:
        status = "Under Review (Risk Warning)"
        final_trust_score = max(10, financial_score - 20)
    else:
        status = "Approved" if financial_score > 60 else "Under Review"
        final_trust_score = financial_score

    app_id = str(uuid.uuid4())[:8].upper()
    
    new_record = application.dict()
    
    # Check for verification results for this session
    verification_summary = {"status": "Not Verified", "score": 0}
    if application.session_id:
        session_dir = UPLOAD_DIR / "verification" / application.session_id
        if session_dir.exists():
            # In a real app, we'd aggregate results here
            # For this prototype, we'll check if any valid frames were found
            valid_frames = list(session_dir.glob("*.json"))
            if valid_frames:
                verification_summary = {"status": "Verified", "score": 90} # Mock high score if frames exist
    
    # Calculate Risk Score
    risk_score = calculate_risk_score(final_trust_score, financial_score, fraud_score, verification_summary["status"])

    new_record.update({
        "id": app_id,
        "trust_score": final_trust_score,
        "financial_score": financial_score,
        "fraud_score": fraud_score,
        "risk_score": risk_score,
        "risk_flags": risk_flags, 
        "device_hash": device_hash,
        "status": status,
        "verification": verification_summary,
        "date": str(datetime.now().date())
    })

    # Save to JSON
    with open(DATA_FILE, "r+") as f:
        data = json.load(f)
        data.append(new_record)
        f.seek(0)
        json.dump(data, f, indent=4)

    return {
        "status": "success",
        "message": "Application received",
        "application_id": app_id,
        "trust_score": final_trust_score
    }

# --- Helper Functions ---
def load_image_from_bytes(data: bytes):
    import cv2
    try:
        nparr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except:
        return None

def is_blurry(image, threshold=100.0):
    import cv2
    # Laplacian Variance method
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    score = cv2.Laplacian(gray, cv2.CV_64F).var()
    return score < threshold

def is_document_ratio(image):
    # Simple aspect ratio check for ID cards (usually ~1.58)
    h, w = image.shape[:2]
    ratio = w / h if h > 0 else 0
    return 1.2 < ratio < 1.8

def check_person_present(image):
    import cv2
    # Using Haar Cascade for fast face detection
    # In production, use YOLO or MediaPipe
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    return len(faces) > 0

@app.post("/api/verify/live-session")
async def verify_live_session(
    frame: UploadFile = File(...),
    session_id: str = Form(...),
    user_id: str = Form(...)
):
    """Receive background frames for identity verification."""
    session_dir = UPLOAD_DIR / "verification" / session_id
    os.makedirs(session_dir, exist_ok=True)
    
    frame_data = await frame.read()
    frame_path = session_dir / f"frame_{datetime.now().timestamp()}.jpg"
    
    with open(frame_path, "wb") as f:
        f.write(frame_data)
        
    # Process frame with OpenCV
    img = load_image_from_bytes(frame_data)
    face_present = check_person_present(img) if img is not None else False
    
    # Simple Liveness - check for motion or multiple faces (placeholder)
    # In a real app, compare with KYC photo
    report = {
        "timestamp": str(datetime.now()),
        "face_detected": face_present,
        "session_id": session_id,
        "user_id": user_id
    }
    
    # Save report for this frame
    report_path = session_dir / f"report_{datetime.now().timestamp()}.json"
    with open(report_path, "w") as f:
        json.dump(report, f)
        
    return {"status": "success", "face_detected": face_present}

@app.post("/api/kyc/submit")
async def submit_kyc(
    aadhaar: UploadFile = File(...),
    pan: UploadFile = File(...),
    live_photo: UploadFile = File(...)
):
    score = 100

# ... (omitted lines)

@app.get("/api/applications")
async def get_applications():
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
    return data

# --- Agents API ---
AGENTS_FILE = BASE_DIR / "server" / "agents.json"

# Ensure Agents File Exists
if not os.path.exists(AGENTS_FILE):
    with open(AGENTS_FILE, "w") as f:
        json.dump([], f)

# --- RISK ENGINE ---
def calculate_risk_score(trust_score, financial_score, fraud_score, verification_status):
    """Calculate an overall risk score (0-100) where 0 is lowest risk."""
    # Weightage: 
    # - Trust Score (30%): Higher is better (reduces risk)
    # - Financial Score (40%): Higher is better
    # - Fraud Score (30%): Lower is better (normally 100-fraud_score for safe)
    
    # Invert scores so lower means higher risk for trust/financial
    trust_comp = (100 - trust_score) * 0.3
    financial_comp = (100 - financial_score) * 0.4
    fraud_comp = fraud_score * 0.3 # Fraud score 100 is high risk
    
    # Penalty for unverified session
    verification_penalty = 15 if verification_status == "Not Verified" else 0
    
    final_risk = trust_comp + financial_comp + fraud_comp + verification_penalty
    return min(100, max(0, int(final_risk)))

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "time": str(datetime.now())}

@app.get("/api/agents")
async def get_agents():
    with open(AGENTS_FILE, "r") as f:
        data = json.load(f)
    return data

class AgentSignup(BaseModel):
    name: str
    phone: str
    city: str

@app.post("/api/register-agent")
async def register_agent(agent: AgentSignup):
    agent_id = f"SAH-{str(uuid.uuid4())[:4].upper()}"
    new_agent = {
        "id": agent_id,
        "name": agent.name,
        "phone": agent.phone,
        "email": f"{agent.name.lower().replace(' ', '.')}@shrineo.in",
        "city": agent.city,
        "status": "Pending Approval",
        "total_earnings": 0,
        "active_leads": 0,
        "joined_date": "2026-01-06"
    }
    
    with open(AGENTS_FILE, "r+") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = []
            
        data.append(new_agent)
        f.seek(0)
        json.dump(data, f, indent=4)
        
    return {"status": "success", "agent_id": agent_id, "message": "Welcome to the Sahayak Program!"}


# --- NEO AI CHAT ENDPOINT (Powered by Groq / Llama 3.1) ---
@app.post("/api/chat")
async def neo_chat(request: ChatRequest):
    """Chat endpoint for Neo AI assistant using open-source Llama model."""
    user_message = request.message
    
    if not user_message or len(user_message.strip()) == 0:
        return {"response": "Namaste! Main Neo hoon. Aap mujhse loan ke baare mein kuch bhi pooch sakte hain."}
    
    # Call Groq API with Llama model
    ai_response = call_groq(user_message)
    
    return {"response": ai_response}


# --- NEO AI CHAT ENDPOINT for Frontend (Gemini-compatible) ---
@app.post("/api/chat/gemini")
async def neo_chat_gemini(request: GeminiChatRequest):
    """Chat endpoint for Neo AI assistant - used by frontend chatbot."""
    user_message = request.message
    language = request.language or 'en'
    
    if not user_message or len(user_message.strip()) == 0:
        greeting = "Namaste! Main Neo hoon. Aap mujhse loan ke baare mein kuch bhi pooch sakte hain." if language == 'hi' else "Hello! I'm Neo, your loan assistant. How can I help you today?"
        return {"response": greeting, "navigation": None}
    
    # Add language context to the prompt
    lang_instruction = " Respond in Hindi." if language == 'hi' else " Respond in English."
    full_prompt = user_message + lang_instruction
    
    # Call Groq API with Llama model (Open Source)
    ai_response = call_groq(full_prompt)
    
    # Check for navigation commands in response
    navigation = None
    if "apply" in user_message.lower() or "loan le" in user_message.lower():
        navigation = "/apply.html"
    elif "track" in user_message.lower() or "status" in user_message.lower():
        navigation = "/dashboard.html"
    elif "agent" in user_message.lower() or "sahayak" in user_message.lower() or "job" in user_message.lower():
        navigation = "/agent_signup.html"
    
    return {"response": ai_response, "navigation": navigation}

@app.post("/api/ocr")
async def process_ocr(file: UploadFile = File(...)):
    """Extract text from ID card images (PAN/Aadhaar) using EasyOCR."""
    ocr_reader = get_ocr_reader()
    if not ocr_reader:
        return {"error": "OCR engine not available"}
    
    try:
        # Read file contents
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        import cv2
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run OCR
        results = ocr_reader.readtext(img, detail=0)
        
        # Extract structured info
        info = extract_document_info(results)
        
        return {
            "status": "success",
            "extracted": info,
            "raw_text": results
        }
    except Exception as e:
        print(f"OCR Processing Error: {e}")
        return {"status": "error", "message": str(e)}

