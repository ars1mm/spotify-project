"""
Main API Router
Combines all route modules following single responsibility principle
"""
from fastapi import APIRouter
from app.api.routes.public import (
    auth_routes,
    song_routes,
    playlist_routes,
    trending_routes,
    external_routes,
    documentation_routes
)
from app.api import codebase

router = APIRouter()

# Include all public route modules
router.include_router(auth_routes.router)
router.include_router(song_routes.router)
router.include_router(playlist_routes.router)
router.include_router(trending_routes.router)
router.include_router(external_routes.router)
router.include_router(documentation_routes.router)
router.include_router(codebase.router)
