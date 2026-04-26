from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        # Allow missing env file (tests override via environment directly)
        env_file_override=False,
        extra="ignore",
    )

    # 🚨 CRITICAL FIX: Removed the default value! 
    # Now it MUST read from your .env file or it will refuse to start.
    DATABASE_URL: str 
    
    SECRET_KEY: str = "dev-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GROQ_API_KEY: str = "not-set"

settings = Settings()