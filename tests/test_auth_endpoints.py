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
            "email": "vu.241fa04267@gmail.com",
            "name": "Bhanu",
            "type": "signup"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("email"), "vu.241fa04267@gmail.com")
        self.assertNotIn("dev_otp", data)  # Ensure OTP is NEVER exposed to client
        self.assertIn("vu.241fa04267@gmail.com", OTP_CACHE)

    def test_verify_otp_success(self):
        # 1. Send OTP
        client.post("/api/auth/send-otp", json={"email": "vu.241fa04267@gmail.com"})
        otp = OTP_CACHE["vu.241fa04267@gmail.com"]["otp"]

        # 2. Verify OTP
        res = client.post("/api/auth/verify-otp", json={
            "email": "vu.241fa04267@gmail.com",
            "otp": otp,
            "name": "Bhanu Srikar"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        user = data.get("user")
        self.assertEqual(user["email"], "vu.241fa04267@gmail.com")
        self.assertEqual(user["name"], "Bhanu Srikar")
        self.assertEqual(user["provider"], "email_otp")
        self.assertTrue(user.get("token"))

    def test_verify_wrong_otp_fails(self):
        client.post("/api/auth/send-otp", json={"email": "vu.241fa04267@gmail.com"})
        res = client.post("/api/auth/verify-otp", json={
            "email": "vu.241fa04267@gmail.com",
            "otp": "000000"
        })
        self.assertEqual(res.status_code, 400)

    def test_google_login_success(self):
        res = client.post("/api/auth/google-login", json={
            "email": "googleuser@gmail.com",
            "name": "Google Tester",
            "picture": "https://lh3.googleusercontent.com/a/test"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        user = data.get("user")
        self.assertEqual(user["email"], "googleuser@gmail.com")
    def test_login_remembered_zero_otp(self):
        # 1. User signs up with OTP
        client.post("/api/auth/send-otp", json={"email": "vu.241fa04267@gmail.com", "name": "Srikar"})
        otp = OTP_CACHE["vu.241fa04267@gmail.com"]["otp"]
        verify_res = client.post("/api/auth/verify-otp", json={
            "email": "vu.241fa04267@gmail.com",
            "otp": otp,
            "name": "Srikar"
        })
        self.assertEqual(verify_res.status_code, 200)

        # 2. Next time user logs in -> ZERO OTP NEEDED, remembered directly
        login_res = client.post("/api/auth/login-remembered", json={
            "email": "vu.241fa04267@gmail.com"
        })
        self.assertEqual(login_res.status_code, 200)
        data = login_res.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data["user"]["email"], "vu.241fa04267@gmail.com")
        self.assertEqual(data["user"]["name"], "Srikar")
        self.assertTrue(data["user"].get("token"))

if __name__ == "__main__":
    unittest.main()
