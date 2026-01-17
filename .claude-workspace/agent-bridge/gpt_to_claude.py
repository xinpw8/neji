#!/usr/bin/env python3
"""
GPT to Claude Bridge Script

Allows GPT to send prompts to Claude and receive responses.
Requires ANTHROPIC_API_KEY environment variable.

Usage:
    python gpt_to_claude.py "Your prompt here"
    python gpt_to_claude.py --file prompt.txt
"""

import os
import sys
import argparse

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic package not installed. Run: pip install anthropic")
    sys.exit(1)

from config import (
    MODELS,
    SYSTEM_PROMPTS,
    ANTHROPIC_API_KEY_ENV,
    API_TIMEOUT,
    MAX_TOKENS
)


def get_api_key():
    """Get Anthropic API key from environment."""
    api_key = os.environ.get(ANTHROPIC_API_KEY_ENV)
    if not api_key:
        print(f"ERROR: {ANTHROPIC_API_KEY_ENV} environment variable not set.")
        print(f"Set it with: export {ANTHROPIC_API_KEY_ENV}='your-key-here'")
        sys.exit(1)
    return api_key


def send_to_claude(prompt: str, system_prompt: str = None) -> str:
    """
    Send a prompt to Claude and return the response.

    Args:
        prompt: The user prompt to send
        system_prompt: Optional system prompt (uses default if not provided)

    Returns:
        The Claude response text
    """
    api_key = get_api_key()

    if system_prompt is None:
        system_prompt = SYSTEM_PROMPTS["claude"]

    client = anthropic.Anthropic(api_key=api_key, timeout=API_TIMEOUT)

    try:
        response = client.messages.create(
            model=MODELS["claude"],
            max_tokens=MAX_TOKENS["claude"],
            system=system_prompt,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Extract text from response
        if response.content and len(response.content) > 0:
            return response.content[0].text
        return "ERROR: Empty response from Claude"

    except anthropic.APIConnectionError as e:
        return f"ERROR [Connection]: Could not connect to Anthropic API: {e}"
    except anthropic.RateLimitError as e:
        return f"ERROR [RateLimit]: Rate limit exceeded: {e}"
    except anthropic.APIStatusError as e:
        return f"ERROR [API Status {e.status_code}]: {e.message}"
    except Exception as e:
        error_type = type(e).__name__
        return f"ERROR [{error_type}]: {str(e)}"


def main():
    parser = argparse.ArgumentParser(
        description="Send a prompt to Claude from GPT",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python gpt_to_claude.py "I found these bugs: ..."
    python gpt_to_claude.py --file report.txt
    python gpt_to_claude.py "Fix this code" --system "You are a code fixer"
        """
    )

    parser.add_argument(
        "prompt",
        nargs="?",
        help="The prompt to send to Claude"
    )

    parser.add_argument(
        "--file", "-f",
        help="Read prompt from a file instead"
    )

    parser.add_argument(
        "--system", "-s",
        help="Custom system prompt (optional)"
    )

    parser.add_argument(
        "--raw", "-r",
        action="store_true",
        help="Output only the response without headers"
    )

    args = parser.parse_args()

    # Get prompt from argument or file
    if args.file:
        try:
            with open(args.file, 'r') as f:
                prompt = f.read().strip()
        except FileNotFoundError:
            print(f"ERROR: File not found: {args.file}")
            sys.exit(1)
        except Exception as e:
            print(f"ERROR reading file: {e}")
            sys.exit(1)
    elif args.prompt:
        prompt = args.prompt
    else:
        parser.print_help()
        print("\nERROR: No prompt provided. Use positional argument or --file")
        sys.exit(1)

    if not prompt:
        print("ERROR: Empty prompt")
        sys.exit(1)

    # Send to Claude
    if not args.raw:
        print("=" * 60)
        print(f"SENDING TO CLAUDE ({MODELS['claude']})")
        print("=" * 60)
        print(f"PROMPT:\n{prompt[:200]}{'...' if len(prompt) > 200 else ''}")
        print("-" * 60)
        print("RESPONSE:")
        print("-" * 60)

    response = send_to_claude(prompt, args.system)
    print(response)

    if not args.raw:
        print("=" * 60)


if __name__ == "__main__":
    main()
