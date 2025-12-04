from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MariaDB Configuration
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "summerberry"
    
    # ML Model Path
    model_path: str = "./models/harvest_model.joblib"
    
    # CORS Origins
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
