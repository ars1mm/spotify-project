"""
Main Admin Router
Combines all admin route modules following single responsibility principle
"""
from fastapi import APIRouter
from app.api.routes.admin import (
    auth_routes,
    song_routes,
    analytics_routes,
    trending_routes,
    maintenance_routes
)

# Public admin routes (no authentication required)
public_router = APIRouter(prefix="/admin")
public_router.include_router(auth_routes.router)

# Protected admin routes (authentication required)
router = APIRouter(prefix="/admin")
router.include_router(song_routes.router)
router.include_router(analytics_routes.router)
router.include_router(trending_routes.router)
router.include_router(maintenance_routes.router)
