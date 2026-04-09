import os
import httpx
from .prompts import EXPLAIN_SYSTEM_PROMPT


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def stream_explanation(yaml_content: str, model: str = "google/gemini-2.0-flash-001"):
    """Stream an AI explanation of the K8s YAML via OpenRouter."""
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key or api_key == "your_key_here":
        yield 'data: {"choices":[{"delta":{"content":"⚠️ OpenRouter API key not configured. Set OPENROUTER_API_KEY in backend/.env to enable AI explanations."}}]}\n\n'
        yield "data: [DONE]\n\n"
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "KubeVista",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": EXPLAIN_SYSTEM_PROMPT},
            {"role": "user", "content": f"Explain this Kubernetes configuration:\n\n```yaml\n{yaml_content}\n```"},
        ],
        "stream": True,
        "max_tokens": 2000,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream("POST", OPENROUTER_URL, json=payload, headers=headers) as response:
            if response.status_code != 200:
                error_body = await response.aread()
                yield f'data: {{"choices":[{{"delta":{{"content":"Error from AI: {response.status_code}"}}}}]}}\n\n'
                yield "data: [DONE]\n\n"
                return

            async for line in response.aiter_lines():
                if line.strip():
                    yield f"{line}\n\n"
