#!/usr/bin/env python3
"""
Claude to GPT Bridge Script

Allows Claude to send prompts to GPT-4 and receive responses.
Requires OPENAI_API_KEY environment variable.

Usage:
    python claude_to_gpt.py "Your prompt here"
    python claude_to_gpt.py --file prompt.txt
"""

import os
import sys
import argparse

try:
    from openai import OpenAI
except ImportError:
    print("ERROR: openai package not installed. Run: pip install openai")
    sys.exit(1)

from config import (
    MODELS,
    SYSTEM_PROMPTS,
    OPENAI_API_KEY_ENV,
    API_TIMEOUT,
    MAX_TOKENS
)


def get_api_key():
    """Get OpenAI API key from environment."""
    api_key = os.environ.get(OPENAI_API_KEY_ENV)
    if not api_key:
        print(f"ERROR: {OPENAI_API_KEY_ENV} environment variable not set.")
        print(f"Set it with: export {OPENAI_API_KEY_ENV}='your-key-here'")
        sys.exit(1)
    return api_key


def send_to_gpt(prompt: str, system_prompt: str = None) -> str:
    """
    Send a prompt to GPT-4 and return the response.

    Args:
        prompt: The user prompt to send
        system_prompt: Optional system prompt (uses default if not provided)

    Returns:
        The GPT-4 response text
    """
    api_key = get_api_key()

    if system_prompt is None:
        system_prompt = SYSTEM_PROMPTS["gpt"]

    client = OpenAI(api_key=api_key, timeout=API_TIMEOUT)

    try:
        response = client.chat.completions.create(
            model=MODELS["gpt"],
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=MAX_TOKENS["gpt"],
            temperature=0.7
        )

        return response.choices[0].message.content

    except Exception as e:
        error_type = type(e).__name__
        return f"ERROR [{error_type}]: {str(e)}"


def main():
    parser = argparse.ArgumentParser(
        description="Send a prompt to GPT-4 from Claude",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python claude_to_gpt.py "Test the game and report any bugs"
    python claude_to_gpt.py --file prompt.txt
    python claude_to_gpt.py "Review this code" --system "You are a code reviewer"
        """
    )

    parser.add_argument(
        "prompt",
        nargs="?",
        help="The prompt to send to GPT-4"
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

    # Send to GPT
    if not args.raw:
        print("=" * 60)
        print(f"SENDING TO GPT-4 ({MODELS['gpt']})")
        print("=" * 60)
        print(f"PROMPT:\n{prompt[:200]}{'...' if len(prompt) > 200 else ''}")
        print("-" * 60)
        print("RESPONSE:")
        print("-" * 60)

    response = send_to_gpt(prompt, args.system)
    print(response)

    if not args.raw:
        print("=" * 60)


if __name__ == "__main__":
    main()
