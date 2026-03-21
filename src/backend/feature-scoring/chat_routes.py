"""
AI Chat — Gemini-powered financial advisor chatbot.

POST /api/chat
  Accepts user message + profile/score context → returns AI response.

The chatbot is a financial advisor that:
  - Explains credit score factors in plain language
  - Gives personalized tips to improve score
  - Answers general finance questions
  - Speaks in both English and Hindi
"""

import os
import httpx
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, Request
from pydantic import BaseModel

# Load env
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

router = APIRouter(prefix="/api")


# ── System prompt ──

SYSTEM_PROMPT = """You are **CreditMitra**, an AI financial advisor built into the HackerzStreet Alternative Credit Risk Assessment Tool. You help credit-invisible individuals in India understand and improve their credit scores.

Your capabilities:
1. **Score Explainer** — Explain what each credit factor means and how it affects the score
2. **Financial Advisor** — Give actionable, personalized tips to improve the user's credit score
3. **General Finance Q&A** — Answer questions about savings, loans, EMIs, budgeting, insurance, etc.

Rules:
- Be warm, encouraging, and non-judgmental. Many users are first-time borrowers.
- Keep responses concise (2-4 paragraphs max). Use bullet points for lists.
- Use ₹ (rupees) for currency. Reference Indian financial products (UPI, SIP, RD, FD, NBFC, etc.)
- If the user writes in Hindi, respond in Hindi. Otherwise respond in English.
- When you have the user's profile/score context, reference their specific numbers.
- Never give legally binding advice. Add "This is general guidance, not legal or financial advice." when appropriate.
- Use emojis sparingly but warmly (✅, 💡, 📊, etc.)

The credit score model uses 5 factors:
1. Payment Consistency (30% weight) — bill payment history
2. Savings Discipline (25% weight) — savings as % of income
3. Income Stability (20% weight) — employment type and regularity
4. Spending Discipline (15% weight) — discretionary spending ratio
5. Debt-to-Income Ratio (10% weight) — existing EMIs vs income

Score ranges: 300-499 = Poor, 500-599 = Fair, 600-699 = Good, 700-799 = Very Good, 800-900 = Excellent
"""


# ── Request/Response models ──

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    # User context (optional — sent from frontend)
    profile: dict | None = None
    score_result: dict | None = None
    language: str = "en"


class ChatResponse(BaseModel):
    reply: str
    error: str | None = None


def _build_context(req: ChatRequest) -> str:
    """Build context string from user's profile and score data."""
    parts = []

    if req.profile:
        p = req.profile
        parts.append(f"""USER PROFILE:
- Monthly Income: ₹{p.get('monthly_income', 'unknown')}
- Employment: {p.get('employment_type', 'unknown')}
- Existing EMI/Debt: ₹{p.get('existing_debt', 0)}/month
- Bill Payment History: {p.get('bill_payment', 'unknown')}
- Rent History: {p.get('rent_history', 'unknown')}
- Loans: {p.get('loans', [])}""")

    if req.score_result:
        s = req.score_result
        parts.append(f"""CURRENT SCORE:
- Score: {s.get('score', 'not computed')} / 900
- Band: {s.get('band', 'unknown')}
- Default Probability: {s.get('risk_assessment', {}).get('default_probability', 'unknown')}%
- Risk Category: {s.get('risk_assessment', {}).get('risk_category', {}).get('category', 'unknown')}""")

        if s.get('factors'):
            factors_str = "\n".join([
                f"  - {f.get('label', f.get('factor', ''))}: {'+' if f.get('is_positive') else ''}{f.get('points', 0)} pts"
                for f in s.get('factors', [])
            ])
            parts.append(f"SCORE FACTORS:\n{factors_str}")

    if req.language == "hi":
        parts.append("NOTE: User prefers Hindi. Respond in Hindi.")

    return "\n\n".join(parts)


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Send a message to the AI financial advisor."""
    if not GEMINI_API_KEY:
        return ChatResponse(reply="AI chat is not configured. Please set GEMINI_API_KEY in backend .env", error="no_api_key")

    # Build conversation
    context = _build_context(req)

    # Build Gemini API request
    contents = []

    # System instruction as first user turn (Gemini doesn't have a system role in v1beta)
    system_text = SYSTEM_PROMPT
    if context:
        system_text += f"\n\n--- CURRENT USER CONTEXT ---\n{context}"

    # Add message history
    for msg in req.history[-10:]:  # Last 10 messages for context window
        contents.append({
            "role": "user" if msg.role == "user" else "model",
            "parts": [{"text": msg.content}]
        })

    # Add current user message
    contents.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    payload = {
        "system_instruction": {
            "parts": [{"text": system_text}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800,
            "topP": 0.9,
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json=payload,
                timeout=30,
            )

            if response.status_code != 200:
                error_text = response.text[:200]
                print(f"Gemini API error: {response.status_code} {error_text}")
                return ChatResponse(
                    reply="I'm having trouble connecting right now. Please try again in a moment.",
                    error=f"gemini_{response.status_code}"
                )

            data = response.json()
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return ChatResponse(reply=reply)

    except httpx.TimeoutException:
        return ChatResponse(reply="Request timed out. Please try again.", error="timeout")
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(reply="Something went wrong. Please try again.", error=str(e))
