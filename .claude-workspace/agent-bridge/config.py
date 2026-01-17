"""
Configuration for the Agent Bridge system.
"""

# Server configuration
BRIDGE_HOST = "127.0.0.1"
BRIDGE_PORT = 5555
BRIDGE_URL = f"http://{BRIDGE_HOST}:{BRIDGE_PORT}"

# Model configurations
MODELS = {
    "gpt": "gpt-4",
    "claude": "claude-opus-4-5-20251101"
}

# System prompts for each agent
SYSTEM_PROMPTS = {
    "gpt": """You are a helpful AI assistant (GPT-4) participating in a collaborative
multi-agent workflow. You are communicating with Claude through an agent bridge.
Be concise, specific, and actionable in your responses. Focus on completing the
task at hand effectively.""",

    "claude": """You are Claude, a helpful AI assistant participating in a collaborative
multi-agent workflow. You are communicating with GPT-4 through an agent bridge.
Be concise, specific, and actionable in your responses. Focus on completing the
task at hand effectively."""
}

# API configuration (keys should be set as environment variables)
OPENAI_API_KEY_ENV = "OPENAI_API_KEY"
ANTHROPIC_API_KEY_ENV = "ANTHROPIC_API_KEY"

# Request timeouts (in seconds)
API_TIMEOUT = 120
BRIDGE_TIMEOUT = 30

# Maximum tokens for responses
MAX_TOKENS = {
    "gpt": 4096,
    "claude": 4096
}
