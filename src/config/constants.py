"""
AutoReply Pro - Configuration Constants
Python utility for data analysis and reporting
"""

# Subscription Plans
PLANS = {
    "free": {"max_rules": 5, "price": 0, "features": ["messenger", "away_mode"]},
    "starter": {"max_rules": 25, "price": 4.99, "features": ["messenger", "away_mode", "ai_reply"]},
    "pro": {"max_rules": 100, "price": 9.99, "features": ["messenger", "whatsapp", "away_mode", "ai_reply"]},
    "enterprise": {"max_rules": 99999, "price": 29.99, "features": ["messenger", "whatsapp", "away_mode", "ai_reply", "api_access", "multi_page"]},
}

# Rate Limits
RATE_LIMITS = {
    "free": {"requests_per_minute": 10, "ai_calls_per_day": 50},
    "starter": {"requests_per_minute": 30, "ai_calls_per_day": 200},
    "pro": {"requests_per_minute": 60, "ai_calls_per_day": 1000},
    "enterprise": {"requests_per_minute": 120, "ai_calls_per_day": 5000},
}

# Supported Platforms
PLATFORMS = ["messenger", "whatsapp", "instagram", "telegram"]

# AI Models
AI_MODELS = {
    "gemini-2.0-flash": {"provider": "google", "cost_per_1k_tokens": 0.0},
    "gpt-4o-mini": {"provider": "openai", "cost_per_1k_tokens": 0.15},
}

# Webhook Events
WEBHOOK_EVENTS = [
    "messages",
    "messaging_postbacks",
    "messaging_optins",
    "message_deliveries",
    "message_reads",
]


class AutoReplyConfig:
    """Main configuration class"""
    
    APP_NAME = "AutoReply Pro"
    VERSION = "2.0.0"
    API_VERSION = "v1"
    
    # JWT
    JWT_EXPIRY_DAYS = 30
    JWT_ALGORITHM = "HS256"
    
    # Password
    BCRYPT_SALT_ROUNDS = 10
    MIN_PASSWORD_LENGTH = 6
    
    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100


if __name__ == "__main__":
    print(f"{AutoReplyConfig.APP_NAME} v{AutoReplyConfig.VERSION}")
    print(f"Plans: {list(PLANS.keys())}")
    print(f"Platforms: {PLATFORMS}")
