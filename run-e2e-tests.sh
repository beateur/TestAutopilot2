#!/bin/bash

# Script pour exécuter les tests E2E

cd /Users/bilel/Documents/tests\ build/artist-portfolio-saas

# Vérifier que les serveurs sont en cours d'exécution
echo "Vérification des serveurs..."
sleep 2

# Exécuter les tests Playwright
echo "Démarrage des tests E2E..."
pnpm exec playwright test --config=playwright.config.ts e2e/page-builder.spec.ts --workers=1

# Afficher le rapport
echo ""
echo "=== Rapport de test disponible ==="
echo "Exécutez: pnpm exec playwright show-report"
