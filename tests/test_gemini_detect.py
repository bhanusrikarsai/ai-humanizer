import os
import json
from google import genai

key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=key)

human_text = "Alice Chen really stood out during the technical assessment on October 14, 2023. She scored 94% in Python and knocked out 4 out of 4 system design challenges. Plus, she effectively leveraged Kubernetes and PostgreSQL. Bottom line: we should proceed with an offer of $185,000."

prompt = f"""Evaluate this humanized text for AI vs Human authorship:
"{human_text}"

Return JSON with keys: ai_probability (0-100), human_probability (0-100), verdict, reasoning, flagged_cliches (list of strings).
"""

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=prompt,
    config={"response_mime_type": "application/json", "temperature": 0.1}
)

print("Gemini evaluation of humanized text:\n", response.text)
