"""
Codebase Q&A Service
Provides question and answer functionality about the codebase.
Covers both backend and frontend documentation.
"""
import os
import json
from typing import Dict, List, Optional
from pathlib import Path


class CodebaseQAService:
    """Service for Q&A about the codebase including frontend and backend."""
    
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
            "sherbimet": {},
            "frontend": {}
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
        
        # Load frontend documentation from markdown files
        frontend_docs_path = self.base_path / "dokumentimi" / "frontend"
        if frontend_docs_path.exists():
            qa_data["frontend"] = self._load_frontend_docs(frontend_docs_path)
        
        return qa_data
    
    def _load_frontend_docs(self, docs_path: Path) -> Dict:
        """Load frontend documentation from markdown files."""
        frontend_data = {
            "komponente": [],
            "kontekste": [],
            "hooks": [],
            "pyetje_pergjigje": []
        }
        
        # Parse markdown files for Q&A content
        md_files = list(docs_path.glob("*.md"))
        for md_file in md_files:
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Extract title
                lines = content.split('\n')
                title = ""
                for line in lines:
                    if line.startswith('# '):
                        title = line[2:].strip()
                        break
                
                # Create Q&A from sections
                if "komponent" in md_file.name.lower():
                    frontend_data["komponente"].append({
                        "skedari": md_file.name,
                        "titulli": title,
                        "permbajtja": content
                    })
                    # Generate Q&A from content
                    frontend_data["pyetje_pergjigje"].extend(
                        self._extract_qa_from_content(content, "Frontend Components")
                    )
                elif "gjendje" in md_file.name.lower() or "state" in md_file.name.lower():
                    frontend_data["kontekste"].append({
                        "skedari": md_file.name,
                        "titulli": title,
                        "permbajtja": content
                    })
                    frontend_data["pyetje_pergjigje"].extend(
                        self._extract_qa_from_content(content, "State Management")
                    )
            except Exception:
                pass
        
        return frontend_data
    
    def _extract_qa_from_content(self, content: str, category: str) -> List[Dict]:
        """Extract Q&A pairs from markdown content."""
        qa_pairs = []
        lines = content.split('\n')
        current_section = ""
        current_content = []
        
        for line in lines:
            if line.startswith('## '):
                if current_section and current_content:
                    qa_pairs.append({
                        "pyetje": f"Çfarë është {current_section}?",
                        "pergjigje": ' '.join(current_content[:3]),  # First 3 lines as answer
                        "kategoria": category
                    })
                current_section = line[3:].strip()
                current_content = []
            elif line.startswith('### '):
                subsection = line[4:].strip()
                if current_content:
                    qa_pairs.append({
                        "pyetje": f"Si funksionon {subsection}?",
                        "pergjigje": ' '.join(current_content[:2]),
                        "kategoria": category
                    })
                current_content = []
            elif line.strip() and not line.startswith('#'):
                current_content.append(line.strip())
        
        return qa_pairs
    
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
                    "pershkrimi": "Pyetje rreth implementimit të frontend-it dhe komponentëve React",
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
        
        # Add comprehensive general Q&A
        general_qa = [
            {
                "pyetje": "Çfarë është ky projekt?",
                "pergjigje": "Ky është një klon i Spotify-t i ndërtuar me Next.js në frontend dhe FastAPI në backend. Përdor Supabase për bazën e të dhënave dhe autentifikimin. Synon të demonstrojë arkitekturë moderne të web aplikacioneve."
            },
            {
                "pyetje": "Cilat janë teknologjitë kryesore?",
                "pergjigje": "Frontend: Next.js 14, TypeScript, Tailwind CSS, React Context API. Backend: FastAPI, Python 3.11+, Pydantic. Database: Supabase (PostgreSQL). Auth: Supabase Auth. Storage: Supabase Storage."
            },
            {
                "pyetje": "Si instalohet projekti?",
                "pergjigje": "1. Klono repository-n, 2. Instalo dependencies (npm install në frontend, pip install në backend), 3. Konfiguro .env files, 4. Nise backend-in (uvicorn main:app --reload), 5. Nise frontend-in (npm run dev)."
            },
            {
                "pyetje": "Çfarë features ka aplikacioni?",
                "pergjigje": "Autentifikim (register/login), Luajtje muzike, Krijim playlist-esh, Kërkim këngësh, Like/unlike këngë, Profil përdoruesi, Trending songs, Upload këngësh, Responsive design."
            },
            {
                "pyetje": "Si funksionon arkitektura e projektit?",
                "pergjigje": "Arkitekturë e ndarë: Frontend (Next.js) komunikon me Backend (FastAPI) përmes REST API. Backend komunikon me Supabase për të dhëna dhe autentifikim. Supabase Storage për file hosting."
            },
            {
                "pyetje": "Si deployohet aplikacioni?",
                "pergjigje": "Frontend deployet në Vercel/Netlify, Backend në Railway/Heroku/DigitalOcean. Supabase si managed service. Docker containers për consistency. CI/CD me GitHub Actions."
            },
            {
                "pyetje": "Çfarë është struktura e projektit?",
                "pergjigje": "spotify-project/ përmban frontend/ (Next.js app), backend/ (FastAPI app), docs/ (dokumentimi), README.md. Çdo pjesë ka strukturën e vet modulare."
            },
            {
                "pyetje": "Si kontribuohet në projekt?",
                "pergjigje": "1. Fork projektin, 2. Krijo branch të ri, 3. Bëj ndryshimet, 4. Testo ndryshimet, 5. Commit me mesazh të qartë, 6. Push në branch, 7. Krijo Pull Request."
            },
            {
                "pyetje": "Çfarë licencë ka projekti?",
                "pergjigje": "Projekti është i licensuar nën MIT License, që do të thotë se është open source dhe mund të përdoret, modifikohet dhe shpërndahet lirisht."
            },
            {
                "pyetje": "Si funksionon development workflow?",
                "pergjigje": "Git flow me main/develop branches. Feature branches për ndryshime të reja. Code review përmes Pull Requests. Automated testing dhe deployment."
            },
            {
                "pyetje": "Çfarë tools përdoren për development?",
                "pergjigje": "VS Code/IDE, Git për version control, Docker për containerization, Postman për API testing, Browser DevTools për debugging, GitHub për collaboration."
            },
            {
                "pyetje": "Si bëhet testing?",
                "pergjigje": "Frontend: Jest + React Testing Library për unit tests, Cypress për e2e tests. Backend: Pytest për unit/integration tests. Manual testing për UI/UX."
            },
            {
                "pyetje": "Si implementohet CI/CD?",
                "pergjigje": "GitHub Actions për automated workflows. Tests ekzekutohen në çdo PR. Automated deployment në staging/production. Code quality checks me linters."
            },
            {
                "pyetje": "Çfarë është performance optimization strategy?",
                "pergjigje": "Frontend: Code splitting, lazy loading, image optimization, caching. Backend: Database indexing, query optimization, caching me Redis. CDN për static assets."
            },
            {
                "pyetje": "Si menaxhohet security?",
                "pergjigje": "HTTPS only, JWT tokens për auth, Input validation, SQL injection prevention, Rate limiting, CORS configuration, Environment variables për secrets."
            },
            {
                "pyetje": "Çfarë është monitoring strategy?",
                "pergjigje": "Application logs, Error tracking me Sentry, Performance monitoring, Database monitoring, Uptime monitoring, User analytics me Google Analytics."
            },
            {
                "pyetje": "Si skallohet aplikacioni?",
                "pergjigje": "Horizontal scaling me load balancers, Database read replicas, CDN për static content, Caching layers, Microservices architecture (e planifikuar)."
            },
            {
                "pyetje": "Çfarë është backup strategy?",
                "pergjigje": "Automated database backups, Code backup në Git, Configuration backup, Regular backup testing, Disaster recovery procedures."
            },
            {
                "pyetje": "Si implementohet internationalization?",
                "pergjigje": "i18n libraries për translations, JSON files për çdo gjuhë, Language detection, RTL support për gjuhë arabe, Cultural adaptations."
            },
            {
                "pyetje": "Çfarë është mobile strategy?",
                "pergjigje": "Responsive web design, PWA capabilities, Mobile-first approach, Touch gestures, Offline functionality, App store deployment (e planifikuar)."
            },
            {
                "pyetje": "Si menaxhohen environment configurations?",
                "pergjigje": "Separate configs për dev/staging/prod, Environment variables për secrets, Docker compose për local development, Kubernetes për production."
            },
            {
                "pyetje": "Çfarë është code quality strategy?",
                "pergjigje": "ESLint/Prettier për JavaScript, Black/Flake8 për Python, Pre-commit hooks, Code review process, Automated quality checks në CI."
            },
            {
                "pyetje": "Si implementohet documentation?",
                "pergjigje": "README files, API documentation me Swagger, Code comments, Architecture diagrams, User guides, Developer onboarding docs."
            },
            {
                "pyetje": "Çfarë është error handling strategy?",
                "pergjigje": "Structured error responses, User-friendly error messages, Error logging, Retry mechanisms, Graceful degradation, Error boundaries në React."
            },
            {
                "pyetje": "Si funksionon user feedback system?",
                "pergjigje": "In-app feedback forms, Bug reporting, Feature requests, User surveys, Analytics për user behavior, Community forums."
            },
            {
                "pyetje": "Çfarë është roadmap i projektit?",
                "pergjigje": "V1: Basic functionality, V2: Social features, V3: Mobile app, V4: AI recommendations, V5: Live streaming, V6: Monetization features."
            },
            {
                "pyetje": "Si implementohet A/B testing?",
                "pergjigje": "Feature flags për gradual rollout, User segmentation, Metrics collection, Statistical analysis, Automated decision making."
            },
            {
                "pyetje": "Çfarë është compliance strategy?",
                "pergjigje": "GDPR compliance për EU users, CCPA për California, Data retention policies, Privacy by design, Regular compliance audits."
            },
            {
                "pyetje": "Si menaxhohen third-party integrations?",
                "pergjigje": "API wrappers, Rate limiting, Error handling, Fallback mechanisms, Monitoring, Documentation për çdo integration."
            },
            {
                "pyetje": "Çfarë është disaster recovery plan?",
                "pergjigje": "Regular backups, Multi-region deployment, Failover procedures, Recovery time objectives, Business continuity planning."
            }
        ]
        for qa in general_qa:
            result["kategorite"]["te_pergjithshme"]["pyetje"].append(qa)
        
        # Add service-specific Q&A (Backend)
        for service_key, service_data in self.qa_data.get("sherbimet", {}).items():
            service_qa = service_data.get("pyetje_pergjigje", [])
            for qa in service_qa:
                qa["sherbimi"] = service_data.get("emri", service_key)
                result["kategorite"]["backend"]["pyetje"].append(qa)
        
        # Add comprehensive backend Q&A
        backend_qa = [
            {
                "pyetje": "Si është strukturuar backend-i?",
                "pergjigje": "Backend-i përdor FastAPI me arkitekturë modulare. app/api/ përmban routes, app/services/ përmban business logic, app/core/ përmban konfigurimin, app/schemas/ përmban Pydantic models."
            },
            {
                "pyetje": "Si funksionon Authentication Service?",
                "pergjigje": "AuthService menaxhon regjistrimin, login-in dhe reset password. Përdor Supabase Auth për autentifikim dhe JWT tokens për session management. Implementon rate limiting për siguri."
            },
            {
                "pyetje": "Si implementohet rate limiting?",
                "pergjigje": "Përdoret SlowAPI middleware që kufizon requests për IP. Login ka 5 tentativa/minutë, registration 3/minutë, password reset 2/minutë. Bllokon IP-të për 15 minuta pas tejkalimit."
            },
            {
                "pyetje": "Si funksionon Song Service?",
                "pergjigje": "SongService menaxhon CRUD operacionet për këngët. Implementon search me full-text search, pagination, filtering, dhe trending calculation. Integrohet me Supabase Storage për audio files."
            },
            {
                "pyetje": "Si implementohet search functionality në backend?",
                "pergjigje": "Përdor PostgreSQL full-text search me tsvector dhe tsquery. Kërkon në title, artist, album. Implementon fuzzy search dhe ranking. Rezultatet paginohen dhe cache-ohen."
            },
            {
                "pyetje": "Si funksionon Playlist Service?",
                "pergjigje": "PlaylistService menaxhon playlist-et e përdoruesve. Implementon CRUD operations, sharing permissions, collaborative playlists. Kontrollon ownership dhe privacy settings."
            },
            {
                "pyetje": "Si implementohet file upload për audio?",
                "pergjigje": "Përdor Supabase Storage. Validon file format (MP3, WAV), madhësinë (<50MB), dhe metadata. Gjeneron unique filenames dhe thumbnails. Implementon progress tracking."
            },
            {
                "pyetje": "Si funksionon Like Service?",
                "pergjigje": "LikeService menaxhon pëlqimet e këngëve. Implementon toggle functionality, counting, dhe user's liked songs list. Optimizon me database indexes dhe caching."
            },
            {
                "pyetje": "Si llogariten trending songs?",
                "pergjigje": "TrendingService llogarit popularitetin bazuar në plays, likes, shares, dhe recency. Përdor weighted algorithm që favoron aktivitetin e fundit. Përditësohet çdo orë."
            },
            {
                "pyetje": "Si implementohet caching në backend?",
                "pergjigje": "Përdor Redis për caching. Cache-on trending songs (1 orë), search results (30 min), user sessions (24 orë). Implementon cache invalidation strategies."
            },
            {
                "pyetje": "Si funksionon error handling?",
                "pergjigje": "Përdor FastAPI exception handlers. Custom exceptions për business logic errors. Structured logging me correlation IDs. Error responses me consistent format."
            },
            {
                "pyetje": "Si implementohet logging?",
                "pergjigje": "Structured logging me JSON format. Log levels: DEBUG, INFO, WARNING, ERROR. Correlation IDs për request tracking. Log rotation dhe centralized collection."
            },
            {
                "pyetje": "Si funksionon middleware stack?",
                "pergjigje": "CORS middleware për cross-origin requests, Rate limiting middleware, Authentication middleware për protected routes, Logging middleware për request tracking."
            },
            {
                "pyetje": "Si implementohet API versioning?",
                "pergjigje": "URL-based versioning (/api/v1/). Backward compatibility për old versions. Deprecation notices në headers. Migration guides për breaking changes."
            },
            {
                "pyetje": "Si funksionon database connection pooling?",
                "pergjigje": "Përdor connection pooling për PostgreSQL. Pool size 10-20 connections. Connection timeout 30s. Health checks për dead connections."
            },
            {
                "pyetje": "Si implementohet background tasks?",
                "pergjigje": "FastAPI BackgroundTasks për lightweight tasks. Celery për heavy tasks. Task queues për email sending, file processing, analytics calculation."
            },
            {
                "pyetje": "Si funksionon API documentation?",
                "pergjigje": "Auto-generated me FastAPI dhe Pydantic. Swagger UI në /docs, ReDoc në /redoc. Schema validation dhe examples për çdo endpoint."
            },
            {
                "pyetje": "Si implementohet testing në backend?",
                "pergjigje": "Pytest për unit tests, TestClient për integration tests. Mock-ohen external services. Test database për isolation. Coverage reports."
            },
            {
                "pyetje": "Si funksionon deployment?",
                "pergjigje": "Docker containers për consistency. Docker Compose për development. Kubernetes për production. CI/CD pipeline me GitHub Actions."
            },
            {
                "pyetje": "Si implementohet monitoring?",
                "pergjigje": "Health check endpoints, Prometheus metrics, Grafana dashboards. Application performance monitoring. Error tracking me Sentry."
            },
            {
                "pyetje": "Si funksionon security?",
                "pergjigje": "JWT tokens për authentication, HTTPS only, Input validation me Pydantic, SQL injection prevention, Rate limiting, CORS configuration."
            },
            {
                "pyetje": "Si implementohet pagination?",
                "pergjigje": "Cursor-based pagination për performance. Limit/offset për simplicity. Metadata në response (total, has_next, has_prev). Configurable page sizes."
            },
            {
                "pyetje": "Si funksionon email service?",
                "pergjigje": "SMTP integration për email sending. Template engine për HTML emails. Queue për bulk emails. Bounce handling dhe unsubscribe links."
            },
            {
                "pyetje": "Si implementohet WebSocket support?",
                "pergjigje": "FastAPI WebSocket për real-time features. Connection management, Broadcasting për live updates, Authentication për WebSocket connections."
            },
            {
                "pyetje": "Si funksionon configuration management?",
                "pergjigje": "Environment variables për secrets. Pydantic Settings për validation. Different configs për dev/staging/prod. Secret management me external services."
            },
            {
                "pyetje": "Si implementohet data validation?",
                "pergjigje": "Pydantic models për request/response validation. Custom validators për business rules. Error messages në shqip. Type hints për IDE support."
            },
            {
                "pyetje": "Si funksionon async programming?",
                "pergjigje": "Async/await për I/O operations. AsyncIO për concurrent requests. Async database drivers. Non-blocking file operations."
            },
            {
                "pyetje": "Si implementohet API rate limiting?",
                "pergjigje": "Token bucket algorithm. Per-user dhe per-IP limits. Different limits për different endpoints. Redis për distributed rate limiting."
            },
            {
                "pyetje": "Si funksionon health monitoring?",
                "pergjigje": "Health check endpoints për database, Redis, external services. Readiness dhe liveness probes për Kubernetes. Automated alerts për failures."
            },
            {
                "pyetje": "Si implementohet data migration?",
                "pergjigje": "Database migration scripts. Version control për schema changes. Rollback strategies. Data seeding për development."
            }
        ]
        for qa in backend_qa:
            result["kategorite"]["backend"]["pyetje"].append(qa)
        
        # Add comprehensive database Q&A
        database_qa = [
            {
                "pyetje": "Cilat janë tabelat kryesore në bazën e të dhënave?",
                "pergjigje": "Tabelat kryesore janë: users (përdoruesit), songs (këngët), playlists (playlist-et), playlist_songs (lidhja), likes (pëlqimet), plays (luajtjet). Çdo tabelë ka primary key dhe foreign keys për relacione."
            },
            {
                "pyetje": "Si është strukturuar tabela 'users'?",
                "pergjigje": "Tabela users përmban: id (UUID), email (unique), username, full_name, avatar_url, created_at, updated_at. Integrohet me Supabase Auth për autentifikim."
            },
            {
                "pyetje": "Si është strukturuar tabela 'songs'?",
                "pergjigje": "Tabela songs përmban: id (UUID), title, artist, album, duration_seconds, file_url, cover_image_url, created_by (FK), created_at, updated_at. Indexes në title dhe artist për search."
            },
            {
                "pyetje": "Si funksionojnë relacionet në bazën e të dhënave?",
                "pergjigje": "One-to-many: users -> songs, users -> playlists. Many-to-many: playlists <-> songs (nëpërmjet playlist_songs). One-to-many: users -> likes, users -> plays."
            },
            {
                "pyetje": "Si implementohen indexes për performance?",
                "pergjigje": "B-tree indexes në foreign keys, Composite indexes për queries të shpeshta, Full-text search indexes për title/artist, Unique indexes për email/username."
            },
            {
                "pyetje": "Si funksionon full-text search?",
                "pergjigje": "Përdor PostgreSQL tsvector dhe tsquery. Search vector krijohet nga title + artist + album. GIN index për performance. Ranking me ts_rank function."
            },
            {
                "pyetje": "Si implementohet soft delete?",
                "pergjigje": "Kolona 'deleted_at' në tabela kryesore. NULL = aktiv, timestamp = i fshirë. Queries filtrojnë automatikisht records e fshira. Cleanup job për hard delete."
            },
            {
                "pyetje": "Si funksionon auditing?",
                "pergjigje": "Kolona created_at, updated_at, created_by, updated_by në çdo tabelë. Triggers për automatic timestamping. Audit log table për ndryshime kritike."
            },
            {
                "pyetje": "Si implementohen constraints?",
                "pergjigje": "Primary keys (UUID), Foreign keys me CASCADE/RESTRICT, Unique constraints për email/username, Check constraints për validation, NOT NULL për kolona të detyrueshme."
            },
            {
                "pyetje": "Si funksionon connection pooling?",
                "pergjigje": "Supabase përdor PgBouncer për connection pooling. Pool size 15-25 connections. Session pooling për compatibility. Connection timeout 30 sekonda."
            },
            {
                "pyetje": "Si implementohen migrations?",
                "pergjigje": "SQL migration files me version control. Up/down scripts për rollback. Schema versioning në metadata table. Automated deployment me CI/CD."
            },
            {
                "pyetje": "Si funksionon backup strategy?",
                "pergjigje": "Daily automated backups me Supabase. Point-in-time recovery deri në 7 ditë. Cross-region replication për disaster recovery. Backup testing i rregullt."
            },
            {
                "pyetje": "Si implementohet Row Level Security (RLS)?",
                "pergjigje": "RLS policies për çdo tabelë. Users mund të lexojnë vetëm të dhënat e tyre. Public data (songs) i aksesueshme për të gjithë. Admin bypass për maintenance."
            },
            {
                "pyetje": "Si funksionon query optimization?",
                "pergjigje": "EXPLAIN ANALYZE për query planning. Index optimization bazuar në usage patterns. Query rewriting për performance. Connection pooling për concurrency."
            },
            {
                "pyetje": "Si implementohet data seeding?",
                "pergjigje": "SQL scripts për sample data. Faker library për realistic test data. Environment-specific seeds (dev/staging/prod). Idempotent scripts për re-running."
            },
            {
                "pyetje": "Si funksionon monitoring?",
                "pergjigje": "Supabase Dashboard për metrics. Query performance monitoring. Connection count tracking. Slow query identification dhe optimization."
            },
            {
                "pyetje": "Si implementohen stored procedures?",
                "pergjigje": "PL/pgSQL functions për business logic komplekse. Trigger functions për automatic updates. Security definer për elevated permissions. Version control për functions."
            },
            {
                "pyetje": "Si funksionon data validation?",
                "pergjigje": "Database constraints për data integrity. Check constraints për business rules. Triggers për complex validation. Application-level validation me Pydantic."
            },
            {
                "pyetje": "Si implementohet partitioning?",
                "pergjigje": "Table partitioning për tabela të mëdha (plays, analytics). Range partitioning për data historike. Automatic partition management. Query optimization për partitioned tables."
            },
            {
                "pyetje": "Si funksionon replication?",
                "pergjigje": "Master-slave replication me Supabase. Read replicas për scaling reads. Automatic failover në rast të problemeve. Cross-region replication për DR."
            },
            {
                "pyetje": "Si implementohen views?",
                "pergjigje": "Materialized views për aggregated data (trending, statistics). Regular views për complex joins. Automatic refresh për materialized views. Security views për data access."
            },
            {
                "pyetje": "Si funksionon transaction management?",
                "pergjigje": "ACID transactions për data consistency. Isolation levels për concurrency control. Deadlock detection dhe resolution. Long-running transaction monitoring."
            },
            {
                "pyetje": "Si implementohet caching strategy?",
                "pergjigje": "Redis për query result caching. Application-level caching për hot data. Cache invalidation strategies. TTL për automatic expiration."
            },
            {
                "pyetje": "Si funksionon data archiving?",
                "pergjigje": "Automatic archiving për old data. Cold storage për archived records. Data retention policies. Compliance me GDPR për data deletion."
            },
            {
                "pyetje": "Si implementohen triggers?",
                "pergjigje": "BEFORE/AFTER triggers për data validation. Audit triggers për change tracking. Notification triggers për real-time updates. Performance considerations për trigger logic."
            },
            {
                "pyetje": "Si funksionon data encryption?",
                "pergjigje": "Encryption at rest me Supabase. Column-level encryption për sensitive data. TLS për data in transit. Key management me external services."
            },
            {
                "pyetje": "Si implementohet data anonymization?",
                "pergjigje": "Data masking për development environments. Anonymization scripts për GDPR compliance. Synthetic data generation për testing. Privacy-preserving analytics."
            },
            {
                "pyetje": "Si funksionon database versioning?",
                "pergjigje": "Schema version tracking në metadata table. Migration scripts me sequential numbering. Rollback procedures për failed migrations. Environment synchronization."
            },
            {
                "pyetje": "Si implementohen custom data types?",
                "pergjigje": "ENUM types për status fields. JSON/JSONB për flexible schemas. Array types për lists. Custom domains për business-specific types."
            },
            {
                "pyetje": "Si funksionon performance tuning?",
                "pergjigje": "Query analysis me EXPLAIN. Index optimization. Connection pooling tuning. Memory configuration. Vacuum dhe analyze scheduling."
            }
        ]
        for qa in database_qa:
            result["kategorite"]["database"]["pyetje"].append(qa)
        
        # Add frontend Q&A
        frontend_data = self.qa_data.get("frontend", {})
        for qa in frontend_data.get("pyetje_pergjigje", []):
            result["kategorite"]["frontend"]["pyetje"].append(qa)
        
        # Add predefined frontend Q&A
        frontend_qa = [
            {
                "pyetje": "Cilat janë komponentët kryesorë të frontend-it?",
                "pergjigje": "Komponentët kryesorë janë: Sidebar (navigimi), Player (kontrollet e muzikës), SongCard/PlaylistCard (kartat vizuale), dhe SearchBar (kërkimi). Layout-i kryesor ndan ekranin në Sidebar (majtas), Main Content (qendër), dhe Player Bar (poshtë)."
            },
            {
                "pyetje": "Si menaxhohet gjendja (state) në frontend?",
                "pergjigje": "Përdoret React Context API. AuthContext menaxhon autentifikimin, PlayerContext menaxhon luajtjen e muzikës (currentSong, isPlaying, queue, volume). Gjendja lokale përdor useState, ndërsa useEffect sinkronizon me API."
            },
            {
                "pyetje": "Si funksionon PlayerContext?",
                "pergjigje": "PlayerContext është 'truri' i audio player-it. Përmban gjendjen (currentSong, isPlaying, queue, volume) dhe funksionet (playSong, togglePlay, nextSong, previousSong, addToQueue). Çdo ndryshim sinkronizohet me audio element-in."
            },
            {
                "pyetje": "Cilat teknologji përdor frontend-i?",
                "pergjigje": "Frontend-i përdor Next.js 14, TypeScript, Tailwind CSS për styling, dhe React Context API për state management. Përdoret edhe Chakra UI për disa komponente."
            },
            {
                "pyetje": "Si bëhet responsive design në frontend?",
                "pergjigje": "Ndiqet parimi 'Mobile First'. Sidebar fshihet ose bëhet hamburger menu në celular. Grid-et përshtaten nga 2 kolona (celular) në 6-7 kolona (desktop). Elementë jo-kritikë të Player-it fshihen në ekrane të vogla."
            },
            {
                "pyetje": "Si funksionon SearchBar?",
                "pergjigje": "SearchBar lejon kërkimin në kohë reale për këngë, artistë ose playlist-a. Përdor teknikën Debouncing për të evituar kërkesa të tepërta në API - pret disa milisekonda pas çdo shkronjë para se të dërgojë request."
            },
            {
                "pyetje": "Si komunikon frontend-i me backend-in?",
                "pergjigje": "Frontend-i bën fetch requests në API endpoints të backend-it të cilat gjenden në /api/v1/. Përdoren hooks custom për të menaxhuar loading states dhe error handling."
            },
            {
                "pyetje": "Ku ruhen kontekstet (contexts)?",
                "pergjigje": "Kontekstet ruhen në app/contexts/. AuthContext.tsx për autentifikim dhe PlayerContext.tsx për player. Ata wrappojnë të gjithë aplikacionin në layout.tsx."
            },
            {
                "pyetje": "Si funksionon SongCard komponenti?",
                "pergjigje": "SongCard shfaq informacionin e këngës (titull, artist, cover). Ka hover effects që shfaqin butonin Play. Kur klikohet, thirret PlayerContext.playSong() për të filluar luajtjen."
            },
            {
                "pyetje": "Si implementohet audio playback?",
                "pergjigje": "Përdoret HTML5 Audio API. PlayerContext mban një ref të audio element-it dhe kontrollon play(), pause(), currentTime, volume. Event listeners dëgjojnë për 'ended', 'timeupdate', 'loadedmetadata'."
            },
            {
                "pyetje": "Si funksionon queue (radha) e këngëve?",
                "pergjigje": "Queue është një array në PlayerContext. Kur luhet një këngë, ajo shtohet në queue. nextSong() dhe previousSong() navigojnë nëpër queue. addToQueue() shton këngë të reja."
            },
            {
                "pyetje": "Si ruhet gjendja e player-it?",
                "pergjigje": "Gjendja ruhet në localStorage për persistencë. Kur aplikacioni ngarkohet, PlayerContext lexon nga localStorage dhe rikthjen gjendjen e fundit (kënga, pozicioni, volume)."
            },
            {
                "pyetje": "Si funksionon progress bar-i?",
                "pergjigje": "Progress bar dëgjon event-in 'timeupdate' të audio element-it. Llogarit përqindjen (currentTime / duration * 100). Kur përdoruesi klikon, ndryshohet audio.currentTime."
            },
            {
                "pyetje": "Si implementohet volume control?",
                "pergjigje": "Volume kontrollohet me një slider që ndryshon audio.volume (0-1). Vlera ruhet në PlayerContext dhe localStorage. Ka edhe buton mute që ruan volume-in e mëparshëm."
            },
            {
                "pyetje": "Si funksionon Sidebar komponenti?",
                "pergjigje": "Sidebar përmban navigimin kryesor (Home, Search, Library) dhe listën e playlist-ave të përdoruesit. Në mobile bëhet collapsible ose overlay. Përdor Next.js Link për navigim."
            },
            {
                "pyetje": "Si menaxhohen error states në frontend?",
                "pergjigje": "Përdoren try-catch blocks në API calls. Error boundaries kapen gabime të React. Toast notifications shfaqin mesazhe gabimi. Loading states tregojnë spinners gjatë fetch-it."
            },
            {
                "pyetje": "Si optimizohet performance në frontend?",
                "pergjigje": "Përdoret React.memo për komponente, useMemo për kalkulime të kushtueshme, useCallback për funksione. Lazy loading për imazhe dhe komponente. Debouncing për search. Code splitting me Next.js."
            },
            {
                "pyetje": "Si implementohet routing në Next.js?",
                "pergjigje": "Përdoret App Router i Next.js 14. Faqet janë në app/ directory. Dynamic routes përdorin [id] syntax. useRouter hook për navigim programatik. Middleware për protected routes."
            },
            {
                "pyetje": "Si funksionon authentication në frontend?",
                "pergjigje": "AuthContext menaxhon gjendjen e user-it. Token ruhet në localStorage. Protected routes kontrollojnë nëse user është i loguar. Login/logout ndryshojnë gjendjen globale."
            },
            {
                "pyetje": "Si implementohen protected routes?",
                "pergjigje": "Përdoret middleware.ts që kontrollon token-in. Nëse nuk ka token, ridrejton në /login. AuthContext ekspozon isAuthenticated boolean për komponente."
            },
            {
                "pyetje": "Si funksionon search functionality?",
                "pergjigje": "SearchBar përdor useDebounce hook për të vonuar API calls. Kërkon në songs, artists, playlists. Rezultatet shfaqen në SearchResults komponentin me kategori të ndara."
            },
            {
                "pyetje": "Si implementohet playlist management?",
                "pergjigje": "PlaylistContext menaxhon CRUD operacionet. Komponenti CreatePlaylist krijon të reja. PlaylistCard shfaq playlist-et. Drag & drop për reordering (e planifikuar)."
            },
            {
                "pyetje": "Si funksionon like/unlike functionality?",
                "pergjigje": "LikeButton komponenti dërgon POST/DELETE requests në /api/v1/likes. Gjendja e like-it ruhet lokalisht dhe sinkronizohet me server. Heart icon ndryshohet në bazë të gjendjes."
            },
            {
                "pyetje": "Si implementohet infinite scrolling?",
                "pergjigje": "Përdoret Intersection Observer API për të detektuar kur përdoruesi arrin në fund të listës. useInfiniteScroll hook menaxhon pagination dhe loading states."
            },
            {
                "pyetje": "Si funksionon image lazy loading?",
                "pergjigje": "LazyImage komponenti përdor Intersection Observer. Imazhet ngarkohen vetëm kur janë afër viewport-it. Placeholder shfaqet gjatë loading-ut."
            },
            {
                "pyetje": "Si implementohet dark/light mode?",
                "pergjigje": "ThemeContext menaxhon temën. CSS variables ndryshojnë ngjyrat. Tema ruhet në localStorage. Toggle button në settings ndryshon temën globalisht."
            },
            {
                "pyetje": "Si funksionon keyboard navigation?",
                "pergjigje": "Event listeners për keydown events. Space për play/pause, arrow keys për navigation, Enter për selection. Focus management për accessibility."
            },
            {
                "pyetje": "Si implementohet accessibility (a11y)?",
                "pergjigje": "ARIA labels për screen readers, keyboard navigation, focus indicators, semantic HTML, alt text për imazhe, color contrast compliance."
            },
            {
                "pyetje": "Si funksionon caching në frontend?",
                "pergjigje": "React Query për server state caching. localStorage për user preferences. Service Worker për offline caching (e planifikuar). Browser cache për static assets."
            },
            {
                "pyetje": "Si implementohet form validation?",
                "pergjigje": "React Hook Form për form management. Yup ose Zod për validation schemas. Real-time validation me onChange events. Error messages për çdo field."
            },
            {
                "pyetje": "Si funksionon file upload për cover images?",
                "pergjigje": "FileUpload komponenti përdor drag & drop ose file input. Imazhet upload-ohen në Supabase Storage. Progress bar tregon përparimin. Preview para upload-it."
            },
            {
                "pyetje": "Si implementohet PWA functionality?",
                "pergjigje": "Service Worker për offline support, Web App Manifest për install prompt, Push notifications për updates, Background sync për offline actions."
            },
            {
                "pyetje": "Si funksionon testing në frontend?",
                "pergjigje": "Jest për unit tests, React Testing Library për component tests, Cypress për e2e tests. Mock-ohen API calls. Test coverage reports."
            },
            {
                "pyetje": "Si optimizohen bundle sizes?",
                "pergjigje": "Tree shaking për unused code, Code splitting me dynamic imports, Bundle analyzer për të identifikuar probleme, Lazy loading për routes."
            },
            {
                "pyetje": "Si implementohet internationalization (i18n)?",
                "pergjigje": "next-i18next për translations, JSON files për çdo gjuhë, useTranslation hook në komponente, Language switcher në UI."
            },
            {
                "pyetje": "Si funksionon SEO optimization?",
                "pergjigje": "Next.js Head për meta tags, Server-side rendering për better indexing, Sitemap generation, Open Graph tags për social sharing."
            },
            {
                "pyetje": "Si implementohet real-time functionality?",
                "pergjigje": "WebSocket connection për live updates, Socket.io client, Real-time notifications për new songs/playlists, Live listening sessions (e planifikuar)."
            },
            {
                "pyetje": "Si funksionon mobile responsiveness?",
                "pergjigje": "Mobile-first design, Tailwind breakpoints (sm, md, lg, xl), Touch gestures për swipe, Bottom navigation për mobile, Collapsible sidebar."
            },
            {
                "pyetje": "Si implementohet gesture support?",
                "pergjigje": "React-use-gesture për swipe gestures, Touch events për mobile interactions, Pinch to zoom për images, Swipe për next/previous song."
            },
            {
                "pyetje": "Si funksionon analytics tracking?",
                "pergjigje": "Google Analytics për page views, Custom events për user interactions, Performance monitoring me Web Vitals, Error tracking me Sentry."
            },
            {
                "pyetje": "Si implementohet social sharing?",
                "pergjigje": "Share API për native sharing, Custom share buttons për social platforms, Open Graph meta tags, Deep linking për shared content."
            },
            {
                "pyetje": "Si funksionon notification system?",
                "pergjigje": "Toast notifications për feedback, Push notifications për updates, In-app notifications për social interactions, Notification preferences në settings."
            }
        ]
        for qa in frontend_qa:
            result["kategorite"]["frontend"]["pyetje"].append(qa)
        
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
                    "state_management": "React Context API",
                    "ui_library": "Chakra UI"
                },
                "backend": {
                    "framework": "FastAPI",
                    "language": "Python 3.11+",
                    "rate_limiting": "SlowAPI",
                    "validation": "Pydantic"
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
                    "app/components": "React components (Sidebar, Player, Cards)",
                    "app/contexts": "React Context (Auth, Player)",
                    "app/hooks": "Custom React hooks",
                    "app/types": "TypeScript type definitions",
                    "app/utils": "Utility functions",
                    "app/lib": "API client dhe helpers"
                },
                "dokumentimi": "Dokumentimi i plotë i projektit në shqip"
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
                },
                {
                    "emri": "Player Context (Frontend)",
                    "pershkrimi": "Menaxhon luajtjen e muzikës dhe kontrollet e player-it"
                },
                {
                    "emri": "Auth Context (Frontend)",
                    "pershkrimi": "Menaxhon gjendjen e autentifikimit në frontend"
                }
            ],
            "komponente_frontend": [
                {
                    "emri": "Sidebar",
                    "pershkrimi": "Navigimi kryesor dhe lista e playlist-ave",
                    "skedari": "app/components/layout/Sidebar.tsx"
                },
                {
                    "emri": "Player",
                    "pershkrimi": "Kontrollet e muzikës (play/pause, progress, volume)",
                    "skedari": "app/components/layout/Player.tsx"
                },
                {
                    "emri": "SongCard",
                    "pershkrimi": "Karta e këngës me hover effects",
                    "skedari": "app/components/ui/SongCard.tsx"
                },
                {
                    "emri": "SearchBar",
                    "pershkrimi": "Kërkimi me debouncing",
                    "skedari": "app/components/navigation/SearchBar.tsx"
                }
            ]
        }
        
        return overview
