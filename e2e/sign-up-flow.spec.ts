import { test, expect } from "@playwright/test";
import { login, setupE2eTest, signUp } from "./utils";

test.describe("User auth", () => {
    const userEmail = "test@test.io";
    const userPassword = "test123456";
    const userName = "testuser";
    const URL = "http://localhost:1337/";
    test.beforeEach(setupE2eTest);
    test.beforeEach(async ({ page }) => {
        await page.goto(URL);
    })

    test("new user can signup", async ({ browser, page }) => {
        await signUp(page, userEmail, userPassword, userName);
    });

    test("after signing up, user can login from another machine", async ({ browser, page }) => {
        await signUp(page, userEmail, userPassword, userName);
        const newMachine = await browser.newPage();
        await newMachine.goto(URL);
        await login(newMachine, userEmail, userPassword, userName);
    });

    test("after signing up, user is logged in on a new tab", async ({ context, page }) => {
        await signUp(page, userEmail, userPassword, userName);
        const newPage = await context.newPage();
        await newPage.goto(URL);
        const logoutButton = page.locator("button", { hasText: "Logout" });
        await expect(logoutButton).toHaveCount(1);
    });

    test('user without a username gets redirected to "/welcome"', async ({ page }) => {
       await signUp(page, userEmail, userPassword, true);
       await page.goto(URL);
       const welcomePage = page.locator("h2", { hasText: "Welcome to Supaship!" });
       await expect(welcomePage).toHaveCount(1);
    });

    test('a user with a username get sent back home if they visit "/welcome"', async ({ page }) => {
       await signUp(page, userEmail, userPassword, userName);
       await page.goto('./welcome');
       const welcomeNotice = page.locator("h2", { hasText: "Welcome to Supaship!" });
       await expect(welcomeNotice).toHaveCount(0);

       const logoutButton = page.locator("button", { hasText: "Logout" });
       await expect(logoutButton).toHaveCount(1);
    });

    test('a logged out user goes to "/" if they visit "/welcome"', async ({ page}) => {
        await page.goto("./welcome");
        await page.waitForURL(URL, { timeout: 2000 });

        const welcomeNotice = page.locator("h2", { hasText: "Welcome to Supaship!" });
        await expect(welcomeNotice).toHaveCount(0);
    })
})

test.describe("username validation", () => {

});