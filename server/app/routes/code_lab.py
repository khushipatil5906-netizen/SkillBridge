from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.data.aptitude_data import CODING_CHALLENGES
from app.ml.code_auditor import code_auditor

router = APIRouter(prefix="/api/code-lab", tags=["In-Browser Code Lab & AST Auditor"])

class RunCodeRequest(BaseModel):
    challenge_id: str
    source_code: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = "python"

    def get_code(self) -> str:
        return self.source_code or self.code or ""

class AuditASTRequest(BaseModel):
    source_code: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = "python"

    def get_code(self) -> str:
        return self.source_code or self.code or ""

@router.get("/challenges")
def get_challenges():
    return {
        "total": len(CODING_CHALLENGES),
        "challenges": CODING_CHALLENGES
    }

@router.post("/run")
def run_code_challenge(req: RunCodeRequest):
    code_text = req.get_code()
    challenge = next((c for c in CODING_CHALLENGES if c["id"] == req.challenge_id), CODING_CHALLENGES[0])
    execution_result = code_auditor.execute_challenge(
        challenge_id=req.challenge_id,
        source_code=code_text,
        test_cases=challenge["test_cases"]
    )
    return {
        "challenge_id": req.challenge_id,
        "title": challenge["title"],
        "passed": execution_result.get("all_passed", True),
        "ast_audit": execution_result.get("ast_report", {}),
        **execution_result
    }

@router.post("/audit-ast")
def audit_custom_ast(req: AuditASTRequest):
    code_text = req.get_code()
    return code_auditor.audit_code(code_text, req.language or "python")

