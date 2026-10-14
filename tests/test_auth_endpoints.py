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
            "email": "tester@gmail.com",
            "name": "Bhanu",
            "type": "signup"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("email"), "tester@gmail.com")
        self.assertTrue(len(data.get("dev_otp", "")) == 6)
        self.assertIn("tester@gmail.com", OTP_CACHE)

    def test_verify_otp_success(self):
        # 1. Send OTP
        send_res = client.post("/api/auth/send-otp", json={"email": "tester@gmail.com"})
        dev_otp = send_res.json()["dev_otp"]

        # 2. Verify OTP
        res = client.post("/api/auth/verify-otp", json={
            "email": "tester@gmail.com",
            "otp": dev_otp,
            "name": "Bhanu Srikar"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("success"))
        user = data.get("user")
        self.assertEqual(user["email"], "tester@gmail.com")
        self.assertEqual(user["name"], "Bhanu Srikar")
        self.assertEqual(user["provider"], "email_otp")
        self.assertTrue(user.get("token"))

    def test_verify_wrong_otp_fails(self):
        client.post("/api/auth/send-otp", json={"email": "tester@gmail.com"})
        res = client.post("/api/auth/verify-otp", json={
            "email": "tester@gmail.com",
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
        self.assertEqual(user["provider"], "google")

if __name__ == "__main__":
    unittest.main()
