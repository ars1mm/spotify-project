"""
Codebase Q&A Service
Provides question and answer functionality about the codebase.
"""
import os
import json
from typing import Dict, List, Optional
from pathlib import Path


class CodebaseQAService:
    """Service for Q&A about the codebase."""
    
    def __init__(self, base_path: str = None):
        """
        Initialize the Q&A service.
        
        Args:
            base_path: Root directory of the project
        """
        if base_path is None:
            current_dir = Path(__file__).resolve().parent
            self.base_path = current_dir.parent.parent.parent.parent
        else:
            self.base_path = Path(base_path)
        
        # Load Q&A data from documentation
        self.qa_data = self._load_qa_data()
    
    def _load_qa_data(self) -> Dict:
        """Load Q&A data from documentation files."""
        qa_data = {
            "kategorite": [],
            "pyetje_pergjigje": [],
            "sherbimet": {}
        }
        
        # Load backend services documentation
        backend_docs_path = self.base_path / "backend" / "docs" / "backend_services_documentation.json"
        if backend_docs_path.exists():
            try:
                with open(backend_docs_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    qa_data["sherbimet"] = data.get("sherbimet", {})
                    qa_data["pyetje_pergjigje"] = data.get("pyetje_te_pergjithshme", [])
                    qa_data["endpoints_api"] = data.get("endpoints_api", {})
            except Exception:
                pass
        
        # Load from dokumentimi directory
        dokumentimi_path = self.base_path / "dokumentimi"
        if dokumentimi_path.exists():
            for category_dir in dokumentimi_path.iterdir():
                if category_dir.is_dir():
                    qa_data["kategorite"].append(category_dir.name)
        
        return qa_data
    
    def get_all_qa(self) -> Dict:
        """Get all Q&A organized by category."""
        result = {
            "kategorite": {
                "backend": {
                    "emri": "Backend",
                    "pershkrimi": "Pyetje rreth arkitekturës së backend-it dhe shërbimeve",
                    "pyetje": []
                },
                "frontend": {
                    "emri": "Frontend",
                    "pershkrimi": "Pyetje rreth implementimit të frontend-it",
                    "pyetje": []
                },
                "database": {
                    "emri": "Database",
                    "pershkrimi": "Pyetje rreth bazës së të dhënave dhe Supabase",
                    "pyetje": []
                },
                "api": {
                    "emri": "API",
                    "pershkrimi": "Pyetje rreth endpoint-eve të API-t",
                    "pyetje": []
                },
                "te_pergjithshme": {
                    "emri": "Të Përgjithshme",
                    "pershkrimi": "Pyetje të përgjithshme rreth projektit",
                    "pyetje": []
                }
            }
        }
        
        # Add general Q&A
        for qa in self.qa_data.get("pyetje_pergjigje", []):
            result["kategorite"]["te_pergjithshme"]["pyetje"].append(qa)
        
        # Add service-specific Q&A
        for service_key, service_data in self.qa_data.get("sherbimet", {}).items():
            service_qa = service_data.get("pyetje_pergjigje", [])
            for qa in service_qa:
                qa["sherbimi"] = service_data.get("emri", service_key)
                result["kategorite"]["backend"]["pyetje"].append(qa)
        
        # Add API endpoints as Q&A
        endpoints = self.qa_data.get("endpoints_api", {})
        for category, endpoint_list in endpoints.items():
            for endpoint in endpoint_list:
                result["kategorite"]["api"]["pyetje"].append({
                    "pyetje": f"Si funksionon {endpoint.get('rruga')}?",
                    "pergjigje": f"{endpoint.get('pershkrimi')}. Metoda: {endpoint.get('metoda')}"
                })
        
        return result
    
    def search_qa(self, query: str) -> Dict:
        """
        Search Q&A by query string.
        
        Args:
            query: Search query
            
        Returns:
            Matching Q&A items
        """
        query_lower = query.lower()
        results = []
        
        all_qa = self.get_all_qa()
        
        for category_key, category_data in all_qa["kategorite"].items():
            for qa in category_data["pyetje"]:
                question = qa.get("pyetje", "").lower()
                answer = qa.get("pergjigje", "").lower()
                
                if query_lower in question or query_lower in answer:
                    results.append({
                        "kategoria": category_data["emri"],
                        "pyetje": qa.get("pyetje"),
                        "pergjigje": qa.get("pergjigje"),
                        "sherbimi": qa.get("sherbimi")
                    })
        
        return {
            "query": query,
            "total_results": len(results),
            "results": results
        }
    
    def get_service_info(self, service_name: str) -> Dict:
        """
        Get detailed information about a specific service.
        
        Args:
            service_name: Name of the service (e.g., 'auth_service')
            
        Returns:
            Service details including Q&A
        """
        services = self.qa_data.get("sherbimet", {})
        
        if service_name in services:
            return {
                "found": True,
                "service": services[service_name]
            }
        
        # Try partial match
        for key, data in services.items():
            if service_name.lower() in key.lower() or service_name.lower() in data.get("emri", "").lower():
                return {
                    "found": True,
                    "service": data
                }
        
        return {
            "found": False,
            "error": f"Shërbimi '{service_name}' nuk u gjet",
            "available_services": list(services.keys())
        }
    
    def get_codebase_overview(self) -> Dict:
        """Get an overview of the codebase structure and components."""
        overview = {
            "projekt": "Spotify Clone",
            "teknologjite": {
                "frontend": {
                    "framework": "Next.js 14",
                    "language": "TypeScript",
                    "styling": "Tailwind CSS",
                    "state_management": "React Hooks"
                },
                "backend": {
                    "framework": "FastAPI",
                    "language": "Python 3.11+",
                    "rate_limiting": "SlowAPI"
                },
                "database": {
                    "system": "Supabase (PostgreSQL)",
                    "auth": "Supabase Auth",
                    "storage": "Supabase Storage"
                },
                "deployment": {
                    "container": "Docker",
                    "orchestration": "Kubernetes (planned)"
                }
            },
            "struktura": {
                "backend": {
                    "app/api": "API routes dhe endpoints",
                    "app/services": "Business logic services",
                    "app/core": "Configuration dhe utilities",
                    "app/schemas": "Pydantic models",
                    "app/middleware": "Custom middleware"
                },
                "frontend": {
                    "app/components": "React components",
                    "app/pages": "Next.js pages",
                    "app/hooks": "Custom React hooks",
                    "app/contexts": "React contexts"
                },
                "dokumentimi": "Dokumentimi i plotë i projektit"
            },
            "sherbimet_kryesore": [
                {
                    "emri": "Authentication Service",
                    "pershkrimi": "Menaxhon regjistrimin, hyrjen, dhe rivendosjen e fjalëkalimit"
                },
                {
                    "emri": "Song Service",
                    "pershkrimi": "Menaxhon këngët, kërkimin, dhe paginimin"
                },
                {
                    "emri": "Playlist Service",
                    "pershkrimi": "Menaxhon playlist-et e përdoruesve"
                },
                {
                    "emri": "Like Service",
                    "pershkrimi": "Menaxhon pëlqimet e këngëve"
                },
                {
                    "emri": "Trending Service",
                    "pershkrimi": "Llogarit trendet dhe këngët popullore"
                }
            ]
        }
        
        return overview
