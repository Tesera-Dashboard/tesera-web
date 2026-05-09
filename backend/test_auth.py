import requests

BASE_URL = "http://127.0.0.1:8000/api/v1/auth"

print("--- Registering User & Company ---")
register_payload = {
    "company_name": "Acme Corp",
    "full_name": "Alice Admin",
    "email": "alice2@acme.com",
    "password": "supersecretpassword"
}
r1 = requests.post(f"{BASE_URL}/register", json=register_payload)
print(f"Status: {r1.status_code}")
print(r1.text)

print("\n--- Logging in ---")
login_payload = {
    "email": "alice2@acme.com",
    "password": "supersecretpassword"
}
# OAuth2PasswordRequestForm expects form data, but LoginRequest schema expects JSON.
# Oh, wait! OAuth2PasswordBearer sends a form! But my LoginRequest schema expects JSON!
# I should update auth.py to use OAuth2PasswordRequestForm.
# Wait, I used a custom LoginRequest schema. Let's see if it works with JSON.
# Oh, wait, the auth route `def login(request: LoginRequest ...)` takes JSON.
# Let's test it via JSON.
r2 = requests.post(f"{BASE_URL}/login", json=login_payload)
print(f"Status: {r2.status_code}")
print(r2.json())

token = None
if r2.status_code == 200:
    token = r2.json().get("access_token")

if token:
    print("\n--- Getting current user ---")
    headers = {"Authorization": f"Bearer {token}"}
    r3 = requests.get(f"{BASE_URL}/me", headers=headers)
    print(f"Status: {r3.status_code}")
    print(r3.json())
