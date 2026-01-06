print("Importing passlib.hash.pbkdf2_sha256...")
try:
    from passlib.hash import pbkdf2_sha256
    print("✅ pbkdf2_sha256 imported")
except Exception as e:
    print(f"❌ pbkdf2_sha256 failed: {e}")

print("Importing fastapi...")
try:
    from fastapi import Depends
    print("✅ fastapi imported")
except Exception as e:
    print(f"❌ fastapi failed: {e}")
