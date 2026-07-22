import numpy as np
from sklearn.ensemble import IsolationForest

class NetworkAnomalyDetector:
    def __init__(self):
        # Initialize an Isolation Forest model
        # Contamination is set to roughly 5% expected anomaly rate
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        
        # Fit with some baseline normal traffic features
        # Features: [bytes_sent_kb, packets_count, requests_per_min, response_time_ms]
        baseline_data = np.array([
            [12, 15, 10, 45],
            [15, 20, 12, 50],
            [8, 10, 5, 35],
            [25, 30, 20, 75],
            [14, 18, 11, 48],
            [150, 120, 80, 200],  # slightly busy
            [10, 12, 8, 40],
            [18, 22, 15, 55],
            [5, 8, 4, 30],
            [30, 35, 25, 80]
        ])
        self.model.fit(baseline_data)

    def predict(self, bytes_sent, packets, requests, response_time):
        """
        Returns True if anomaly is detected, False if normal.
        """
        X = np.array([[bytes_sent, packets, requests, response_time]])
        prediction = self.model.predict(X)
        # Isolation Forest returns -1 for anomalies, 1 for normal
        return bool(prediction[0] == -1)

# Singleton Instance
detector = NetworkAnomalyDetector()
