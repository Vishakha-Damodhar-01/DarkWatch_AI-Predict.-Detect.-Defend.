import re

class ThreatClassifier:
    def __init__(self):
        # Compiled patterns for signature verification
        self.rules = [
            {
                "pattern": r"(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|'\s*or\s*1\s*=\s*1)",
                "category": "SQL Injection Attempt",
                "base_score": 90,
                "severity": "Critical"
            },
            {
                "pattern": r"(failed\s+password|failed\s+publickey|invalid\s+user|ssh2\b.*failed)",
                "category": "Brute Force SSH Attempt",
                "base_score": 75,
                "severity": "High"
            },
            {
                "pattern": r"(\.\./\.\./|\.\.\\\.\.\\|/etc/passwd|/windows/win\.ini)",
                "category": "Directory Traversal / LFI",
                "base_score": 95,
                "severity": "Critical"
            },
            {
                "pattern": r"(nmap|masscan|zgrab|nikto)",
                "category": "Reconnaissance Scan",
                "base_score": 60,
                "severity": "Medium"
            },
            {
                "pattern": r"(wget\s+|curl\s+.*\|\s*sh|powershell\s+-ep\s+bypass)",
                "category": "Malicious Command Execution",
                "base_score": 88,
                "severity": "High"
            }
        ]

    def classify(self, payload: str):
        payload_lower = payload.lower()
        for rule in self.rules:
            if re.search(rule["pattern"], payload_lower):
                return {
                    "is_anomaly": True,
                    "threat_score": rule["base_score"] + int(hash(payload) % 6), # Add slight entropy
                    "category": rule["category"],
                    "severity": rule["severity"]
                }
        
        # Standard Normal Log
        return {
            "is_anomaly": False,
            "threat_score": max(5, int(hash(payload) % 15)),
            "category": "Normal Traffic",
            "severity": "Normal"
        }

# Singleton Instance
classifier = ThreatClassifier()
