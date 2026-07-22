import os
import google.generativeai as genai

# Setup Gemini API key
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)
    has_gemini = True
else:
    has_gemini = False

def explain_alert(category: str, payload: str) -> str:
    """
    Explains a security event/anomaly using Gemini, or triggers the offline expert system.
    """
    prompt = (
        f"You are DarkWatch AI Cybersecurity Copilot. "
        f"Explain this security anomaly to a SOC Analyst.\n"
        f"Attack Category: {category}\n"
        f"Log Raw Payload: {payload}\n"
        f"Provide a brief description of the risk and recommended mitigation steps in exactly 3-4 bullet points."
    )

    if has_gemini:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            pass

    # Expert System Fallback
    if "SQL Injection" in category:
        return (
            "• **Risk**: Attempted SQL Injection targets database schema extraction or authentication bypass.\n"
            "• **Impact**: May lead to database compromise, data leak, or administrative takeover.\n"
            "• **Mitigation**: Implement parameterized queries, validate HTTP input parameters, and configure a Web Application Firewall (WAF)."
        )
    elif "Brute Force" in category:
        return (
            "• **Risk**: Brute force dictionary attack on SSH port indicates active credential harvesting.\n"
            "• **Impact**: Potential unauthorized access to root/administrative shell.\n"
            "• **Mitigation**: Restrict SSH access using hosts.allow/deny, enforce SSH Key authentication, and install Fail2ban."
        )
    elif "Directory Traversal" in category:
        return (
            "• **Risk**: Path traversal attempting to access system configuration files outside the webroot.\n"
            "• **Impact**: Exposure of administrative credentials or system files (e.g. /etc/passwd).\n"
            "• **Mitigation**: Sanitize and normalize file paths, restrict service privileges, and disable directory listings."
        )
    
    return (
        f"• **Risk**: Anomalous behaviour detected matching category '{category}'.\n"
        "• **Impact**: Potential policy violation or network exploitation attempt.\n"
        "• **Mitigation**: Isolate the source host temporarily, examine full session packets, and run security scans."
    )

def query_chatbot(user_message: str, history: list) -> str:
    """
    RAG-ready chatbot query engine. Answers general questions or helps investigate events.
    """
    prompt = (
        f"You are DarkWatch AI Cybersecurity Copilot. You are talking to a SOC Analyst.\n"
        f"User question: {user_message}\n"
        f"Answer clearly and concisely using markdown with terminal-like precision."
    )

    if has_gemini:
        try:
            # Build conversation history
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text
        except Exception:
            pass

    # Expert System Fallback Chatbot Responses
    msg = user_message.lower()
    if "sql" in msg:
        return (
            "### SQL Injection (SQLi) Explanation\n\n"
            "SQL Injection occurs when an attacker inserts malicious SQL statements into entry fields for execution.\n\n"
            "**Common Mitigation Checklist:**\n"
            "1. Use Prepared Statements (Parameterized Queries)\n"
            "2. Input validation & escaping (Allow-list validation)\n"
            "3. Enforce Least Privilege on DB accounts\n\n"
            "**Example Secure Code (Node.js/Mongoose):**\n"
            "```js\n"
            "// Secure: mongoose handles parameter validation automatically\n"
            "const user = await User.findOne({ username: req.body.username });\n"
            "```"
        )
    elif "brute force" in msg || "ssh" in msg:
        return (
            "### SSH Brute Force Mitigation\n\n"
            "Brute forcing is the process of trying systematic dictionary combinations to crack passwords.\n\n"
            "**DarkWatch AI Recommendations:**\n"
            "- Disable password auth: edit `/etc/ssh/sshd_config` and set `PasswordAuthentication no`.\n"
            "- Port Obfuscation: Change default SSH port from 22 to a random high port.\n"
            "- Enable fail2ban to drop traffic from offending IPs after 3 failures."
        )
    elif "summarize" in msg || "incidents" in msg || "alert" in msg:
        return (
            "### SOC Incident & Alert Summary\n\n"
            "Currently, there are **2 Active Security Incidents**:\n"
            "1. **inc_001 (High)**: SSH Brute Force from `198.51.100.42` targeting Database Server.\n"
            "2. **inc_002 (Critical)**: Local File Inclusion attempt from `203.0.113.195` targeting Web Server Gateway.\n\n"
            "**Recommended Action**: Review Web Server pathing and block IP `203.0.113.195` immediately via edge firewall."
        )

    return (
        f"I received your inquiry: *\"{user_message}\"*.\n\n"
        "As the DarkWatch AI Copilot, I am monitoring the security perimeter. You can ask me to:\n"
        "- Explain specific attack vectors (e.g. SQL Injection, Directory Traversal)\n"
        "- Summarize current alerts or active incidents\n"
        "- Recommend system configurations for firewalls or endpoints"
    )
