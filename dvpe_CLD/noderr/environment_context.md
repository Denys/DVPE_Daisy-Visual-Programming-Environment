# DVPE Development Environment Context

**Environment Type**: LOCAL DEVELOPMENT (Windows 11 + Node.js)
**Application Type**: Tauri Desktop App (React + Vite frontend, no production web URL)

---

## Platform Detection

```
Platform: Windows 11 (10.0.22621)
Shell: bash (Git Bash / MSYS2)
Node: v20+ (check with: node --version)
npm: v10+ (check with: npm --version)
```

---

## Critical Discovery Results

### Working Directory
```
dvpe_CLD/   ← ALL commands run from this directory
```

### Package Manager
```
npm (not yarn, not bun)
Install command: npm install
```

### Development Server
```
Command: npm run dev
URL: http://localhost:1420
Description: Vite dev server — PRIMARY testing URL
Note: Port 1420 is Tauri standard
```

### Access URLs
```yaml
access_urls:
  local_dev_preview:
    url: "http://localhost:1420"
    description: "Primary development testing URL — USE THIS FOR ALL TESTING"
  public_deployed_app:
    url: "N/A — Desktop app only"
    description: "No public web URL. Tauri builds local binary only."
```

### Build Command
```
npm run build
Output: dvpe_CLD/dist/
Description: TypeScript compile (tsc) + Vite bundle
```

### Test Command
```
npm test            ← Interactive watch mode
npm run test:coverage ← Coverage report
Framework: Vitest 4.0.16
Test env: jsdom
Config: vite.config.ts
```

### Lint Command
```
npm run lint
Tool: ESLint 9.x with TypeScript parser
```

### Tauri Desktop Build
```
npm run tauri:build   ← Full desktop build
npm run tauri:dev     ← Tauri dev mode with hot reload
Note: Requires Rust + Tauri CLI installed separately
```

### Git Operations
```
# From workspace root (DVPE_Daisy-Visual-Programming-Environment/)
git status
git add dvpe_CLD/
git commit -m "message"

# Current branch: main
```

---

## Technology Versions (Verified from package.json)

| Tool | Version |
|------|---------|
| React | 18.3.1 |
| TypeScript | 5.7.2 |
| Vite | 6.0.3 |
| @xyflow/react | 12.3.6 |
| Zustand | 5.0.2 |
| Immer | 10.0.3 |
| Tailwind CSS | 3.4.17 |
| Framer Motion | 11.15.0 |
| @monaco-editor/react | 4.7.0 |
| JSZip | 3.10.1 |
| Vitest | 4.0.16 |
| Tauri | 1.x |

---

## Critical Environment Notes

### Windows Path Separators
- Source uses forward slashes in imports (TypeScript standard)
- Bash commands use forward slashes

### Tauri-Specific
- File dialogs require Tauri runtime (`@tauri-apps/api`)
- Fallback: browser file download (no Tauri required for web testing)
- Plugin versions: api@1.6.0, plugin-dialog@2.0.0, plugin-fs@2.0.0, plugin-shell@2.0.0

### Test Environment
- Tests run in jsdom (browser simulation)
- Setup file: `src/test/setup.ts`
- Testing Library version: @testing-library/react 16.1.0

### Code Splitting (Vite)
Vendor chunks configured for: react, reactflow, monaco, framer-motion, ui-components, jszip

---

## Standard Workflow Commands

```bash
# 1. Start development
cd dvpe_CLD
npm run dev
# Open: http://localhost:1420

# 2. Run tests
npm test

# 3. Run tests with coverage
npm run test:coverage

# 4. Build production
npm run build

# 5. Lint check
npm run lint

# 6. Git commit (from workspace root)
cd ..
git add dvpe_CLD/
git commit -m "feat: description"
```

---

**CONFIRMED**: This is the DEVELOPMENT environment. localhost:1420 for all testing.
