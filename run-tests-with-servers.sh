#!/bin/bash

# Script pour démarrer les serveurs et les tests E2E en parallèle

set -e  # Exit on error

WORKSPACE_DIR="/Users/bilel/Documents/tests build/artist-portfolio-saas"
LOG_DIR="$WORKSPACE_DIR/.test-logs"
mkdir -p "$LOG_DIR"

echo "=================================================="
echo "Session #4 - E2E Test Execution"
echo "=================================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    kill %1 %2 2>/dev/null || true
    wait 2>/dev/null || true
}

trap cleanup EXIT

cd "$WORKSPACE_DIR"

echo "✓ Dossier de travail: $WORKSPACE_DIR"
echo ""

# Check if ports are available
echo "Vérification des ports..."
if lsof -i :3001 >/dev/null 2>&1; then
    echo "⚠ Port 3001 (API) déjà utilisé"
else
    echo "✓ Port 3001 disponible"
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠ Port 3000 (Backoffice) déjà utilisé"
else
    echo "✓ Port 3000 disponible"
fi

echo ""
echo "Démarrage des serveurs..."

# Start API server
echo "→ Démarrage du serveur API (port 3001)..."
pnpm --filter @repo/api dev > "$LOG_DIR/api.log" 2>&1 &
API_PID=$!
echo "  PID: $API_PID"

# Start backoffice server  
echo "→ Démarrage du serveur Backoffice (port 3000)..."
pnpm --filter @repo/backoffice dev > "$LOG_DIR/backoffice.log" 2>&1 &
BACKOFFICE_PID=$!
echo "  PID: $BACKOFFICE_PID"

echo ""
echo "Attente du démarrage des serveurs (10 secondes)..."
sleep 10

# Check if servers are running
echo ""
echo "Vérification des serveurs..."

API_READY=false
BACKOFFICE_READY=false

for i in {1..10}; do
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
        echo "✓ API serveur répondu"
        API_READY=true
    fi
    
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "✓ Backoffice serveur répondu"
        BACKOFFICE_READY=true
    fi
    
    if [ "$API_READY" = true ] && [ "$BACKOFFICE_READY" = true ]; then
        break
    fi
    
    if [ $i -lt 10 ]; then
        sleep 2
    fi
done

if [ "$API_READY" = false ] || [ "$BACKOFFICE_READY" = false ]; then
    echo ""
    echo "⚠ Les serveurs n'ont pas démarré correctement"
    echo "API: $API_READY"
    echo "Backoffice: $BACKOFFICE_READY"
    echo ""
    echo "Logs API: $LOG_DIR/api.log"
    echo "Logs Backoffice: $LOG_DIR/backoffice.log"
    exit 1
fi

echo ""
echo "=================================================="
echo "Tous les serveurs sont prêts!"
echo "=================================================="
echo ""

# Run tests
echo "Exécution des tests E2E..."
echo ""

pnpm exec playwright test \
    --config=playwright.e2e.config.ts \
    e2e/page-builder.spec.ts \
    --workers=1 \
    --reporter=html

TEST_RESULT=$?

echo ""
echo "=================================================="
if [ $TEST_RESULT -eq 0 ]; then
    echo "✓ TOUS LES TESTS RÉUSSIS!"
else
    echo "✗ Certains tests ont échoué (code: $TEST_RESULT)"
fi
echo "=================================================="
echo ""
echo "Rapport HTML: pnpm exec playwright show-report"
echo ""

exit $TEST_RESULT
