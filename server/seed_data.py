
import json
import random
import uuid
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
APPS_FILE = BASE_DIR / "applications.json"
AGENTS_FILE = BASE_DIR / "agents.json"

# --- Helper Lists ---
first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharva", "Neerja", "Diya", "Ananya", "Pari", "Riya", "Saanvi", "Aadya", "Kiara", "Myra", "Saira", "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohan", "Kavita"]
last_names = ["Sharma", "Verma", "Gupta", "Malhotra", "Singh", "Patel", "Kumar", "Das", "Rao", "Nair", "Iyer", "Reddy", "Yadav", "Mishra", "Joshi", "Mehta", "Desai", "Jain", "Chopra", "Khanna"]
cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"]
loan_types = ["Personal Loan", "Business Loan", "Home Loan", "Education Loan"]
statuses = ["Approved", "Under Review", "Rejected", "Need More Info"]

employment_types = ["Salaried", "Self-Employed", "Business Owner"]

def generate_phone():
    return f"+91 {random.randint(60000, 99999)} {random.randint(10000, 99999)}"

def generate_pan():
    chars = "ABCDE"
    digits = "0123456789"
    return f"{''.join(random.choices(chars, k=5))}{''.join(random.choices(digits, k=4))}{random.choice(chars)}"

# --- Generate 15 Agents ---
agents = []
for i in range(15):
    agent_id = f"SAH-{random.randint(1000, 9999)}"
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    agent = {
        "id": agent_id,
        "name": name,
        "phone": generate_phone(),
        "email": f"{name.lower().replace(' ', '.')}@example.com",
        "city": random.choice(cities),
        "status": "Active",
        "total_earnings": random.randint(5000, 150000),
        "active_leads": random.randint(2, 20),
        "joined_date": f"2025-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
    }
    agents.append(agent)

with open(AGENTS_FILE, "w") as f:
    json.dump(agents, f, indent=4)
print(f"✅ Generated 15 Agents in {AGENTS_FILE}")

# --- Generate 100 Applications ---
applications = []
for i in range(100):
    app_id = f"APP-{random.randint(10000, 99999)}"
    fname = random.choice(first_names)
    lname = random.choice(last_names)
    full_name = f"{fname} {lname}"
    
    amount = random.randint(50000, 5000000)
    income = random.randint(20000, 200000)
    
    # Logic for status
    trust_score = random.randint(10, 99)
    if trust_score > 70:
        status = "Approved"
    elif trust_score > 40:
        status = "Under Review"
    else:
        status = "Rejected"

    # Assign to an agent randomly (30% chance)
    agent_ref = None
    if random.random() < 0.3:
        agent_ref = random.choice(agents)['id']

    app = {
        "fullName": full_name,
        "phone": generate_phone(),
        "pan": generate_pan(),
        "employmentType": random.choice(employment_types),
        "income": str(income),
        "amount": str(amount),
        "id": app_id,
        "trust_score": trust_score,
        "status": status,
        "date": f"2026-{random.randint(1, 5):02d}-{random.randint(1, 28):02d}",
        "loanType": random.choice(loan_types),
        "agentId": agent_ref
    }
    applications.append(app)

with open(APPS_FILE, "w") as f:
    json.dump(applications, f, indent=4)
print(f"✅ Generated 100 Applications in {APPS_FILE}")
