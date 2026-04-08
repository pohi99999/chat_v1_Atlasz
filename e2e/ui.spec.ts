import { test, expect } from '@playwright/test';

test.describe('Nova UI Modals and Tools', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open Knowledge Base (Tudásbázis) modal from sidebar', async ({ page }) => {
    // Sidebar alján a "Tudásbázis kezelő" gomb
    const knowledgeBtn = page.locator('button:has-text("Tudásbázis kezelő")');
    await expect(knowledgeBtn).toBeVisible();

    await knowledgeBtn.click();

    // A modal megjelenik
    const modalTitle = page.locator('h2:has-text("Tudásbázis Kezelő")');
    await expect(modalTitle).toBeVisible();

    // Bezárjuk
    const closeBtn = page.locator('button:has-text("Bezárás")');
    await closeBtn.click();

    await expect(modalTitle).not.toBeVisible();
  });

  test('should toggle Audio (Mute/Unmute) button', async ({ page }) => {
    // A hangszóró gomb (🔊/🔇) a fejlécen
    // Kezdetben isSpeechEnabled=false → 🔇 ikon
    const audioBtn = page.locator('button[title="Hangszóró"]');
    await expect(audioBtn).toBeVisible();

    // Kattintás után be kell kapcsolódnia
    await audioBtn.click();

    // A gomb kék hátteret kap (bg-blue-50 osztály)
    await expect(audioBtn).toHaveClass(/bg-blue-50/);

    // Visszakapcsolás
    await audioBtn.click();
    await expect(audioBtn).not.toHaveClass(/bg-blue-50/);
  });

  test('file upload button should be visible with correct accept attribute', async ({ page }) => {
    // A fájlfeltöltő label (📎) a fejlécen
    const uploadLabel = page.locator('label[title="Fájl feltöltés"]').first();
    await expect(uploadLabel).toBeVisible();

    // A hidden file input helyes accept attribútummal
    const fileInput = uploadLabel.locator('input[type="file"]');
    await expect(fileInput).toHaveAttribute('accept', '.pdf,.txt,.md');
  });

  test('sidebar toggle button is visible and clickable', async ({ page }) => {
    // A sidebar toggle gomb (⟪/⟫) a fejlécen
    const toggleBtn = page.locator('button:has-text("⟪")').or(page.locator('button:has-text("⟫")')).first();
    await expect(toggleBtn).toBeVisible();

    // Kattintásra bezárul/kinyílik a sidebar
    await toggleBtn.click();
    await page.waitForTimeout(400); // CSS transition

    // Újra kattintás
    await toggleBtn.click();
    await page.waitForTimeout(400);

    // A gomb még mindig látható
    await expect(toggleBtn).toBeVisible();
  });

  test('microphone button is visible', async ({ page }) => {
    // A 🎤 gomb az input sávban
    const micBtn = page.locator('button:has-text("🎤")').first();
    await expect(micBtn).toBeVisible();
  });
});
