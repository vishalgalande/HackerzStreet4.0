"""
Pre-built demo personas for hackathon presentation.
Each persona represents a credit-invisible individual with realistic data.
"""

from models import (
    UserInput,
    PersonaSummary,
    PersonaDetail,
    BillPaymentBehavior,
    EmploymentType,
    RentHistory,
)


PERSONAS = {
    "ravi": PersonaDetail(
        id="ravi",
        name="Ravi Kumar",
        title="Delivery Partner",
        description="Zomato rider, ₹22k/month irregular income, consistent UPI usage, no formal bank account. Demonstrates the gig worker profile.",
        expected_score=540,
        avatar_emoji="🛵",
        data=UserInput(
            monthly_income=22000,
            monthly_expenses=18000,
            rent=6000,
            food=5000,
            transport=4000,
            discretionary=3000,
            savings_amount=2000,
            bill_payment=BillPaymentBehavior.SOMETIMES_LATE,
            employment_type=EmploymentType.GIG,
            existing_debt=0,
            rent_history=RentHistory.CONSISTENT,
            telecom_regularity=True,
        ),
    ),
    "priya": PersonaDetail(
        id="priya",
        name="Priya Sharma",
        title="College Student",
        description="Final year student, part-time tutor income ₹8k/month, zero credit history, high savings discipline. Shows the first-time borrower profile.",
        expected_score=480,
        avatar_emoji="📚",
        data=UserInput(
            monthly_income=8000,
            monthly_expenses=6000,
            rent=0,
            food=3000,
            transport=1500,
            discretionary=1500,
            savings_amount=1800,
            bill_payment=BillPaymentBehavior.ALWAYS_ON_TIME,
            employment_type=EmploymentType.FREELANCE,
            existing_debt=0,
            rent_history=RentHistory.CONSISTENT,
            telecom_regularity=True,
        ),
    ),
    "mohan": PersonaDetail(
        id="mohan",
        name="Mohan Patel",
        title="Kirana Shop Owner",
        description="Small shop, ₹35k/month cash income, always pays utility bills on time, one small existing loan. Represents the informal business owner.",
        expected_score=620,
        avatar_emoji="🏪",
        data=UserInput(
            monthly_income=35000,
            monthly_expenses=22000,
            rent=5000,
            food=6000,
            transport=2000,
            discretionary=4000,
            savings_amount=7000,
            bill_payment=BillPaymentBehavior.ALWAYS_ON_TIME,
            employment_type=EmploymentType.SELF_EMPLOYED,
            existing_debt=3000,
            rent_history=RentHistory.CONSISTENT,
            telecom_regularity=True,
        ),
    ),
}


def get_personas_list() -> list[PersonaSummary]:
    """Return summary list of all demo personas."""
    return [
        PersonaSummary(
            id=p.id,
            name=p.name,
            title=p.title,
            description=p.description,
            expected_score=p.expected_score,
            avatar_emoji=p.avatar_emoji,
        )
        for p in PERSONAS.values()
    ]


def get_persona_by_id(persona_id: str) -> PersonaDetail | None:
    """Return full persona detail by ID."""
    return PERSONAS.get(persona_id)
