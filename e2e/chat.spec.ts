import { test, expect } from '@playwright/test';

test.describe('Nova Chat Core Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the chat interface with greeting', async ({ page }) => {
    // A fejléc Nova nevű headingje látható
    await expect(page.getByRole('heading', { name: 'Nova' }).first()).toBeVisible();

    // Az első asszisztens üzenet (üdvözlés) látható
    const firstMessage = page.locator('.prose').first();
    await expect(firstMessage).toBeVisible();
    await expect(firstMessage).toContainText('Nova vagyok');
  });

  test('should allow user to type a message', async ({ page }) => {
    const input = page.locator('textarea[placeholder="Írj üzenetet vagy adj feladatot..."]');
    await expect(input).toBeVisible();
    await input.fill('Szia Nova!');
    await expect(input).toHaveValue('Szia Nova!');
  });

  test('send button becomes active when text is typed', async ({ page }) => {
    const input = page.locator('textarea[placeholder="Írj üzenetet vagy adj feladatot..."]');
    // A küldés gomb SVG tartalmú button (az input mel lett)
    const sendButton = page.locator('button:has(svg)').last();

    // Üres input → gomb disabled
    await expect(sendButton).toBeDisabled();

    // Szöveg beírása után → engedélyezett
    await input.fill('Teszt üzenet');
    await expect(sendButton).not.toBeDisabled();
  });

  test('should allow user to send a message and receive a response', async ({ page }) => {
    const input = page.locator('textarea[placeholder="Írj üzenetet vagy adj feladatot..."]');

    // Üzenetet küldünk Enter-rel
    await input.fill('Szia Nova, egy rövid teszt üzenetet küldök.');
    await input.press('Enter');

    // A mi üzenetünk megjelent
    await expect(page.locator('text=Szia Nova, egy rövid teszt üzenetet küldök.')).toBeVisible();

    // Megvárjuk az AI választ (max 20 másodperc)
    const aiBubbles = page.locator('.prose');
    await expect(aiBubbles).toHaveCount(2, { timeout: 20000 });
  });
});
