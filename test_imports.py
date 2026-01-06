import sys
print(f"Python Executable: {sys.executable}")
print("Importing jose...")
try:
    import jose
    print("✅ jose imported")
except ImportError as e:
    print(f"❌ Failed jose: {e}")

print("Importing server.auth...")
try:
    import server.auth
    print("✅ server.auth imported")
except ImportError as e:
    print(f"❌ Failed server.auth: {e}")

print("Importing server.main...")
try:
    import server.main
    print("✅ server.main imported")
except ImportError as e:
    print(f"❌ Failed server.main: {e}")
