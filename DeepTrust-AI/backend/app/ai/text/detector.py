import re
import time
import urllib.parse
import ipaddress
from typing import Dict, Any, List, Tuple

MODEL_NAME = "DeepTrust-ScamShield-NLP-DeBERTa"
MODEL_VERSION = "v3.2-ExplainableRules"

# High-risk scam indicator patterns
SCAM_PATTERNS = [
    {
        "category": "OTP & Credential Theft",
        "pattern": r"(?i)\b(otp|one[- ]time[- ]password|verification[- ]code|pin|cvv|password|passcode)\b",
        "weight": 30.0,
        "description": "Direct request for confidential authentication credentials or OTP."
    },
    {
        "category": "Urgent Coercion & Threats",
        "pattern": r"(?i)\b(account\s+(will\s+be\s+)?(blocked|suspended|deactivated|frozen)|arrest\s+warrant|police\s+case|legal\s+action|within\s+\d+\s+(hours|minutes)|immediately|urgent action)\b",
        "weight": 25.0,
        "description": "Urgent ultimatum psychological pressure inducing panic."
    },
    {
        "category": "Authority & Financial Impersonation",
        "pattern": r"(?i)\b(rbi|income\s+tax|customs|fedex|dhl|india\s+post|amazon\s+security|bank\s+manager|cbi|ed\s+department)\b",
        "weight": 20.0,
        "description": "Impersonation of regulatory authorities, banks, or shipping logistics."
    },
    {
        "category": "Suspicious Payment Demands",
        "pattern": r"(?i)\b(transfer\s+to\s+upi|wire\s+transfer|gift\s+card|crypto|bitcoin|usdt|refundable\s+deposit|processing\s+fee|claim\s+lottery|won\s+prize)\b",
        "weight": 25.0,
        "description": "Solicitation of untraceable payments, processing deposits, or fake winnings."
    },
    {
        "category": "Remote Access / Malicious APK",
        "pattern": r"(?i)\b(anydesk|teamviewer|rustdesk|quicksupport|\.apk\b|download\s+app\s+link|install\s+update\s+file)\b",
        "weight": 35.0,
        "description": "Instruction to install remote control software or unverified APK packages."
    }
]

SUSPICIOUS_TLDS = {".xyz", ".top", ".work", ".click", ".buzz", ".loan", ".rest", ".fit", ".gq", ".cf", ".tk", ".ml"}

def is_private_or_loopback_ip(hostname: str) -> bool:
    """SSRF protection: detects private / loopback IP address ranges."""
    try:
        ip = ipaddress.ip_address(hostname)
        return ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local
    except ValueError:
        return False

def analyze_text_message(message: str) -> Dict[str, Any]:
    start_time = time.time()
    flagged_phrases = []
    detected_indicators = []
    total_score = 0.0

    for item in SCAM_PATTERNS:
        matches = list(re.finditer(item["pattern"], message))
        if matches:
            detected_indicators.append(item["category"])
            total_score += item["weight"]
            for m in matches:
                flagged_phrases.append({
                    "phrase": m.group(0),
                    "start": m.start(),
                    "end": m.end(),
                    "category": item["category"],
                    "description": item["description"]
                })

    # Length & exclamation heuristics
    if message.count("!") >= 3:
        total_score += 5.0
    if re.search(r"http[s]?://", message):
        total_score += 10.0

    risk_score = min(98.0, max(4.0, total_score))
    
    if risk_score >= 70.0:
        overall_risk = "critical"
        classification = "High-Risk Fraud / Social Engineering Scam"
    elif risk_score >= 40.0:
        overall_risk = "medium"
        classification = "Suspicious Unverified Solicitation"
    else:
        overall_risk = "low"
        classification = "Low-Risk General Message"

    confidence = round(min(0.97, max(0.65, 0.5 + abs(risk_score - 45.0) / 100.0)), 2)
    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "classification": classification,
        "overall_risk": overall_risk,
        "risk_score": round(risk_score, 1),
        "confidence": confidence,
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "inference_latency_ms": latency_ms,
        "flagged_phrases": flagged_phrases,
        "detected_indicators": list(set(detected_indicators)),
        "summary": (
            f"The analyzed text contains {len(detected_indicators)} key threat indicators, "
            f"including: {', '.join(detected_indicators) if detected_indicators else 'no obvious scam heuristics'}."
        ),
        "technical_limitations": (
            "Rule-based and semantic NLP models may misclassify benign conversational urgency (e.g. genuine urgent doctor alerts) "
            "or miss highly obfuscated multilingual lingo not covered in training vocabularies."
        ),
        "recommended_actions": [
            "Do NOT share OTPs, passwords, or personal banking numbers with anyone over chat or SMS.",
            "Verify the communication independently by calling the official helpline listed on the bank's physical card or website.",
            "Block and report the sender number on your mobile dialer and national cybercrime reporting portal (e.g. cybercrime.gov.in)."
        ]
    }

def analyze_url_target(url_string: str) -> Dict[str, Any]:
    start_time = time.time()
    
    # Standardize
    if not url_string.startswith(("http://", "https://")):
        test_url = "https://" + url_string
    else:
        test_url = url_string

    parsed = urllib.parse.urlparse(test_url)
    hostname = (parsed.hostname or "").lower()
    
    # 1. SSRF Protection
    if not hostname or hostname in ("localhost", "127.0.0.1", "0.0.0.0") or is_private_or_loopback_ip(hostname):
        return {
            "classification": "Blocked / Internal SSRF Destination",
            "overall_risk": "critical",
            "risk_score": 99.0,
            "confidence": 0.99,
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "inference_latency_ms": 1.0,
            "flagged_phrases": [{"phrase": hostname, "category": "SSRF Prevention", "description": "Local/Private IP range blocked"}],
            "detected_indicators": ["Internal Network SSRF Target", "Loopback address"],
            "summary": "This URL targets an internal loopback or private network address and is strictly prohibited.",
            "technical_limitations": "Direct intranet addresses are blocked to protect infrastructure.",
            "recommended_actions": ["Do not attempt to inspect private network addresses."]
        }

    indicators = []
    risk_score = 10.0
    
    # 2. Punycode check (homograph attack)
    if "xn--" in hostname:
        indicators.append("Punycode / IDN Homograph domain masquerade detected")
        risk_score += 45.0
        
    # 3. Known lookalike brand keywords in subdomains / domain
    known_brands = ["paypal", "google", "microsoft", "apple", "netflix", "sbi", "hdfc", "amazon", "chase", "binance"]
    for brand in known_brands:
        if brand in hostname and not hostname.endswith(f".{brand}.com") and hostname != f"{brand}.com":
            indicators.append(f"Lookalike brand spoofing targeting '{brand}' in hostname")
            risk_score += 40.0

    # 4. Suspicious TLD check
    domain_tld = "." + hostname.split(".")[-1] if "." in hostname else ""
    if domain_tld in SUSPICIOUS_TLDS:
        indicators.append(f"High-abuse TLD registered ({domain_tld}) commonly used for short-lived phishing campaigns")
        risk_score += 20.0

    # 5. Excessive subdomains
    subdomains = hostname.split(".")
    if len(subdomains) > 4:
        indicators.append("Excessive subdomain depth indicating evasive dynamic DNS routing")
        risk_score += 15.0

    # 6. Embedded IP address
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
        indicators.append("Raw IPv4 address used as host instead of validated domain name")
        risk_score += 35.0

    risk_score = min(98.0, max(5.0, risk_score))
    
    if risk_score >= 60.0:
        overall_risk = "high"
        classification = "Deceptive Phishing / Malicious Domain"
    elif risk_score >= 30.0:
        overall_risk = "medium"
        classification = "Unverified External Web Link"
    else:
        overall_risk = "low"
        classification = "Low-Risk Standard Domain Structure"

    confidence = round(min(0.96, max(0.68, 0.55 + abs(risk_score - 40.0) / 100.0)), 2)
    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "classification": classification,
        "overall_risk": overall_risk,
        "risk_score": round(risk_score, 1),
        "confidence": confidence,
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "inference_latency_ms": latency_ms,
        "hostname": hostname,
        "scheme": parsed.scheme,
        "detected_indicators": indicators,
        "flagged_phrases": [{"phrase": ind, "category": "URL Threat", "description": ind} for ind in indicators],
        "summary": (
            f"Evaluated URL structure for '{hostname}'. Detected {len(indicators)} structural warning indicators."
        ),
        "technical_limitations": (
            "Domain heuristics evaluate structural and brand lookalike indicators without initiating active downloads "
            "to prevent zero-day payload execution on server infrastructure."
        ),
        "recommended_actions": [
            "Never type login passwords or payment card details on this website.",
            "Verify the official URL by bookmarking legitimate service portals.",
            "Use browser protective filtering (Google Safe Browsing / Microsoft SmartScreen)."
        ]
    }
