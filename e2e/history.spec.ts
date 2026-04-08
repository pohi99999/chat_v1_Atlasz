import { test, expect } from '@playwright/test';

test.describe('Nova Chat History and Sidebar', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the sidebar with New Chat button', async ({ page }) => {
    // Az oldalsáv látható
    const sidebar = page.locator('.bg-slate-900').first();
    await expect(sidebar).toBeVisible();

    // Az "Új beszélgetés" gomb megvan
    const newChatBtn = page.locator('button:has-text("Új beszélgetés")');
    await expect(newChatBtn).toBeVisible();
  });

  test('new chat resets messages to greeting only', async ({ page }) => {
    const input = page.locator('textarea[placeholder="Írj üzenetet vagy adj feladatot..."]');
    const newChatBtn = page.locator('button:has-text("Új beszélgetés")');

    // Írunk valamit a inputba (de NEM küldjük el — nincs API hívás)
    await input.fill('Ez egy ideiglenes szöveg.');
    await expect(input).toHaveValue('Ez egy ideiglenes szöveg.');

    // Új chat → az input törlődik
    await newChatBtn.click();
    await expect(input).toHaveValue('');

    // Az üdvözlés megvan
    const greetingMsg = page.locator('.prose').first();
    await expect(greetingMsg).toContainText('Nova vagyok');
  });

  test('should toggle sidebar on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const toggleBtn = page.locator('button:has-text("⟪")').or(page.locator('button:has-text("⟫")')).first();
    await expect(toggleBtn).toBeVisible();

    // Első kattintás
    await toggleBtn.click();
    await page.waitForTimeout(400);

    // Második kattintás
    await toggleBtn.click();
    await page.waitForTimeout(400);

    // A gomb még mindig elérhető
    await expect(toggleBtn).toBeVisible();
  });

  test('thread list section is present in sidebar', async ({ page }) => {
    // A "Korábbiak" felirat a sidebar-ban
    const historyLabel = page.locator('text=Korábbiak');
    await expect(historyLabel).toBeVisible();
  });
});
