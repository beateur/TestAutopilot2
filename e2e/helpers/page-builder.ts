import { Page } from '@playwright/test';

/**
 * Helpers for Page Builder E2E tests
 */

export class PageBuilderHelpers {
  /**
   * Navigate to pages list
   */
  static async goToPagesList(page: Page) {
    await page.goto('/pages', { waitUntil: 'networkidle' });
  }

  /**
   * Create a new page
   */
  static async createPage(page: Page, title: string, slug: string) {
    await page.click('button:has-text("Create Page")');
    await page.fill('input[placeholder*="Title"]', title);
    await page.fill('input[placeholder*="slug"]', slug);
    await page.click('button:has-text("Create")');
    await page.waitForURL('/pages/**/edit');
    return page.url();
  }

  /**
   * Add a block from palette to canvas
   */
  static async addBlockToCanvas(
    page: Page,
    blockName: 'Hero' | 'Text' | 'Image' | 'Gallery' | 'Video' | 'Contact'
  ) {
    // Wait for palette to be loaded
    await page.waitForSelector(`text=${blockName}`);
    
    const blockPalette = page.locator(`text=${blockName}`).first();
    const canvas = page.locator('text=Canvas vide').first();
    
    // Drag and drop
    await blockPalette.dragTo(canvas);
    
    // Wait for block to appear (verify by text)
    await page.waitForSelector(`text=${blockName} Block`);
  }

  /**
   * Select a block in canvas
   */
  static async selectBlock(page: Page, blockName: string) {
    await page.locator(`text=${blockName}`).click();
    // Wait for properties panel to appear
    await page.waitForTimeout(300);
  }

  /**
   * Edit block property
   */
  static async editBlockProperty(page: Page, fieldName: string, value: string) {
    const input = page.locator(`input[placeholder*="${fieldName}"]`).nth(1);
    await input.fill(value);
  }

  /**
   * Save page
   */
  static async savePage(page: Page) {
    await page.click('button:has-text("Save")');
    // Wait for success message
    await page.waitForSelector('text=saved', { timeout: 5000 });
  }

  /**
   * Delete block
   */
  static async deleteBlock(page: Page) {
    await page.click('button[title="Delete block"]');
  }

  /**
   * Publish page
   */
  static async publishPage(page: Page) {
    await page.click('button:has-text("Publish")');
  }

  /**
   * Unpublish page
   */
  static async unpublishPage(page: Page) {
    await page.click('button:has-text("Unpublish")');
  }

  /**
   * Wait for page to load
   */
  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle');
  }

  /**
   * Get page ID from URL
   */
  static async getPageIdFromUrl(page: Page): Promise<string> {
    const url = page.url();
    const match = url.match(/\/pages\/([^/]+)/);
    return match ? match[1] : '';
  }
}
