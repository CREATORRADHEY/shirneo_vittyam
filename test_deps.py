print("Importing cv2...")
try:
    import cv2
    print("✅ cv2 imported")
except Exception as e:
    print(f"❌ cv2 failed: {e}")

print("Importing google.generativeai...")
try:
    import google.generativeai as genai
    print("✅ google.generativeai imported")
except Exception as e:
    print(f"❌ google.generativeai failed: {e}")
