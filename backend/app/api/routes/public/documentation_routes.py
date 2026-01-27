"""
Documentation Routes
Handles documentation endpoints: API docs, examples, troubleshooting
"""
from fastapi import APIRouter
from fastapi.responses import FileResponse
import os

router = APIRouter(prefix="/dokumentimi", tags=["documentation"])


@router.get("/")
def get_api_documentation():
    """
    Shërben dokumentacionin kryesor të API-t në shqip
    """
    docs_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 
        "docs", 
        "api_documentation.html"
    )
    return FileResponse(docs_path, media_type="text/html")


@router.get("/shembuj")
def get_code_examples():
    """
    Shërben shembuj të detajuar kodi
    """
    docs_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 
        "docs", 
        "code_examples.html"
    )
    return FileResponse(docs_path, media_type="text/html")


@router.get("/troubleshooting")
def get_troubleshooting_guide():
    """
    Shërben guidin e troubleshooting
    """
    docs_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 
        "docs", 
        "troubleshooting.html"
    )
    return FileResponse(docs_path, media_type="text/html")


@router.get("/sherbimet")
def get_backend_services_documentation():
    """
    Shërben dokumentimin e shërbimeve të backend-it në format JSON
    - Përshkrime të hollësishme për çdo shërbim
    - Pyetje dhe përgjigje (Q&A) për çdo shërbim
    - Lista e të gjitha endpoint-eve API
    """
    docs_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 
        "docs", 
        "backend_services_documentation.json"
    )
    return FileResponse(docs_path, media_type="application/json")