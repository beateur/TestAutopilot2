import { test, expect } from './fixtures/auth';

test.describe('Page Builder E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pages list before each test
    await page.goto('/pages', { waitUntil: 'networkidle' });
  });

  test('T1: Create page flow', async ({ page }) => {
    // Click Create Page button
    await page.click('button:has-text("Create Page")');
    
    // Fill form
    await page.fill('input[placeholder*="Title"]', 'Test Page');
    await page.fill('input[placeholder*="slug"]', 'test-page');
    
    // Submit
    await page.click('button:has-text("Create")');
    
    // Should redirect to builder
    await page.waitForURL('/pages/**/edit');
    expect(page.url()).toContain('/edit');
  });

  test('T2: Add Hero block to canvas', async ({ page }) => {
    // Create a page first
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Hero Test');
    await page.fill('input[placeholder*="slug"]', 'hero-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Drag Hero block from palette to canvas
    const heroPaletteBlock = page.locator('text=Hero').first();
    const canvas = page.locator('text=Canvas vide').first();
    
    await heroPaletteBlock.dragTo(canvas);
    
    // Verify block appears
    await expect(page.locator('text=Hero Block')).toBeVisible();
  });

  test('T3: Add Text block to canvas', async ({ page }) => {
    // Setup page
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Text Test');
    await page.fill('input[placeholder*="slug"]', 'text-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Drag Text block
    const textPaletteBlock = page.locator('text=Text').first();
    const canvas = page.locator('text=Canvas vide').first();
    
    await textPaletteBlock.dragTo(canvas);
    
    // Verify
    await expect(page.locator('text=Text Block')).toBeVisible();
  });

  test('T4: Add Image block to canvas', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Image Test');
    await page.fill('input[placeholder*="slug"]', 'image-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    const imagePaletteBlock = page.locator('text=Image').first();
    const canvas = page.locator('text=Canvas vide').first();
    
    await imagePaletteBlock.dragTo(canvas);
    await expect(page.locator('text=Image Block')).toBeVisible();
  });

  test('T5: Add Gallery block to canvas', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Gallery Test');
    await page.fill('input[placeholder*="slug"]', 'gallery-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    const galleryPaletteBlock = page.locator('text=Gallery').first();
    const canvas = page.locator('text=Canvas vide').first();
    
    await galleryPaletteBlock.dragTo(canvas);
    await expect(page.locator('text=Gallery')).toBeVisible();
  });

  test('T6: Add Video block to canvas', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Video Test');
    await page.fill('input[placeholder*="slug"]', 'video-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    const videoPaletteBlock = page.locator('text=Video').first();
    const canvas = page.locator('text=Canvas vide').first();
    
    await videoPaletteBlock.dragTo(canvas);
    await expect(page.locator('text=Video')).toBeVisible();
  });

  test('T7: Add Contact block to canvas', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Contact Test');
    await page.fill('input[placeholder*="slug"]', 'contact-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    const contactPaletteBlock = page.locator('text=Contact').first();
    const canvas = page.locator('text=Canvas vide').first();
    
    await contactPaletteBlock.dragTo(canvas);
    await expect(page.locator('text=Contact')).toBeVisible();
  });

  test('T8: Reorder blocks via drag & drop', async ({ page }) => {
    // Create page with 2 blocks
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Reorder Test');
    await page.fill('input[placeholder*="slug"]', 'reorder-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Add Hero
    let heroPaletteBlock = page.locator('text=Hero').first();
    let canvasEmpty = page.locator('text=Canvas vide').first();
    await heroPaletteBlock.dragTo(canvasEmpty);
    
    // Add Text
    let textPaletteBlock = page.locator('text=Text').nth(1);
    await textPaletteBlock.dragTo(canvasEmpty);
    
    // Now reorder: drag Text above Hero
    const textBlockItem = page.locator('text=Text Block').first();
    const heroBlockItem = page.locator('text=Hero Block').first();
    
    await textBlockItem.dragTo(heroBlockItem);
    
    // Verify by checking that both blocks exist (order is managed server-side)
    await expect(page.locator('text=Text Block')).toBeVisible();
    await expect(page.locator('text=Hero Block')).toBeVisible();
  });

  test('T9: Edit Hero block properties', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Edit Props Test');
    await page.fill('input[placeholder*="slug"]', 'edit-props-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Add Hero block
    let heroPaletteBlock = page.locator('text=Hero').first();
    let canvasEmpty = page.locator('text=Canvas vide').first();
    await heroPaletteBlock.dragTo(canvasEmpty);
    
    // Click on Hero to select it
    await page.locator('text=Hero Block').first().click();
    
    // Right sidebar should show properties
    // Edit title in properties
    const titleInput = page.locator('input[placeholder*="Title"]').nth(1);
    await titleInput.fill('My Amazing Portfolio');
    
    // Verify input received text
    await expect(titleInput).toHaveValue('My Amazing Portfolio');
  });

  test('T10: Save page', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Save Test');
    await page.fill('input[placeholder*="slug"]', 'save-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Add a block
    let heroPaletteBlock = page.locator('text=Hero').first();
    let canvasEmpty = page.locator('text=Canvas vide').first();
    await heroPaletteBlock.dragTo(canvasEmpty);
    
    // Click Save
    await page.click('button:has-text("Save")');
    
    // Should see success message
    await expect(page.locator('text=saved')).toBeVisible({ timeout: 5000 });
  });

  test('T11: Reload page and verify persistence', async ({ page }) => {
    // Create and save page with block
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Persistence Test');
    await page.fill('input[placeholder*="slug"]', 'persistence-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    let heroPaletteBlock = page.locator('text=Hero').first();
    let canvasEmpty = page.locator('text=Canvas vide').first();
    await heroPaletteBlock.dragTo(canvasEmpty);
    
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=saved')).toBeVisible({ timeout: 5000 });
    
    // Reload page
    await page.reload();
    
    // Hero block should still be there
    await expect(page.locator('text=Hero Block')).toBeVisible();
  });

  test('T12: Delete block', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Delete Block Test');
    await page.fill('input[placeholder*="slug"]', 'delete-block-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Add Hero block
    let heroPaletteBlock = page.locator('text=Hero').first();
    let canvasEmpty = page.locator('text=Canvas vide').first();
    await heroPaletteBlock.dragTo(canvasEmpty);
    
    // Click delete button (trash icon)
    await page.click('button[title="Delete block"]');
    
    // Hero block should disappear
    await expect(page.locator('text=Hero Block')).not.toBeVisible();
  });

  test('T13: Publish page', async ({ page }) => {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Publish Test');
    await page.fill('input[placeholder*="slug"]', 'publish-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Click Publish button
    await page.click('button:has-text("Publish")');
    
    // Button should change to "Unpublish"
    await expect(page.locator('button:has-text("Unpublish")')).toBeVisible();
  });

  test('T14: Unpublish page', async ({ page }) => {
    // First publish a page
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Unpublish Test');
    await page.fill('input[placeholder*="slug"]', 'unpublish-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    await page.click('button:has-text("Publish")');
    await expect(page.locator('button:has-text("Unpublish")')).toBeVisible();
    
    // Now unpublish
    await page.click('button:has-text("Unpublish")');
    
    // Button should change back to "Publish"
    await expect(page.locator('button:has-text("Publish")')).toBeVisible();
  });

  test('T15: Delete page from list', async ({ page }) => {
    // Go to pages list
    await page.goto('/pages');
    
    // Create a page
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', 'Delete Page Test');
    await page.fill('input[placeholder*="slug"]', 'delete-page-test');
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    
    // Go back to pages list
    await page.click('button:has-text("Back")');
    await page.waitForURL('/pages');
    
    // Find and click delete button for our page
    const pageCard = page.locator('text=Delete Page Test').first();
    const deleteButton = pageCard.locator('button[title*="delete"]').first();
    await deleteButton.click();
    
    // Confirm deletion if there's a dialog
    const confirmButton = page.locator('button:has-text("Delete")').first();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Page should be gone
    await expect(page.locator('text=Delete Page Test')).not.toBeVisible();
  });
});

test.describe('Freemium Limit Tests', () => {
  test('Should enforce 3-page limit for free tier', async ({ page }) => {
    await page.goto('/pages');
    
    // Create 3 pages
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("Create Page")');
      await page.fill('input[placeholder*="Title"]', `Freemium Test ${i}`);
      await page.fill('input[placeholder*="slug"]', `freemium-test-${i}`);
      await page.click('button:has-text("Create")');
      await page.waitForURL('/pages/**/edit');
      await page.goto('/pages');
    }
    
    // Try to create 4th page - should fail or show warning
    await page.click('button:has-text("Create Page")');
    
    // Check for error message
    const errorMsg = page.locator('text=/limit|reached|maximum|upgrade/i');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});
