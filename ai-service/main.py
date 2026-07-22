from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from models.anomaly_detector import detector
from models.threat_classifier import classifier
from services.gemini_client import explain_alert, query_chatbot

app = FastAPI(title="DarkWatch AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class LogAnalysisRequest(BaseModel):
    sourceIp: Optional[str] = "127.0.0.1"
    destinationIp: Optional[str] = "127.0.0.1"
    service: Optional[str] = "syslog"
    payload: str

class NetworkAnalysisRequest(BaseModel):
    bytesSentKb: float
    packetsCount: float
    requestsPerMin: float
    responseTimeMs: float

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@app.get("/")
def read_root():
    return {"status": "online", "model": "DarkWatch AI Models Suite"}

@app.post("/analyze")
def analyze_log(req: LogAnalysisRequest):
    try:
        res = classifier.classify(req.payload)
        # Generate custom explanation using Gemini API or offline rules
        explanation = explain_alert(res["category"], req.payload)
        res["explanation"] = explanation
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/network/analyze")
def analyze_network(req: NetworkAnalysisRequest):
    try:
        is_anomaly = detector.predict(
            req.bytesSentKb,
            req.packetsCount,
            req.requestsPerMin,
            req.responseTimeMs
        )
        # Assign dynamic threat score
        threat_score = 75 if is_anomaly else 12
        severity = "High" if is_anomaly else "Normal"
        category = "Network Traffic Anomaly" if is_anomaly else "Standard Network Traffic"
        
        explanation = (
            "• **Risk**: Bandwidth or packet metrics exceeded threshold parameters.\n"
            "• **Impact**: Indication of network-based DDoS, scanning, or large exfiltration.\n"
            "• **Mitigation**: Investigate active ports, check connection rates, limit source IP."
        ) if is_anomaly else "Traffic parameters sit within operational standards."

        return {
            "isAnomaly": is_anomaly,
            "threatScore": threat_score,
            "severity": severity,
            "category": category,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat_copilot(req: ChatMessage):
    try:
        response = query_chatbot(req.message, req.history)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
