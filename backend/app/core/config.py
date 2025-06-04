import os
import logging
from typing import List, Optional, Union, Dict, Any
from pydantic import AnyHttpUrl, validator, field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CHIDI App"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS Configuration
    CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "http://localhost:8000"
    ]
    
    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    REDIS_URL: str = os.getenv(
        "REDIS_URL", 
        f"redis://{'':' + REDIS_PASSWORD + '@' if REDIS_PASSWORD else ''}{REDIS_HOST}:{REDIS_PORT}/0"
    )
    
    # Celery Configuration
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", REDIS_URL)
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
    
    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    def validate_supabase_config(self) -> bool:
        """Validate that Supabase configuration is present"""
        if not self.SUPABASE_URL or not self.SUPABASE_KEY:
            logger.warning("Supabase URL or key not set. Authentication will not work properly.")
            return False
        return True
    
    def validate_openai_config(self) -> bool:
        """Validate that OpenAI configuration is present"""
        if not self.OPENAI_API_KEY:
            logger.warning("OpenAI API key not set. AI features will not work properly.")
            return False
        return True
    
    def validate_database_config(self) -> bool:
        """Validate that database configuration is present"""
        if not self.DATABASE_URL:
            logger.warning("Database URL not set. Database operations will not work properly.")
            return False
        return True
    
    def get_redis_connection_params(self) -> Dict[str, Any]:
        """Get Redis connection parameters"""
        params = {
            "host": self.REDIS_HOST,
            "port": self.REDIS_PORT,
        }
        if self.REDIS_PASSWORD:
            params["password"] = self.REDIS_PASSWORD
        return params
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Log configuration status on import
logger.info(f"Environment: {settings.ENVIRONMENT}")
logger.info(f"API Version: {settings.API_V1_STR}")
logger.info(f"CORS Origins: {settings.CORS_ORIGINS}")

# Validate critical configurations
supabase_valid = settings.validate_supabase_config()
db_valid = settings.validate_database_config()
openai_valid = settings.validate_openai_config()
