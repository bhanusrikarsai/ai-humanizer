import unittest
from backend.app import app, OTP_CACHE, USERS_DB
from fastapi.testclient import TestClient

client = TestClient(app)

class TestAuthEndpoints(unittest.TestCase):
    def setUp(self):
        OTP_CACHE.clear()
        USERS_DB.clear()

    def test_send_otp_success(self):
        res = client.post("/api/auth/send-otp", json={
            "email": "student.author@example.com",
            "name": "Alex Morgan",
            "type": "signup"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("email"), "student.author@example.com")
        self.assertNotIn("dev_otp", data)  # Ensure OTP is NEVER exposed to client
        self.assertIn("student.author@example.com", OTP_CACHE)

    def test_verify_otp_success(self):
        # 1. Send OTP
        client.post("/api/auth/send-otp", json={"email": "student.author@example.com"})
        otp = OTP_CACHE["student.author@example.com"]["otp"]

        # 2. Verify OTP
        res = client.post("/api/auth/verify-otp", json={
            "email": "student.author@example.com",
            "otp": otp,
            "name": "Alex Morgan"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        user = data.get("user")
        self.assertEqual(user["email"], "student.author@example.com")
        self.assertEqual(user["name"], "Alex Morgan")
        self.assertEqual(user["provider"], "email_otp")
        self.assertTrue(user.get("token"))

    def test_verify_wrong_otp_fails(self):
        client.post("/api/auth/send-otp", json={"email": "student.author@example.com"})
        res = client.post("/api/auth/verify-otp", json={
            "email": "student.author@example.com",
            "otp": "000000"
        })
        self.assertEqual(res.status_code, 400)

    def test_login_remembered_zero_otp(self):
        # 1. User signs up with OTP
        client.post("/api/auth/send-otp", json={"email": "student.author@example.com", "name": "Alex Morgan"})
        otp = OTP_CACHE["student.author@example.com"]["otp"]
        verify_res = client.post("/api/auth/verify-otp", json={
            "email": "student.author@example.com",
            "otp": otp,
            "name": "Alex Morgan"
        })
        self.assertEqual(verify_res.status_code, 200)

        # 2. Next time user logs in -> ZERO OTP NEEDED, remembered directly
        login_res = client.post("/api/auth/login-remembered", json={
            "email": "student.author@example.com"
        })
        self.assertEqual(login_res.status_code, 200)
        data = login_res.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data["user"]["email"], "student.author@example.com")
        self.assertEqual(data["user"]["name"], "Alex Morgan")
        self.assertTrue(data["user"].get("token"))

    def test_unregistered_login_without_otp_rejected(self):
        # Attempting to log in with an email that was never verified with OTP MUST FAIL with 404!
        login_res = client.post("/api/auth/login-remembered", json={
            "email": "unregistered.user@example.com"
        })
        self.assertEqual(login_res.status_code, 404)
        data = login_res.json()
        self.assertIn("Account not found", data.get("detail", ""))

    def test_verify_with_stateless_otp_token_after_cache_cleared(self):
        # 1. Send OTP
        res = client.post("/api/auth/send-otp", json={"email": "student.author@example.com"})
        data = res.json()
        otp_token = data.get("otp_token")
        self.assertIsNotNone(otp_token)
        otp = OTP_CACHE["student.author@example.com"]["otp"]

        # 2. Simulate serverless container restart: CLEAR in-memory cache completely!
        OTP_CACHE.clear()

        # 3. Verify OTP using the cryptographic otp_token -> MUST SUCCEED 100%!
        verify_res = client.post("/api/auth/verify-otp", json={
            "email": "student.author@example.com",
            "otp": otp,
            "otp_token": otp_token,
            "name": "Alex Morgan"
        })
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.json().get("success"))

if __name__ == "__main__":
    unittest.main()
