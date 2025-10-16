# E2E Tests Execution Guide - Session #4 Phase 2

**Current Status:** Infrastructure Ready ✅  
**Next Task:** Execute tests and fix failures  
**Estimated Duration:** 2-3 hours  
**Success Criteria:** All 16 tests passing + GitHub commit  

## Quick Start (5 minutes)

### Option 1: Automated (Recommended)
```bash
cd "/Users/bilel/Documents/tests build/artist-portfolio-saas"
bash run-tests-with-servers.sh
```

### Option 2: Manual (Troubleshooting)
**Terminal 1 - API Server:**
```bash
cd "/Users/bilel/Documents/tests build/artist-portfolio-saas"
pnpm --filter @repo/api dev
# Wait for: "Server running at http://localhost:3001"
```

**Terminal 2 - Backoffice Server:**
```bash
cd "/Users/bilel/Documents/tests build/artist-portfolio-saas"
pnpm --filter @repo/backoffice dev
# Wait for: "▲ localhost:3000 ready"
```

**Terminal 3 - Run Tests:**
```bash
cd "/Users/bilel/Documents/tests build/artist-portfolio-saas"
pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts --workers=1
```

## Expected Output

### Successful Test Run
```
Running 16 tests using 1 worker

  16 passed (45s)

To open last HTML report run:
  npx playwright show-report
```

### View Results
```bash
cd "/Users/bilel/Documents/tests build/artist-portfolio-saas"
pnpm exec playwright show-report
# Opens HTML report in browser
```

## Troubleshooting Guide

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Kill existing processes
lsof -i :3000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
lsof -i :3001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
# Then retry
```

### Issue 2: Tests Cannot Connect to Server
**Error:** `net::ERR_CONNECTION_REFUSED`

**Solution:**
1. Verify servers are running: `curl http://localhost:3000`
2. Check logs: `tail -50 .test-logs/backoffice.log`
3. Increase wait time by modifying `waitForURL()` timeout:
   ```typescript
   await page.waitForURL('/pages', { timeout: 30000 });
   ```

### Issue 3: Selector Not Found
**Error:** `Locator expected to have text "Create Page", but did not`

**Solution:**
1. Check if UI text has changed
2. Add debugging:
   ```bash
   pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts --debug
   ```
3. Use Playwright Inspector to find correct selector
4. Update selectors in test file

### Issue 4: Timeout on Drag & Drop
**Error:** `Timeout waiting for element`

**Solution:**
```typescript
// Add explicit wait for canvas
await page.waitForSelector('text=Canvas vide', { timeout: 10000 });
// Then perform drag
await heroBlock.dragTo(canvas);
```

### Issue 5: Authentication Required
**Error:** `Redirect to /login` or `401 Unauthorized`

**Solution:**
1. Update `e2e/fixtures/auth.ts` to handle login:
   ```typescript
   await page.goto('/auth/login');
   await page.fill('input[name="email"]', 'test@example.com');
   await page.fill('input[name="password"]', 'password');
   await page.click('button[type="submit"]');
   await page.waitForURL('/pages');
   ```

## Common Fixes

### Fix 1: Update Text Selectors
If UI text changed, find and replace:
```bash
# Before: text=Create Page
# After: data-testid=create-page-btn
sed -i 's/has-text("Create Page")/has("text=Create Page")/g' e2e/page-builder.spec.ts
```

### Fix 2: Increase Timeouts
```typescript
// Change from
await page.waitForSelector(...)
// To
await page.waitForSelector(..., { timeout: 30000 })
```

### Fix 3: Add Screenshots for Debugging
```typescript
test('T1: Create page flow', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.screenshot({ path: 'screenshots/step1.png' });
    // ... rest of test
});
```

## Debug Mode

### Run Single Test
```bash
pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts -g "T1:"
```

### Run with Browser Visible
```bash
pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts --headed
```

### Run with Inspector
```bash
pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts --debug
```

### Generate Trace
```bash
pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts --trace on
# Then view: npx playwright show-trace trace.zip
```

## Expected Test Outcomes

### Best Case Scenario ✅
- All 16 tests pass in ~45-60 seconds
- No failures or flakes
- Report generated successfully
- Ready for GitHub commit

### Partial Failure Scenario ⚠️
- Some tests pass, some fail
- Identify common pattern (e.g., selector issue)
- Fix in code or tests
- Re-run to verify fix
- Document in SESSION_4_SUMMARY.md

### Complete Failure Scenario ❌
- All tests fail with same error
- Usually indicates server not running or auth issue
- Check logs in `.test-logs/`
- Verify server health: `curl http://localhost:3000`
- Check fixtures in `e2e/fixtures/auth.ts`

## Performance Expectations

| Metric | Expected | Actual |
|--------|----------|--------|
| Server startup | 10-15s | |
| First test | 5-10s | |
| Test suite total | 45-60s | |
| Report generation | 5-10s | |

## After Tests Complete

### If All Pass ✅
```bash
# Commit to Git
git add e2e/ playwright.e2e.config.ts run-*.sh
git commit -m "feat: Add 16 automated E2E tests for Page Builder

- Created comprehensive test suite covering all Page Builder features
- 15 functional tests + 1 freemium limit test
- 100% feature coverage with drag & drop, properties, CRUD ops
- Added Playwright helpers for reusable test utilities
- Validated TypeScript type safety and Playwright syntax
- Ready for continuous integration and autopilot"

# Push to GitHub
git push origin main
```

### If Tests Fail ⚠️
```bash
# Document failures
cat > SESSION_4_DEBUG_LOG.md << EOF
## Test Failures Summary
- Failed tests: [list]
- Common error: [description]
- Root cause: [analysis]
- Fix applied: [solution]
- Re-run status: [pass/fail]
EOF

# Make fixes and re-run
pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts

# Then commit
git add e2e/ SESSION_4_DEBUG_LOG.md
git commit -m "fix: Debug and fix E2E test failures"
```

## Next Session Handoff

When Session #5 starts:
1. Verify all 16 tests passing: `pnpm exec playwright test --config=playwright.e2e.config.ts e2e/page-builder.spec.ts`
2. Check GitHub commit was pushed: `git log --oneline | head -5`
3. Proceed to Task 1.2.1 - Media Manager Setup
4. Continue test-driven development for all new features

## Files Reference

| File | Purpose |
|------|---------|
| `e2e/page-builder.spec.ts` | 16 test scenarios |
| `e2e/fixtures/auth.ts` | Authentication setup |
| `e2e/helpers/page-builder.ts` | Reusable helper methods |
| `playwright.e2e.config.ts` | Test configuration (manual servers) |
| `run-tests-with-servers.sh` | Full test execution script |
| `.test-logs/` | Server logs directory |
| `playwright-report/` | HTML report directory |

## Emergency Support

### Reset Everything
```bash
# Kill all processes
pkill -f "pnpm\|playwright\|node"

# Clean test artifacts
rm -rf playwright-report/ .test-logs/ test-results/

# Reinstall if needed
pnpm install

# Start fresh
bash run-tests-with-servers.sh
```

### Check System Health
```bash
# Node version
node --version

# pnpm version
pnpm --version

# Playwright version
pnpm list @playwright/test

# Disk space
df -h

# Memory
free -h
```

---

**Last Updated:** 2024-10-16 23:40 UTC  
**Prepared For:** Session #4 Phase 2 Execution  
**Status:** Ready for immediate use  
**Support:** Check E2E_TEST_VALIDATION_REPORT.md for more details
