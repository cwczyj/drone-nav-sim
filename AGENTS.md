# AGENTS.md

This file provides guidance for agentic coding assistants working on this repository.

## Build, Lint, and Test Commands

### Installation
```bash
cd backend && pip install -r requirements.txt
cd frontend-react && npm install
```

### Running the Application
```bash
# Full system (recommended)
python run_all.py

# Backend only
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend only
cd frontend-react && npm run dev
```

### Testing
```bash
# Run all system tests
python test_system.py

# Run single test (modify test_system.py or call specific functions)
python -c "from test_system import test_function_name; test_function_name()"
```

### Service Endpoints
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend UI: http://localhost:5173

## Code Style Guidelines

### Imports
- Order: standard library → third-party → local (separated by blank lines)
- Multiple imports from same module on one line: `from typing import List, Optional`
- Avoid wildcard imports (e.g., `import *`)
- Prefer explicit imports over module-level imports where used

### Formatting
- 4-space indentation
- 2 blank lines between top-level functions/classes
- 1 blank line between logical sections
- No trailing whitespace
- Max line length: ~120 characters (not strictly enforced)

### Type Annotations
- Use type hints for all function parameters and return values
- Use Pydantic models for request/response validation
- Import from `typing`: `List`, `Optional`, `Dict`, etc.
- Example: `def get_user(username: str) -> Optional[User]:`

### Naming Conventions
- **Classes**: PascalCase (e.g., `User`, `Farmland`, `AuthManager`)
- **Functions/Variables**: snake_case (e.g., `get_user_by_username`, `access_token`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SECRET_KEY`, `ALGORITHM`)
- **Endpoints**: snake_case in URL paths (e.g., `/api/farmlands/{farmland_id}`)
- **Private methods**: snake_case with single underscore prefix (if needed)

### Error Handling
- Use FastAPI's `HTTPException` with appropriate status codes:
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (authentication failures)
  - 403: Forbidden (authorization failures)
  - 404: Not Found
- Include descriptive messages in Chinese (consistent with existing codebase)
- Example:
```python
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="用户名或密码错误",
    headers={"WWW-Authenticate": "Bearer"},
)
```
- Use try-except for external calls (requests, file operations)
- Always use `response.raise_for_status()` after requests

### FastAPI/Backend Patterns
- Use `async def` for route handlers
- Use `Depends()` for authentication/authorization injection
- Separate concerns: models.py, auth.py, database.py, etc.
- Use `APIRouter` for modular endpoint organization
- Use `response_model` for response validation
- Include proper HTTP status codes in decorators (e.g., `status_code=status.HTTP_201_CREATED`)

### Pydantic Models
- Define models in `models.py`
- Use `Field()` for validation: `username: str = Field(min_length=3, max_length=50)`
- Separate Create/Update/Response models (e.g., `FarmlandCreate`, `FarmlandUpdate`, `FarmlandResponse`)
- Use `default_factory` for dynamic defaults: `id: str = Field(default_factory=lambda: str(uuid.uuid4()))`
- Use `model_dump()` instead of `dict()` (Pydantic v2)

### Streamlit/Frontend Patterns
- Use React functional components with hooks for state management
- Use Axios for HTTP requests to backend API
- Use React Router for page navigation
- Use Ant Design components for UI elements
- Store API base URL in environment variables or config file
- Use TypeScript for type safety
- Check authentication status before rendering protected routes

### File Organization
```
backend/
  ├── main.py          # FastAPI app, route definitions
  ├── models.py        # Pydantic models
  ├── auth.py          # Authentication logic
  ├── database.py      # Data access layer (in-memory dicts)
  └── farmland.py      # Farmland CRUD routes
frontend-react/
  ├── src/
  │   ├── App.tsx          # Main app component
  │   ├── main.tsx         # Entry point
  │   ├── components/      # Reusable components
  │   │   └── ...
  │   ├── pages/           # Page components
  │   │   └── ...
  │   └── services/        # API services
  │       └── api.ts
  └── package.json
```

### Security
- Password hashing with `passlib` (bcrypt scheme)
- JWT tokens for authentication (24h expiration by default)
- Always validate user ownership before data modification
- Never log passwords or tokens
- Use `verify_password()` and `get_password_hash()` from auth.py

### Data Models
- UUID-based IDs for all entities
- Track created_at/updated_at timestamps
- Use `datetime.utcnow()` for timestamps
- In-memory storage via dictionaries: `users_db = {}`, `farmlands_db = {}`
