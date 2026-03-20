# React Migration + Deep Learning Path Planning

## TL;DR

> **Quick Summary**: Migrate Streamlit frontend to React with Leaflet map drawing, add deep learning-based drone flight path planning, preserve existing FastAPI authentication.
> 
> **Deliverables**:
> - React frontend (Vite) with Leaflet polygon drawing
> - Deep learning path planning module for drone coverage
> - Preserved JWT authentication system
> - Jest + RTL test infrastructure
> 
> **Estimated Effort**: XL (Major refactor + new features)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Setup → React App → Auth Integration → Path Planning API → Path Planning UI → Integration

---

## Context

### Original Request
用户要求：
1. 前端改为使用react等流行框架制作，能够绘制任意形状的地形地貌并赋予农田属性
2. 增加核心算法，查找开源算法，为项目添加核心算法，能够自动为无人机按照选择的农田规划飞行路径，最好采用深度学习算法
3. 保持现有的用户管理认证功能

### Interview Summary
**Key Discussions**:
- Frontend Framework: Vite + React (fast, modern)
- Map Library: Leaflet + react-leaflet (free, OpenStreetMap)
- Coordinate System: Abstract 0-500 canvas (keep current system, not real GPS)
- Path Planning: Pre-trained/simple neural network (not full RL training loop)
- Data Persistence: Keep JSON files (no database migration)
- Testing: Jest + React Testing Library

**Research Findings**:
- DRL-DroneNavigation (GitHub: ergibi/drl-dronenavigation) - PPO with Stable-Baselines3 reference
- UAV-Coverage-Planner (GitHub: qzhou711/UAV-Coverage-Planner) - Classical CPP algorithms
- Fields2Cover - Production-ready agricultural path planning
- Existing geometry utils (shoelace, ray casting) should be preserved and ported

### Self-Identified Gaps (addressed):
- Deep learning model approach: Hybrid classical + simple NN for optimization
- Coordinate system: Abstract canvas confirmed (not real GPS)
- Testing infrastructure: Jest + RTL confirmed

---

## Work Objectives

### Core Objective
1. Replace Streamlit frontend with modern React application
2. Enable interactive polygon drawing on Leaflet map for arbitrary terrain shapes
3. Implement deep learning-based coverage path planning for drones
4. Preserve all existing authentication and user management functionality

### Concrete Deliverables
- `/frontend-react/` - New React application with Vite
- `/backend/path_planning.py` - Path planning module with DL capabilities
- `/frontend-react/src/components/` - React components for auth, map, path planning
- `/frontend-react/src/services/` - API service layer with Axios
- Updated backend API endpoints for path planning

### Definition of Done
- [ ] React app runs at localhost:5173 with Vite dev server
- [ ] Users can login/register with JWT authentication
- [ ] Users can draw arbitrary polygons on Leaflet map
- [ ] Users can assign farmland properties (name, crop type) to drawn polygons
- [ ] Path planning generates drone flight waypoints for selected farmland
- [ ] All existing FastAPI endpoints remain functional
- [ ] Jest tests pass for React components

### Must Have
- JWT authentication preserved and working in React
- Interactive polygon drawing on Leaflet map
- Path planning API endpoint returning waypoints
- Basic deep learning model for path optimization
- Test infrastructure (Jest + RTL)

### Must NOT Have (Guardrails)
- NO real GPS coordinates (keep abstract 0-500 canvas)
- NO full RL training loop (use pre-trained/simple NN only)
- NO database migration (keep JSON file storage)
- NO changes to existing auth logic in backend
- NO Streamlit code remaining (complete rewrite)
- NO scope creep to multi-drone, obstacle avoidance, or DJI SDK (MVP only)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (React is new)
- **Automated tests**: YES (TDD for critical components)
- **Framework**: Jest + React Testing Library
- **Approach**: TDD for auth flows and path planning, tests-after for UI components

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Path Planning**: Use Bash (Python script) — Run algorithm, verify output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation + scaffolding):
├── Task 1: React project setup with Vite [quick]
├── Task 2: Backend path planning dependencies [quick]
├── Task 3: React project structure + routing [quick]
├── Task 4: API service layer with Axios [quick]
├── Task 5: Auth context + hooks [quick]
└── Task 6: Jest + RTL setup [quick]

Wave 2 (After Wave 1 — core modules, MAX PARALLEL):
├── Task 7: Login page component [visual-engineering]
├── Task 8: Register page component [visual-engineering]
├── Task 9: Auth protected routes [quick]
├── Task 10: Backend geometry utilities module [quick]
├── Task 11: Backend path planning - classical CPP [deep]
├── Task 12: Backend path planning - DL model integration [deep]
└── Task 13: Backend path planning API endpoints [unspecified-high]

Wave 3 (After Wave 2 — UI components):
├── Task 14: Leaflet map component [visual-engineering]
├── Task 15: Polygon drawing controls [visual-engineering]
├── Task 16: Farmland form component [quick]
├── Task 17: Farmland list component [quick]
├── Task 18: Farmland edit/delete [quick]
└── Task 19: Path visualization component [visual-engineering]

Wave 4 (After Wave 3 — integration):
├── Task 20: Dashboard/landing page [visual-engineering]
├── Task 21: Full auth flow integration [deep]
├── Task 22: Farmland CRUD integration [unspecified-high]
├── Task 23: Path planning UI integration [unspecified-high]
└── Task 24: Remove old Streamlit frontend [quick]

Wave FINAL (After ALL tasks — verification):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 3 → Task 7 → Task 21 → Task 22 → Task 23 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | — | 3, 6 |
| 2 | — | 10, 11, 12 |
| 3 | 1 | 7, 8, 9, 14 |
| 4 | 1 | 5, 7, 8, 21, 22 |
| 5 | 4 | 9, 21 |
| 6 | 1 | 7, 8 |
| 7 | 3, 4, 6 | 21 |
| 8 | 3, 4, 6 | 21 |
| 9 | 3, 5 | 21 |
| 10 | 2 | 11, 12 |
| 11 | 2, 10 | 13 |
| 12 | 2, 10 | 13 |
| 13 | 11, 12 | 23 |
| 14 | 3 | 15, 19 |
| 15 | 14 | 16, 22 |
| 16 | 15 | 22 |
| 17 | 4 | 18, 22 |
| 18 | 17 | 22 |
| 19 | 14, 13 | 23 |
| 20 | — | — |
| 21 | 7, 8, 9, 5 | 22 |
| 22 | 21, 16, 17, 18, 15 | 23 |
| 23 | 22, 19, 13 | F1-F4 |
| 24 | 23 | — |

### Agent Dispatch Summary

- **Wave 1**: 6 tasks → all `quick`
- **Wave 2**: 7 tasks → 2 `visual-engineering`, 2 `quick`, 2 `deep`, 1 `unspecified-high`
- **Wave 3**: 6 tasks → 3 `visual-engineering`, 3 `quick`
- **Wave 4**: 5 tasks → 1 `visual-engineering`, 1 `deep`, 2 `unspecified-high`, 1 `quick`
- **Final**: 4 tasks → 1 `oracle`, 2 `unspecified-high`, 1 `deep`

---

## TODOs

- [x] 1. React Project Setup with Vite

  **What to do**:
  - Create new React project using Vite in `/frontend-react/` directory
  - Configure TypeScript
  - Add dependencies: react-router-dom, axios, react-leaflet, leaflet, leaflet-draw
  - Configure Vite proxy for backend API (localhost:8000)
  - Set up basic folder structure: src/components, src/services, src/hooks, src/context, src/types

  **Must NOT do**:
  - Do not modify existing backend code
  - Do not create pages yet (just project setup)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard project scaffolding, well-documented process
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6)
  - **Blocks**: Tasks 3, 6
  - **Blocked By**: None

  **References**:
  - Vite docs: https://vitejs.dev/guide/#scaffolding-your-first-vite-project
  - React-Leaflet: https://react-leaflet.js.org/
  - Existing backend: `backend/main.py` - API runs at port 8000

  **Acceptance Criteria**:
  - [ ] `npm create vite@latest frontend-react -- --template react-ts` succeeds
  - [ ] `npm install` succeeds with all required dependencies
  - [ ] `npm run dev` starts dev server at localhost:5173
  - [ ] Vite config has proxy to localhost:8000

  **QA Scenarios**:
  ```
  Scenario: React dev server starts successfully
    Tool: Bash
    Steps:
      1. cd frontend-react && npm run dev &
      2. sleep 5
      3. curl -s http://localhost:5173 | grep -q "root"
    Expected Result: Dev server running, HTML response received
    Evidence: .sisyphus/evidence/task-01-dev-server.log
  ```

  **Commit**: YES
  - Message: `feat: initialize React + Vite project`
  - Files: frontend-react/*

---

- [x] 2. Backend Path Planning Dependencies

  **What to do**:
  - Add Python dependencies to `backend/requirements.txt`:
    - numpy (numerical operations)
    - shapely (polygon operations)
    - torch or tensorflow (deep learning - choose one)
    - scipy (optimization)
  - Create `backend/path_planning/` directory structure:
    - `__init__.py`
    - `geometry.py` (polygon utilities)
    - `cpp.py` (coverage path planning)
    - `dl_model.py` (deep learning model)
    - `optimizer.py` (path optimization)

  **Must NOT do**:
  - Do not implement algorithms yet (just structure)
  - Do not modify existing backend files except requirements.txt

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple dependency installation and directory creation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5, 6)
  - **Blocks**: Tasks 10, 11, 12
  - **Blocked By**: None

  **References**:
  - Shapely docs: https://shapely.readthedocs.io/
  - PyTorch: https://pytorch.org/get-started/locally/
  - Existing models: `backend/models.py` - Farmland model

  **Acceptance Criteria**:
  - [ ] `pip install -r requirements.txt` succeeds with new packages
  - [ ] `backend/path_planning/__init__.py` exists
  - [ ] All submodules created as empty files with docstrings

  **QA Scenarios**:
  ```
  Scenario: Dependencies install correctly
    Tool: Bash
    Steps:
      1. cd backend && pip install -r requirements.txt
      2. python -c "import numpy, shapely, torch; print('OK')"
    Expected Result: All imports succeed
    Evidence: .sisyphus/evidence/task-02-deps.log
  ```

  **Commit**: YES
  - Message: `feat: add path planning dependencies and module structure`
  - Files: backend/requirements.txt, backend/path_planning/*

---

- [x] 3. React Project Structure + Routing

  **What to do**:
  - Create folder structure:
    ```
    src/
      components/
        auth/
        map/
        farmland/
        path/
      context/
        AuthContext.tsx
      hooks/
        useAuth.ts
      services/
        api.ts
      types/
        index.ts
      pages/
        Login.tsx
        Register.tsx
        Dashboard.tsx
        FarmlandList.tsx
        PathPlanning.tsx
    ```
  - Set up React Router with routes:
    - `/login` - Login page
    - `/register` - Register page
    - `/` - Dashboard (protected)
    - `/farmlands` - Farmland list (protected)
    - `/path-planning` - Path planning (protected)
  - Create App.tsx with Router and basic layout

  **Must NOT do**:
  - Do not implement page content yet (just routing)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard React Router setup
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5, 6)
  - **Blocks**: Tasks 7, 8, 9, 14
  - **Blocked By**: Task 1

  **References**:
  - React Router: https://reactrouter.com/en/main/start/tutorial
  - Pattern: `frontend/app.py` - existing page routing logic

  **Acceptance Criteria**:
  - [ ] All folders and empty component files exist
  - [ ] React Router configured in App.tsx
  - [ ] Routes accessible via URL navigation
  - [ ] Basic Layout component with navigation placeholder

  **QA Scenarios**:
  ```
  Scenario: Routing works for all pages
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/login
      2. Verify URL is /login
      3. Navigate to http://localhost:5173/register
      4. Verify URL is /register
    Expected Result: All routes accessible
    Evidence: .sisyphus/evidence/task-03-routing.png
  ```

  **Commit**: YES
  - Message: `feat: add React Router and project structure`
  - Files: frontend-react/src/**/*

---

- [x] 4. API Service Layer with Axios

  **What to do**:
  - Create `src/services/api.ts` with Axios instance:
    - Base URL: http://localhost:8000
    - Request interceptor: Add JWT token to Authorization header
    - Response interceptor: Handle 401 errors (redirect to login)
  - Create typed API functions:
    - `authAPI.register(username, email, password)`
    - `authAPI.login(username, password)` → returns token
    - `authAPI.getMe()` → returns user info
    - `farmlandAPI.getAll()` → returns farmland list
    - `farmlandAPI.create(data)` → creates farmland
    - `farmlandAPI.update(id, data)` → updates farmland
    - `farmlandAPI.delete(id)` → deletes farmland
    - `pathPlanningAPI.generate(farmlandId)` → generates path

  **Must NOT do**:
  - Do not call backend yet (backend unchanged)
  - Do not implement auth state (that's Task 5)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Axios setup with interceptors
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5, 6)
  - **Blocks**: Tasks 5, 7, 8, 21, 22
  - **Blocked By**: Task 1

  **References**:
  - Backend endpoints: `backend/main.py`, `backend/farmland.py`
  - API endpoints: `frontend/config.py` - existing endpoint definitions
  - Pattern: `frontend/auth_state.py:AuthManager` - existing API calls

  **Acceptance Criteria**:
  - [ ] Axios instance created with base URL
  - [ ] Request interceptor adds Authorization header
  - [ ] Response interceptor handles 401
  - [ ] All typed API functions defined

  **QA Scenarios**:
  ```
  Scenario: API service handles token injection
    Tool: Bash
    Steps:
      1. Start backend: cd backend && uvicorn main:app &
      2. Run test: npm test -- api.test.ts
    Expected Result: Token injected into Authorization header
    Evidence: .sisyphus/evidence/task-04-api-service.log
  ```

  **Commit**: YES
  - Message: `feat: add API service layer with Axios`
  - Files: frontend-react/src/services/api.ts, frontend-react/src/types/index.ts

---

- [x] 5. Auth Context + Hooks

  **What to do**:
  - Create `src/context/AuthContext.tsx`:
    - AuthState: { user, token, isAuthenticated, loading }
    - AuthActions: { login, logout, register, checkAuth }
    - Store token in localStorage
    - Auto-check auth on mount (getMe API)
  - Create `src/hooks/useAuth.ts`:
    - Wrapper hook for AuthContext
    - Easy access to auth state and actions
  - Wrap App with AuthProvider

  **Must NOT do**:
  - Do not create login/register UI (that's Tasks 7, 8)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard React Context pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 6)
  - **Blocks**: Tasks 9, 21
  - **Blocked By**: Task 4

  **References**:
  - Pattern: `frontend/auth_state.py:AuthManager` - existing auth state management
  - Backend: `backend/auth.py` - JWT token generation/validation
  - React Context pattern: https://react.dev/learn/passing-data-deeply-with-context

  **Acceptance Criteria**:
  - [ ] AuthContext provides user, token, isAuthenticated, loading
  - [ ] login() stores token and fetches user
  - [ ] logout() clears token and state
  - [ ] register() calls API and stores token
  - [ ] useAuth hook exports all context values

  **QA Scenarios**:
  ```
  Scenario: Auth context persists token in localStorage
    Tool: Jest
    Steps:
      1. Render AuthProvider
      2. Call login('testuser', 'password')
      3. Check localStorage.getItem('token') exists
    Expected Result: Token stored after login
    Evidence: .sisyphus/evidence/task-05-auth-context.log
  ```

**Commit**: YES
  - Message: `test: add Jest and React Testing Library setup`
  - Files: frontend-react/jest.config.js, frontend-react/setupTests.ts, frontend-react/src/App.test.tsx

---

- [x] 6. Jest + RTL Setup

  **What to do**:
  - Install Jest and React Testing Library:
    - `npm install -D jest @testing-library/react @testing-library/jest-dom jsdom @types/jest`
  - Create `jest.config.js`:
    - Test environment: jsdom
    - Setup file: setupTests.ts
  - Create `setupTests.ts`:
    - Import @testing-library/jest-dom
  - Add test script to package.json: `"test": "jest"`
  - Create example test file: `src/App.test.tsx`

  **Must NOT do**:
  - Do not write comprehensive tests yet (just setup)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Jest + RTL configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: Task 1

  **References**:
  - Jest docs: https://jestjs.io/docs/getting-started
  - RTL docs: https://testing-library.com/docs/react-testing-library/intro/
  - Vite + Jest: https://github.com/szymonmiszczuk/vite-jest-example

  **Acceptance Criteria**:
  - [ ] `npm test` runs successfully
  - [ ] Example test passes
  - [ ] Jest config matches Vite setup

  **QA Scenarios**:
  ```
  Scenario: Jest runs example test
    Tool: Bash
    Steps:
      1. cd frontend-react && npm test
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-06-jest.log
  ```

**Commit**: YES
  - Message: `test: add Jest and React Testing Library setup`
  - Files: frontend-react/jest.config.js, frontend-react/setupTests.ts, frontend-react/src/App.test.tsx

---

- [x] 7. Login Page Component

  **What to do**:
  - Create `src/components/auth/LoginForm.tsx`:
    - Form fields: username, password
    - Validation: required fields, min length
    - Submit calls `login(username, password)` from useAuth
    - Error display for failed login
    - Redirect to dashboard on success
    - Link to register page
  - Create `src/pages/Login.tsx` using LoginForm
  - Add basic styling (CSS modules or styled-components)
  - Write tests:
    - Renders form fields
    - Shows error on failed login
    - Redirects on success

  **Must NOT do**:
  - Do not modify backend
  - Do not implement protected route logic (Task 9)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with validation and styling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9, 10, 11, 12, 13)
  - **Blocks**: Task 21
  - **Blocked By**: Tasks 3, 4, 6

  **References**:
  - Pattern: `frontend/pages/login.py:login_page()` - existing login UI
  - Backend: `backend/main.py:login()` - login endpoint
  - useAuth: `frontend-react/src/hooks/useAuth.ts` (Task 5)

  **Acceptance Criteria**:
  - [ ] Login form renders with username and password fields
  - [ ] Form validates required fields
  - [ ] Successful login stores token and redirects
  - [ ] Failed login shows error message
  - [ ] Jest tests pass

  **QA Scenarios**:
  ```
  Scenario: User can login with valid credentials
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/login
      2. Fill username: "testuser"
      3. Fill password: "password123"
      4. Click submit button
      5. Wait for redirect to /
    Expected Result: Redirected to dashboard, token in localStorage
    Evidence: .sisyphus/evidence/task-07-login-success.png

  Scenario: Invalid credentials show error
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/login
      2. Fill username: "wrong"
      3. Fill password: "wrong"
      4. Click submit
      5. Check for error message
    Expected Result: Error message displayed
    Evidence: .sisyphus/evidence/task-07-login-error.png
  ```

  **Commit**: YES
  - Message: `feat: add login page component`
  - Files: frontend-react/src/components/auth/LoginForm.tsx, frontend-react/src/pages/Login.tsx

---

- [x] 8. Register Page Component

  **What to do**:
  - Create `src/components/auth/RegisterForm.tsx`:
    - Form fields: username, email, password, confirmPassword
    - Validation: required, email format, password match, min length
    - Submit calls `register(username, email, password)`
    - Error display for failed registration
    - Success: redirect to login or auto-login
    - Link to login page
  - Create `src/pages/Register.tsx` using RegisterForm
  - Write tests:
    - Renders all form fields
    - Validates password match
    - Shows error on failed registration
    - Redirects on success

  **Must NOT do**:
  - Do not modify backend validation
  - Do not auto-login after register (just redirect to login)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with validation and styling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9, 10, 11, 12, 13)
  - **Blocks**: Task 21
  - **Blocked By**: Tasks 3, 4, 6

  **References**:
  - Pattern: `frontend/pages/login.py` - existing register tab UI
  - Backend: `backend/main.py:register()` - register endpoint
  - Backend validation: `backend/models.py:RegisterRequest` - min_length constraints

  **Acceptance Criteria**:
  - [ ] Register form renders with all fields
  - [ ] Email validation works
  - [ ] Password match validation works
  - [ ] Successful registration redirects to login
  - [ ] Jest tests pass

  **QA Scenarios**:
  ```
  Scenario: User can register with valid data
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/register
      2. Fill username: "newuser"
      3. Fill email: "new@example.com"
      4. Fill password: "password123"
      5. Fill confirmPassword: "password123"
      6. Click submit
      7. Wait for redirect to /login
    Expected Result: Redirected to login page
    Evidence: .sisyphus/evidence/task-08-register-success.png

  Scenario: Password mismatch shows error
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173/register
      2. Fill password: "password123"
      3. Fill confirmPassword: "different"
      4. Click submit
    Expected Result: Error message about password mismatch
    Evidence: .sisyphus/evidence/task-08-register-mismatch.png
  ```

  **Commit**: YES
  - Message: `feat: add register page component`
  - Files: frontend-react/src/components/auth/RegisterForm.tsx, frontend-react/src/pages/Register.tsx

---

- [x] 9. Auth Protected Routes

  **What to do**:
  - Create `src/components/auth/ProtectedRoute.tsx`:
    - Check `isAuthenticated` from useAuth
    - If not authenticated: redirect to /login
    - If authenticated: render children
    - Handle loading state
  - Wrap protected routes in App.tsx:
    - / (Dashboard)
    - /farmlands
    - /path-planning
  - Add logout functionality:
    - Clear token from localStorage
    - Clear auth state
    - Redirect to login

  **Must NOT do**:
  - Do not change route definitions
  - Do not implement page content

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple auth check wrapper
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 10, 11, 12, 13)
  - **Blocks**: Task 21
  - **Blocked By**: Tasks 3, 5

  **References**:
  - Pattern: `frontend/app.py:AuthManager.check_auth()` - existing auth check
  - React Router: https://reactrouter.com/en/main/examples/auth

  **Acceptance Criteria**:
  - [ ] Unauthenticated users redirected to login
  - [ ] Authenticated users can access protected routes
  - [ ] Loading state handled gracefully
  - [ ] Logout clears state and redirects

  **QA Scenarios**:
  ```
  Scenario: Unauthenticated user redirected to login
    Tool: Playwright
    Steps:
      1. Clear localStorage
      2. Navigate to http://localhost:5173/farmlands
      3. Check current URL
    Expected Result: URL is /login
    Evidence: .sisyphus/evidence/task-09-protected-redirect.png

  Scenario: Authenticated user can access protected route
    Tool: Playwright
    Steps:
      1. Login as testuser
      2. Navigate to http://localhost:5173/farmlands
      3. Check page content
    Expected Result: Farmlands page displays
    Evidence: .sisyphus/evidence/task-09-protected-access.png
  ```

  **Commit**: YES
  - Message: `feat: add protected route component`
  - Files: frontend-react/src/components/auth/ProtectedRoute.tsx, frontend-react/src/App.tsx

---

- [x] 10. Backend Geometry Utilities Module

  **What to do**:
  - Create `backend/path_planning/geometry.py`:
    - Port existing functions from `frontend/pages/farmland_list.py`:
      - `calculate_polygon_area(coords)` - shoelace formula
      - `point_in_polygon(point, polygon)` - ray casting
      - `polygons_overlap(poly1, poly2)` - overlap detection
    - Add new utilities using Shapely:
      - `polygon_centroid(coords)` - calculate center point
      - `polygon_bounds(coords)` - get bounding box
      - `simplify_polygon(coords, tolerance)` - reduce vertices
      - `offset_polygon(coords, distance)` - inward/outward offset
  - Write unit tests in `backend/tests/test_geometry.py`

  **Must NOT do**:
  - Do not duplicate code - port from existing frontend

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Porting existing algorithms with Shapely additions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 11, 12, 13)
  - **Blocks**: Tasks 11, 12
  - **Blocked By**: Task 2

  **References**:
  - Existing: `frontend/pages/farmland_list.py:20-140` - geometry functions
  - Shapely: https://shapely.readthedocs.io/en/stable/manual.html
  - Model: `backend/models.py:Farmland.boundary_coords` - coordinate format

  **Acceptance Criteria**:
  - [ ] All functions ported and tested
  - [ ] Shapely-based utilities added
  - [ ] Unit tests pass
  - [ ] Functions work with List[List[float]] format

  **QA Scenarios**:
  ```
  Scenario: Geometry functions work correctly
    Tool: Bash
    Steps:
      1. cd backend && python -m pytest tests/test_geometry.py -v
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-10-geometry.log
  ```

  **Commit**: YES
  - Message: `feat: add geometry utilities module`
  - Files: backend/path_planning/geometry.py, backend/tests/test_geometry.py

---

- [x] 11. Backend Path Planning - Classical CPP

  **What to do**:
  - Create `backend/path_planning/cpp.py`:
    - Implement Boustrophedon decomposition:
      - Divide polygon into cells based on sweep line
      - Generate back-and-forth path in each cell
    - Implement lawn mower pattern:
      - Generate parallel sweep lines
      - Connect sweeps with turns
    - Parameters:
      - `swath_width`: distance between sweeps (default 10 units)
      - `angle`: sweep direction (auto-optimize based on polygon)
    - Function signature:
      ```python
      def generate_coverage_path(
          polygon: List[List[float]],
          swath_width: float = 10.0,
          start_point: Optional[List[float]] = None
      ) -> List[List[float]]:
          """Generate waypoints for complete coverage of polygon."""
      ```
  - Use Shapely for polygon operations
  - Write unit tests

  **Must NOT do**:
  - Do not implement DL optimization (Task 12)
  - Do not create API endpoint (Task 13)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Algorithm implementation requiring geometric understanding
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 12, 13)
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 2, 10

  **References**:
  - UAV-Coverage-Planner: https://github.com/qzhou711/UAV-Coverage-Planner
  - Boustrophedon: https://en.wikipedia.org/wiki/Boustrophedon
  - Shapely docs: https://shapely.readthedocs.io/

  **Acceptance Criteria**:
  - [ ] generate_coverage_path returns valid waypoints
  - [ ] Path covers entire polygon
  - [ ] Waypoints are within polygon bounds
  - [ ] Unit tests pass for various polygon shapes

  **QA Scenarios**:
  ```
  Scenario: CPP generates valid path for rectangle
    Tool: Bash
    Steps:
      1. cd backend && python -c "
         from path_planning.cpp import generate_coverage_path
         rect = [[0,0], [100,0], [100,50], [0,50], [0,0]]
         path = generate_coverage_path(rect, swath_width=10)
         print(f'Generated {len(path)} waypoints')
         "
    Expected Result: Path generated with reasonable waypoint count
    Evidence: .sisyphus/evidence/task-11-cpp-rect.log

  Scenario: CPP generates valid path for irregular polygon
    Tool: Bash
    Steps:
      1. cd backend && python -m pytest tests/test_cpp.py -v
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-11-cpp-tests.log
  ```

**Commit**: YES
  - Message: `feat: add path planning API endpoints`
  - Files: backend/path_planning/routes.py, backend/main.py

---

- [x] 13. Backend Path Planning API Endpoints

  **What to do**:
  - Create `backend/path_planning/routes.py`:
    - POST `/api/path-planning/generate`:
      ```python
      class PathPlanningRequest(BaseModel):
          farmland_id: str
          swath_width: Optional[float] = 10.0
          use_dl: Optional[bool] = True
      
      class PathPlanningResponse(BaseModel):
          farmland_id: str
          waypoints: List[List[float]]
          total_distance: float
          estimated_time: float  # based on assumed speed
      
      @router.post("/generate", response_model=PathPlanningResponse)
      async def generate_path(
          request: PathPlanningRequest,
          current_user: User = Depends(get_current_user)
      ):
          # Get farmland
          # Generate CPP path
          # Optionally optimize with DL
          # Return waypoints
      ```
    - GET `/api/path-planning/{farmland_id}`:
      - Get stored path for farmland (if cached)
  - Include router in `backend/main.py`
  - Add path planning endpoint to API docs

  **Must NOT do**:
  - Do not modify existing endpoints
  - Do not store paths permanently (optional caching only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API design with integration of multiple modules
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 11, 12)
  - **Blocks**: Task 23
  - **Blocked By**: Tasks 11, 12

  **References**:
  - Pattern: `backend/farmland.py` - existing router pattern
  - Auth: `backend/auth.py:get_current_user` - dependency injection
  - Model: `backend/models.py` - Pydantic patterns

  **Acceptance Criteria**:
  - [ ] POST /api/path-planning/generate returns waypoints
  - [ ] Endpoint requires authentication
  - [ ] Error handling for invalid farmland_id
  - [ ] API docs updated at /docs

  **QA Scenarios**:
  ```
  Scenario: Path planning endpoint works
    Tool: Bash (curl)
    Steps:
      1. Login and get token
      2. Create farmland
      3. curl -X POST http://localhost:8000/api/path-planning/generate \
           -H "Authorization: Bearer $TOKEN" \
           -H "Content-Type: application/json" \
           -d '{"farmland_id": "...", "swath_width": 10}'
      4. Check response has waypoints
    Expected Result: Valid path response with waypoints
    Evidence: .sisyphus/evidence/task-13-api.json
  ```

**Commit**: YES
  - Message: `feat: add path planning API endpoints`
  - Files: backend/path_planning/routes.py, backend/main.py

---

- [x] 14. Leaflet Map Component

  **What to do**:
  - Create `src/components/map/MapCanvas.tsx`:
    - Use react-leaflet with MapContainer
    - Configure for abstract coordinate system (not real GPS):
      - Use CRS.Simple for non-geographic coordinates
      - Set bounds: [[0, 0], [500, 500]]
      - Disable wrapping
    - Add grid overlay (optional visual guide)
    - Props:
      - `polygons`: array of polygon data to display
      - `onPolygonCreate`: callback when new polygon drawn
      - `onPolygonEdit`: callback when polygon edited
      - `editable`: boolean to enable/disable drawing
  - Style with CSS for 500x500 canvas appearance
  - Write tests for component rendering

  **Must NOT do**:
  - Do not use real GPS/tile layers (CRS.Simple only)
  - Do not implement drawing controls yet (Task 15)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Map visualization component with specific configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 15, 16, 17, 18, 19)
  - **Blocks**: Tasks 15, 19
  - **Blocked By**: Task 3

  **References**:
  - React-Leaflet: https://react-leaflet.js.org/
  - CRS.Simple: https://leafletjs.com/examples/crs-simple/crs-simple.html
  - Existing: `frontend/pages/visualization.py` - current Plotly visualization
  - Coordinate system: 0-500 canvas from existing code

  **Acceptance Criteria**:
  - [ ] Map renders with CRS.Simple coordinate system
  - [ ] Bounds set to 0-500
  - [ ] Polygons display correctly
  - [ ] No tile layer (or minimal grid)
  - [ ] Jest tests pass

  **QA Scenarios**:
  ```
  Scenario: Map renders with correct bounds
    Tool: Playwright
    Steps:
      1. Navigate to page with MapCanvas
      2. Verify map container exists
      3. Check that coordinates are 0-500
    Expected Result: Map displays with abstract coordinates
    Evidence: .sisyphus/evidence/task-14-map-canvas.png
  ```

  **Commit**: YES
  - Message: `feat: add Leaflet map component with CRS.Simple`
  - Files: frontend-react/src/components/map/MapCanvas.tsx, frontend-react/src/components/map/MapCanvas.css

---

- [x] 15. Polygon Drawing Controls

  **What to do**:
  - Create `src/components/map/PolygonDrawing.tsx`:
    - Integrate leaflet-draw with react-leaflet
    - Enable polygon drawing mode
    - Handle events:
      - `onCreated`: new polygon drawn
      - `onEdited`: polygon modified
      - `onDeleted`: polygon removed
    - Drawing options:
      - Allow only polygon shapes (not markers, circles, etc.)
      - Set snap tolerance
      - Show area tooltip while drawing
    - Export drawn polygon coordinates as GeoJSON-style
  - Create `src/components/map/DrawingControls.tsx`:
    - UI buttons for: draw, edit, delete, cancel
    - Mode indicator (drawing/editing/viewing)
  - Integrate with MapCanvas component

  **Must NOT do**:
  - Do not add farmland form yet (Task 16)
  - Do not persist data (just UI)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex interactive drawing UI
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 16, 17, 18, 19)
  - **Blocks**: Tasks 16, 22
  - **Blocked By**: Task 14

  **References**:
  - Leaflet.draw: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
  - react-leaflet-draw: https://github.com/alex3165/react-leaflet-draw
  - Existing: `frontend/components/echarts_editor.py` - existing drawing implementation

  **Acceptance Criteria**:
  - [ ] Users can draw polygons on map
  - [ ] Drawn polygon coordinates extracted correctly
  - [ ] Edit mode allows vertex modification
  - [ ] Delete removes polygon
  - [ ] Coordinates in [[x,y], [x,y], ...] format

  **QA Scenarios**:
  ```
  Scenario: User can draw a polygon
    Tool: Playwright
    Steps:
      1. Navigate to farmland create page
      2. Click "Draw" button
      3. Click 4 points on map to create rectangle
      4. Click first point to close polygon
      5. Verify polygon created with 5 coordinates (closed)
    Expected Result: Polygon created, coordinates logged
    Evidence: .sisyphus/evidence/task-15-draw-polygon.png

  Scenario: User can edit polygon vertices
    Tool: Playwright
    Steps:
      1. Draw a polygon
      2. Click "Edit" button
      3. Drag a vertex to new position
      4. Save changes
      5. Verify coordinates updated
    Expected Result: Polygon modified successfully
    Evidence: .sisyphus/evidence/task-15-edit-polygon.png
  ```

  **Commit**: YES
  - Message: `feat: add polygon drawing controls with leaflet-draw`
  - Files: frontend-react/src/components/map/PolygonDrawing.tsx, frontend-react/src/components/map/DrawingControls.tsx

---

- [x] 16. Farmland Form Component

  **What to do**:
  - Create `src/components/farmland/FarmlandForm.tsx`:
    - Form fields:
      - `name`: text input (required, 1-100 chars)
      - `crop_type`: select dropdown (水稻, 小麦, 玉米, 大豆, 棉花, 油菜, 其他)
      - `area`: read-only, calculated from polygon
    - Validation with react-hook-form + zod
    - Props:
      - `initialData`: for edit mode
      - `polygonCoords`: drawn polygon coordinates
      - `onSubmit`: form submission handler
      - `onCancel`: cancel handler
  - Create `src/utils/geometry.ts`:
    - Port `calculate_polygon_area()` from Python
    - Format area display (亩)
  - Show area calculation in real-time as polygon changes

  **Must NOT do**:
  - Do not submit to API (handled by parent)
  - Do not duplicate backend validation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard form component with validation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 17, 18, 19)
  - **Blocks**: Task 22
  - **Blocked By**: Task 15

  **References**:
  - Pattern: `frontend/pages/farmland_list.py:340-573` - existing form UI
  - Backend: `backend/models.py:FarmlandCreate` - validation rules
  - react-hook-form: https://react-hook-form.com/

  **Acceptance Criteria**:
  - [ ] Form renders all fields
  - [ ] Validation works (required, length)
  - [ ] Area calculated and displayed
  - [ ] Submit passes data to parent

  **QA Scenarios**:
  ```
  Scenario: Form validates required fields
    Tool: Playwright
    Steps:
      1. Render FarmlandForm with polygon
      2. Leave name empty
      3. Click submit
      4. Check for validation error
    Expected Result: "Name is required" error shown
    Evidence: .sisyphus/evidence/task-16-form-validation.png

  Scenario: Area calculated from polygon
    Tool: Jest
    Steps:
      1. Render form with polygon coords
      2. Check area field value
    Expected Result: Area matches shoelace calculation
    Evidence: .sisyphus/evidence/task-16-area-calc.log
  ```

  **Commit**: YES
  - Message: `feat: add farmland form component`
  - Files: frontend-react/src/components/farmland/FarmlandForm.tsx, frontend-react/src/utils/geometry.ts

---

- [x] 17. Farmland List Component

  **What to do**:
  - Create `src/components/farmland/FarmlandList.tsx`:
    - Display list of farmlands with:
      - Name, crop type, area
      - Mini map preview (static polygon)
      - Created date
    - Actions: view, edit, delete
    - Empty state: "No farmlands yet, create one!"
    - Loading state while fetching
  - Create `src/components/farmland/FarmlandCard.tsx`:
    - Individual farmland card component
    - Color-coded by crop type
    - Click to view/edit
  - Fetch data from API on mount

  **Must NOT do**:
  - Do not implement edit/delete logic (Task 18)
  - Do not create new farmlands (handled elsewhere)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard list component with API integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 18, 19)
  - **Blocks**: Tasks 18, 22
  - **Blocked By**: Task 4

  **References**:
  - Pattern: `frontend/pages/farmland_list.py:575-720` - existing list UI
  - API: `farmlandAPI.getAll()` from Task 4
  - Colors: `frontend/pages/visualization.py:CROP_COLORS` - existing color mapping

  **Acceptance Criteria**:
  - [ ] List displays all user's farmlands
  - [ ] Each card shows name, crop, area
  - [ ] Empty state shown when no farmlands
  - [ ] Loading state during fetch

  **QA Scenarios**:
  ```
  Scenario: List displays farmlands
    Tool: Playwright
    Steps:
      1. Login and navigate to /farmlands
      2. Wait for data load
      3. Verify farmland cards visible
    Expected Result: Farmland list populated
    Evidence: .sisyphus/evidence/task-17-list-display.png

  Scenario: Empty state when no farmlands
    Tool: Playwright
    Steps:
      1. Login with new user (no farmlands)
      2. Navigate to /farmlands
      3. Check for empty state message
    Expected Result: "No farmlands yet" message shown
    Evidence: .sisyphus/evidence/task-17-empty-state.png
  ```

**Commit**: YES
  - Message: `feat: add path visualization component`
  - Files: frontend-react/src/components/path/PathVisualization.tsx, frontend-react/src/components/path/PathInfo.tsx

---

- [x] 20. Dashboard/Landing Page

  **What to do**:
  - Create `src/pages/Dashboard.tsx`:
    - Welcome message with username
    - Quick stats:
      - Total farmlands count
      - Total area
      - Recent activity
    - Quick actions:
      - "Create New Farmland" button
      - "Plan Flight Path" button
    - Recent farmlands preview (last 3)
  - Fetch stats from API
  - Responsive layout

  **Must NOT do**:
  - Do not duplicate farmland list page
  - Do not implement complex analytics

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Dashboard UI with data visualization
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 21, 22, 23, 24)
  - **Blocks**: None
  - **Blocked By**: None (can start early)

  **References**:
  - Pattern: `frontend/pages/visualization.py:138-196` - stats panel pattern
  - Colors: Use existing gradient styles from Streamlit

  **Acceptance Criteria**:
  - [ ] Dashboard shows welcome message
  - [ ] Stats display correctly
  - [ ] Quick action buttons work
  - [ ] Recent farmlands shown

  **QA Scenarios**:
  ```
  Scenario: Dashboard loads with user data
    Tool: Playwright
    Steps:
      1. Login and navigate to /
      2. Check for username in welcome
      3. Verify stats loaded
    Expected Result: Dashboard populated with user data
    Evidence: .sisyphus/evidence/task-20-dashboard.png
  ```

  **Commit**: YES
  - Message: `feat: add dashboard page`
  - Files: frontend-react/src/pages/Dashboard.tsx

---

- [x] 21. Full Auth Flow Integration

  **What to do**:
  - Integrate all auth components:
    - Login → Dashboard redirect
    - Register → Login redirect
    - Logout → Login redirect
    - Token refresh handling
    - Auto-logout on token expiry
  - Add global error handling:
    - 401: redirect to login
    - Network errors: show toast
  - Test complete auth flow end-to-end:
    - Register → Login → Access protected routes → Logout

  **Must NOT do**:
  - Do not change backend auth logic
  - Do not implement remember-me (optional feature)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Integration of multiple auth components, edge case handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 22, 23, 24)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 7, 8, 9, 5

  **References**:
  - Components: LoginForm (Task 7), RegisterForm (Task 8), ProtectedRoute (Task 9)
  - Context: AuthContext (Task 5)
  - Backend: `backend/auth.py` - JWT with 24h expiry

  **Acceptance Criteria**:
  - [ ] Complete auth flow works
  - [ ] Token persists across refresh
  - [ ] Auto-logout on 401
  - [ ] Network errors handled gracefully

  **QA Scenarios**:
  ```
  Scenario: Complete auth flow works
    Tool: Playwright
    Steps:
      1. Navigate to /register
      2. Register new user
      3. Verify redirect to /login
      4. Login with new credentials
      5. Verify redirect to /
      6. Access /farmlands successfully
      7. Click logout
      8. Verify redirect to /login
    Expected Result: All auth steps succeed
    Evidence: .sisyphus/evidence/task-21-auth-flow.png
  ```

  **Commit**: YES
  - Message: `feat: integrate full authentication flow`
  - Files: frontend-react/src/App.tsx, frontend-react/src/services/api.ts

---

- [x] 22. Farmland CRUD Integration

  **What to do**:
  - Create `src/pages/FarmlandList.tsx`:
    - Combine FarmlandList, FarmlandForm, FarmlandEdit components
    - Handle create flow:
      - Show map with drawing controls
      - Capture polygon coordinates
      - Show form with calculated area
      - Submit to API
      - Refresh list on success
    - Handle edit flow:
      - Load farmland data
      - Show edit modal/page
      - Update on save
    - Handle delete:
      - Confirmation dialog
      - API call
      - Remove from list
  - Add toast notifications for success/error

  **Must NOT do**:
  - Do not create new components (use existing)
  - Do not modify backend

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Integration of multiple components with complex state
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 23, 24)
  - **Blocks**: Task 23
  - **Blocked By**: Tasks 21, 16, 17, 18, 15

  **References**:
  - Components: FarmlandList (Task 17), FarmlandForm (Task 16), FarmlandEdit (Task 18)
  - Map: PolygonDrawing (Task 15)
  - API: `farmlandAPI` from Task 4

  **Acceptance Criteria**:
  - [ ] Create farmland flow works
  - [ ] Edit farmland flow works
  - [ ] Delete farmland flow works
  - [ ] List updates after changes

  **QA Scenarios**:
  ```
  Scenario: Create farmland end-to-end
    Tool: Playwright
    Steps:
      1. Login and navigate to /farmlands
      2. Click "Create New Farmland"
      3. Draw a polygon on map
      4. Fill form (name, crop type)
      5. Click "Create"
      6. Verify new farmland in list
    Expected Result: Farmland created and visible in list
    Evidence: .sisyphus/evidence/task-22-create-farmland.png

  Scenario: Delete farmland end-to-end
    Tool: Playwright
    Steps:
      1. Create a farmland
      2. Click "Delete"
      3. Confirm deletion
      4. Verify farmland removed from list
    Expected Result: Farmland deleted
    Evidence: .sisyphus/evidence/task-22-delete-farmland.png
  ```

  **Commit**: YES
  - Message: `feat: integrate farmland CRUD operations`
  - Files: frontend-react/src/pages/FarmlandList.tsx

---

- [x] 23. Path Planning UI Integration

  **What to do**:
  - Create `src/pages/PathPlanning.tsx`:
    - Farmland selector (dropdown or list)
    - Configuration options:
      - Swath width input
      - Use DL optimization checkbox
    - "Generate Path" button
    - Path visualization (from Task 19)
    - Path info panel
    - Export options:
      - Export waypoints as JSON
      - Copy to clipboard
  - Handle loading states
  - Show errors if path generation fails

  **Must NOT do**:
  - Do not implement DJI export (out of scope)
  - Do not implement multi-field planning (MVP)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Integration of path planning with UI
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 22, 24)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 22, 19, 13

  **References**:
  - Components: PathVisualization (Task 19), PathInfo (Task 19)
  - API: `pathPlanningAPI.generate()` from Task 4
  - Backend: `backend/path_planning/routes.py` - API endpoint

  **Acceptance Criteria**:
  - [ ] Farmland selection works
  - [ ] Path generation triggers API
  - [ ] Path displays on map
  - [ ] Stats show correctly
  - [ ] Export works

  **QA Scenarios**:
  ```
  Scenario: Generate and display path
    Tool: Playwright
    Steps:
      1. Login and navigate to /path-planning
      2. Select a farmland from dropdown
      3. Set swath width to 10
      4. Click "Generate Path"
      5. Wait for path to render
      6. Check path visualization
      7. Check path info panel
    Expected Result: Path generated and displayed
    Evidence: .sisyphus/evidence/task-23-path-planning.png

  Scenario: Export path as JSON
    Tool: Playwright
    Steps:
      1. Generate a path
      2. Click "Export JSON"
      3. Verify download initiated
    Expected Result: JSON file downloaded
    Evidence: .sisyphus/evidence/task-23-export.json
  ```

  **Commit**: YES
  - Message: `feat: integrate path planning UI`
  - Files: frontend-react/src/pages/PathPlanning.tsx

---

- [x] 24. Remove Old Streamlit Frontend

  **What to do**:
  - Delete `/frontend/` directory (Streamlit app)
  - Update `run_all.py`:
    - Remove Streamlit startup
    - Add React dev server startup
    - Update ports (React: 5173, Backend: 8000)
  - Update README.md:
    - Remove Streamlit instructions
    - Add React instructions
    - Update project structure
  - Update AGENTS.md:
    - Remove Streamlit commands
    - Add React commands
  - Clean up any Streamlit-specific files

  **Must NOT do**:
  - Do not delete backend code
  - Do not delete data files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File deletion and documentation update
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 22, 23)
  - **Blocks**: None
  - **Blocked By**: Task 23 (verify React works first)

  **References**:
  - Delete: `/frontend/` directory
  - Update: `run_all.py`, `README.md`, `AGENTS.md`

  **Acceptance Criteria**:
  - [ ] `/frontend/` directory deleted
  - [ ] `run_all.py` updated for React
  - [ ] README updated
  - [ ] AGENTS.md updated
  - [ ] No references to Streamlit remain

  **QA Scenarios**:
  ```
  Scenario: Streamlit code removed
    Tool: Bash
    Steps:
      1. find . -name "*.py" -exec grep -l "streamlit" {} \;
    Expected Result: No Python files import streamlit
    Evidence: .sisyphus/evidence/task-24-cleanup.log

  Scenario: React app starts via run_all.py
    Tool: Bash
    Steps:
      1. python run_all.py &
      2. sleep 10
      3. curl http://localhost:5173
      4. curl http://localhost:8000/docs
    Expected Result: Both servers running
    Evidence: .sisyphus/evidence/task-24-run-all.log
  ```

  **Commit**: YES
  - Message: `refactor: remove Streamlit frontend, update for React`
  - Files: run_all.py, README.md, AGENTS.md, (delete frontend/)

- [x] 18. Farmland Edit/Delete

  **What to do**:
  - Create `src/components/farmland/FarmlandEdit.tsx`:
    - Modal or separate page for editing
    - Load existing farmland data
    - Show polygon on map (editable)
    - Pre-fill form with existing values
    - Save calls `farmlandAPI.update(id, data)`
    - Delete confirmation dialog
  - Handle errors:
    - Farmland not found
    - Unauthorized (not owner)
    - Validation errors
  - Show success/error toasts

  **Must NOT do**:
  - Do not allow editing other users' farmlands
  - Do not implement new farmland creation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard edit/delete with API integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 17, 19)
  - **Blocks**: Task 22
  - **Blocked By**: Task 17

  **References**:
  - Pattern: `frontend/pages/farmland_list.py:600-711` - existing edit UI
  - API: `farmlandAPI.update()`, `farmlandAPI.delete()` from Task 4
  - Backend: `backend/farmland.py:update_farmland_endpoint()` - update logic

  **Acceptance Criteria**:
  - [ ] Edit loads existing farmland data
  - [ ] Polygon shows on map and is editable
  - [ ] Save updates farmland via API
  - [ ] Delete requires confirmation
  - [ ] Success/error feedback shown

  **QA Scenarios**:
  ```
  Scenario: User can edit farmland
    Tool: Playwright
    Steps:
      1. Login and navigate to farmlands
      2. Click "Edit" on a farmland
      3. Change name
      4. Click "Save"
      5. Verify updated name in list
    Expected Result: Farmland updated successfully
    Evidence: .sisyphus/evidence/task-18-edit-success.png

  Scenario: Delete requires confirmation
    Tool: Playwright
    Steps:
      1. Click "Delete" on a farmland
      2. Check for confirmation dialog
      3. Click "Cancel"
      4. Verify farmland still exists
    Expected Result: Delete cancelled, farmland preserved
    Evidence: .sisyphus/evidence/task-18-delete-cancel.png
  ```

  **Commit**: YES
  - Message: `feat: add farmland edit and delete functionality`
  - Files: frontend-react/src/components/farmland/FarmlandEdit.tsx

---

- [x] 19. Path Visualization Component

  **What to do**:
  - Create `src/components/path/PathVisualization.tsx`:
    - Display drone flight path on map:
      - Show farmland polygon (filled, semi-transparent)
      - Show flight path as polyline (different color)
      - Show waypoints as markers
      - Show start/end points
    - Controls:
      - Play/pause animation (optional)
      - Show/hide waypoints
      - Path info panel (distance, waypoint count)
  - Create `src/components/path/PathInfo.tsx`:
    - Display path statistics:
      - Total distance
      - Waypoint count
      - Estimated flight time
      - Swath width used
  - Fetch path from API on farmland selection

  **Must NOT do**:
  - Do not implement path generation (backend handles)
  - Do not create actual drone animation (just visualize static path)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Map visualization with path overlay
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 17, 18)
  - **Blocks**: Task 23
  - **Blocked By**: Task 14, Task 13 (API)

  **References**:
  - Leaflet polylines: https://leafletjs.com/reference.html#polyline
  - Markers: https://leafletjs.com/reference.html#marker
  - API: `pathPlanningAPI.generate(farmlandId)` from Task 4

  **Acceptance Criteria**:
  - [ ] Path renders as polyline on map
  - [ ] Waypoints marked clearly
  - [ ] Path stays within polygon bounds
  - [ ] Info panel shows statistics

  **QA Scenarios**:
  ```
  Scenario: Path visualization displays correctly
    Tool: Playwright
    Steps:
      1. Navigate to path planning page
      2. Select a farmland
      3. Click "Generate Path"
      4. Wait for path to render
      5. Check for polyline and waypoints
    Expected Result: Path displayed on map with waypoints
    Evidence: .sisyphus/evidence/task-19-path-viz.png

  Scenario: Path info shows correct statistics
    Tool: Jest
    Steps:
      1. Render PathInfo with mock path data
      2. Check displayed values
    Expected Result: Correct distance and waypoint count
    Evidence: .sisyphus/evidence/task-19-path-info.log
  ```

  **Commit**: YES
  - Message: `feat: add path visualization component`
  - Files: frontend-react/src/components/path/PathVisualization.tsx, frontend-react/src/components/path/PathInfo.tsx

## Success Criteria

### Verification Commands
```bash
# Frontend
cd frontend-react && npm run dev
# Visit http://localhost:5173

# Backend
cd backend && uvicorn main:app --reload
# Visit http://localhost:8000/docs

# Tests
cd frontend-react && npm test
```

### Final Checklist
- [ ] React app serves at localhost:5173
- [ ] Backend API serves at localhost:8000
- [ ] Users can register and login
- [ ] JWT token stored and used for protected routes
- [ ] Leaflet map displays with polygon drawing enabled
- [ ] Drawn polygons save to backend as farmlands
- [ ] Path planning generates waypoints for selected farmland
- [ ] Jest tests pass
- [ ] No Streamlit code remaining