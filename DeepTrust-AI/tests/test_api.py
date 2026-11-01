import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_health():
    res = urllib.request.urlopen(f"{BASE_URL}/health")
    data = json.loads(res.read())
    assert data["status"] == "healthy"
    print("[PASS] Health Check Passed:", data["platform"])

def test_transparency_metrics():
    res = urllib.request.urlopen(f"{BASE_URL}/transparency/metrics")
    data = json.loads(res.read())
    assert len(data["models"]) >= 4
    for m in data["models"]:
        assert "metrics" in m
        assert m["metrics"]["accuracy"] > 80.0
    print(f"[PASS] Model Transparency Passed: {len(data['models'])} models with verified benchmark evaluations.")

def test_demo_samples():
    res = urllib.request.urlopen(f"{BASE_URL}/demo/samples")
    samples = json.loads(res.read())
    assert len(samples) >= 8
    print(f"[PASS] Live Demo Lab Suite Passed: {len(samples)} curated test specimens loaded.")

def test_auth_and_login():
    # Login with demo credentials
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login",
        data=json.dumps({"email": "demo@deeptrust.ai", "password": "DeepTrust#2026"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    token = data["access_token"]
    assert token is not None
    print("[PASS] Authentication Passed: Logged in as", data["user"]["full_name"])
    return token

def test_dashboard_stats(token):
    req = urllib.request.Request(
        f"{BASE_URL}/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    res = urllib.request.urlopen(req)
    stats = json.loads(res.read())
    assert "total_scans" in stats
    assert "potential_deepfakes" in stats
    print("[PASS] Dashboard Stats Passed: Total scans in DB =", stats["total_scans"])

def test_text_and_url_scans(token):
    # 1. Text Scam Scan
    req = urllib.request.Request(
        f"{BASE_URL}/scans/text",
        data=json.dumps({
            "content": "ALERT: Your bank account will be blocked today. Share your OTP immediately.",
            "media_type": "message"
        }).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    )
    res = urllib.request.urlopen(req)
    scan_text = json.loads(res.read())
    assert scan_text["overall_risk"] in ("medium", "high", "critical")
    assert len(scan_text["flagged_phrases"]) >= 2
    print("[PASS] Text Scam Analysis Passed: Risk Score =", scan_text["risk_score"], "%")

    # 2. Safe URL Phishing Scan
    req2 = urllib.request.Request(
        f"{BASE_URL}/scans/text",
        data=json.dumps({
            "content": "http://paypa1-account-login.top/verify",
            "media_type": "url"
        }).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    )
    res2 = urllib.request.urlopen(req2)
    scan_url = json.loads(res2.read())
    assert scan_url["overall_risk"] in ("medium", "high", "critical")
    print("[PASS] Safe URL Phishing Analysis Passed: Detected Indicators =", len(scan_url["forensic_details"]["detected_indicators"]))

def test_guardian_assistant(token):
    req = urllib.request.Request(
        f"{BASE_URL}/assistant/chat",
        data=json.dumps({
            "message": "Someone called asking for my OTP to unfreeze my bank account. What should I do?",
            "language": "en"
        }).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    )
    res = urllib.request.urlopen(req)
    resp = json.loads(res.read())
    assert "NEVER SHARE YOUR OTP" in resp["reply"] or "CRITICAL" in resp["reply"]
    print("[PASS] DeepTrust Guardian Assistant Passed: Safety advice rendered with", len(resp["suggested_actions"]), "action chips.")

if __name__ == "__main__":
    print("\n================ DEEPTRUST AI COMPREHENSIVE QA TEST SUITE ================")
    test_health()
    test_transparency_metrics()
    test_demo_samples()
    token = test_auth_and_login()
    test_dashboard_stats(token)
    test_text_and_url_scans(token)
    test_guardian_assistant(token)
    print("================ ALL SYSTEM VERIFICATION CHECKS PASSED ================\n")
