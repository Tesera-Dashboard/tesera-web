import requests

API_URL = "http://127.0.0.1:8000/api/v1"

# Create a test user
register_data = {
    "company_name": "API Test Corp",
    "email": "apitest2@example.com",
    "password": "password123",
    "full_name": "API Tester"
}
requests.post(f"{API_URL}/auth/register", json=register_data)

# Login
login_data = {
    "username": "apitest2@example.com",
    "password": "password123"
}
res = requests.post(f"{API_URL}/auth/login", data=login_data)
token = res.json().get("access_token")
print(f"Token: {token}")

# Seed
headers = {"Authorization": f"Bearer {token}"}
seed_res = requests.post(f"{API_URL}/test/seed", headers=headers)
print(f"Seed Response: {seed_res.status_code}")
print(seed_res.text)

