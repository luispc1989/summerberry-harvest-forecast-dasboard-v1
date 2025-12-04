import joblib
import numpy as np
from pathlib import Path
from config import get_settings

settings = get_settings()


class HarvestModel:
    """Wrapper for the ML harvest prediction model."""
    
    def __init__(self):
        self.model = None
        self.feature_importance = None
        self._load_model()
    
    def _load_model(self):
        """Load the trained model from disk."""
        model_path = Path(settings.model_path)
        
        if model_path.exists():
            try:
                self.model = joblib.load(model_path)
                print(f"Model loaded from {model_path}")
                
                # Extract feature importance if available
                if hasattr(self.model, 'feature_importances_'):
                    self.feature_importance = self.model.feature_importances_
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None
        else:
            print(f"Model file not found at {model_path}. Using mock predictions.")
            self.model = None
    
    def predict(self, features: np.ndarray) -> np.ndarray:
        """
        Generate predictions from input features.
        
        Args:
            features: numpy array of shape (n_samples, n_features)
            
        Returns:
            predictions: numpy array of predicted harvest values
        """
        if self.model is None:
            # Return mock predictions if no model is loaded
            return self._mock_predictions(features.shape[0])
        
        return self.model.predict(features)
    
    def _mock_predictions(self, n_days: int) -> np.ndarray:
        """Generate mock predictions for testing."""
        base = 215
        return np.array([
            int(base * (0.9 + np.random.random() * 0.2))
            for _ in range(n_days)
        ])
    
    def get_feature_importance(self) -> dict[str, float]:
        """Get feature importance scores."""
        if self.feature_importance is None:
            # Return mock feature importance
            return {
                "Temperature": 0.78,
                "Flower Abortion Rate": 0.72,
                "Irrigation Volume": 0.55,
                "Humidity": 0.48,
                "Solar Radiation": 0.42
            }
        
        # Map feature indices to names (adjust based on your model)
        feature_names = [
            "Temperature",
            "Flower Abortion Rate", 
            "Irrigation Volume",
            "Humidity",
            "Solar Radiation"
        ]
        
        return {
            name: float(imp) 
            for name, imp in zip(feature_names, self.feature_importance[:5])
        }


# Singleton instance
_model_instance = None


def get_model() -> HarvestModel:
    """Get or create the model singleton."""
    global _model_instance
    if _model_instance is None:
        _model_instance = HarvestModel()
    return _model_instance
