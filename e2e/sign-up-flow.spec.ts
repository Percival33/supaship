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

    test("new user can signup", async ({ page }) => {
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
        await signUp(page, userEmail, userPassword, userName, true);
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

    test('a logged out user goes to "/" if they visit "/welcome"', async ({ page }) => {
        await page.goto("./welcome");
        await page.waitForURL(URL, { timeout: 2000 });

        const welcomeNotice = page.locator("h2", { hasText: "Welcome to Supaship!" });
        await expect(welcomeNotice).toHaveCount(0);
    })

    test.describe("username validation", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(URL);
            await signUp(page, userEmail, userPassword, userName, true);
        });

        test("it should not allow an empty username", async ({ page }) => {
            const userNameInput = page.locator("input[name='username']");
            const submitButton = page.locator("button", { hasText: "Submit" });
            await userNameInput.fill("");

            await expect(submitButton).toBeDisabled();
            await page.keyboard.press("Enter");
            const welcomeHeader = page.locator("h2", {
                hasText: "Welcome to Supaship!",
            });
            await expect(welcomeHeader).toHaveCount(1);
        });

        test("it should not allow an spaces in the username", async ({ page }) => {
            const userNameInput = page.locator("input[name='username']");
            const submitButton = page.locator("button", { hasText: "Submit" });
            const validation = page.locator("p.validation-feedback");
            await userNameInput.fill("hello world");

            await expect(submitButton).toBeDisabled();
            await page.keyboard.press("Enter");
            const welcomeHeader = page.locator("h2", {
                hasText: "Welcome to Supaship!",
            });
            await expect(welcomeHeader).toHaveCount(1);
            await expect(validation).toHaveText("Username can only contain letters, numbers, and undescores");
        });

        test("it should not allow username longer than 15 characters", async ({ page }) => {
            const userNameInput = page.locator("input[name='username']");
            const submitButton = page.locator("button", { hasText: "Submit" });
            const validation = page.locator("p.validation-feedback");
            await userNameInput.fill("qwertyuiopasdfghjklzxcvbnm");

            await expect(submitButton).toBeDisabled();
            await page.keyboard.press("Enter");
            const welcomeHeader = page.locator("h2", {
                hasText: "Welcome to Supaship!",
            });
            await expect(welcomeHeader).toHaveCount(1);
            await expect(validation).toHaveText("Username must be less than 15 characters long");
        });

        test("it should not allow username less than 3 characters", async ({ page }) => {
            const userNameInput = page.locator("input[name='username']");
            const submitButton = page.locator("button", { hasText: "Submit" });
            const validation = page.locator("p.validation-feedback");
            await userNameInput.fill("aaa");

            await expect(submitButton).toBeDisabled();
            await page.keyboard.press("Enter");
            const welcomeHeader = page.locator("h2", {
                hasText: "Welcome to Supaship!",
            });
            await expect(welcomeHeader).toHaveCount(1);
            await expect(validation).toHaveText("Username must be at least 4 characters long");
        });
    });


    test.describe("username validation refactored", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(URL);
            await signUp(page, userEmail, userPassword, userName, true);
        });

        const testCases = [
            {
                description: "empty username",
                username: "",
                shouldDisable: true,
                expectedFeedback: "",
                expectedHeaderCount: 1
            },
            {
                description: "spaces in username",
                username: "hello world",
                shouldDisable: true,
                expectedFeedback: "Username can only contain letters, numbers, and underscores",
                expectedHeaderCount: 1
            },
            {
                description: "username longer than 15 characters",
                username: "qwertyuiopasdfghjklzxcvbnm",
                shouldDisable: true,
                expectedFeedback: "Username must be less than 15 characters long",
                expectedHeaderCount: 1
            },
            {
                description: "username less than 3 characters",
                username: "aa",
                shouldDisable: true,
                expectedFeedback: "Username must be at least 4 characters long",
                expectedHeaderCount: 1
            }
        ];

        for (const { description, username, shouldDisable, expectedFeedback, expectedHeaderCount } of testCases) {
            test(`it should validate username for scenario: ${ description }`, async ({ page }) => {
                const userNameInput = page.locator("input[name='username']");
                const submitButton = page.locator("button", { hasText: "Submit" });
                const validation = page.locator("p.validation-feedback");
                const welcomeHeader = page.locator("h2", { hasText: "Welcome to Supaship!" });

                await userNameInput.fill(username);

                if (shouldDisable) {
                    await expect(submitButton).toBeDisabled();
                }
                await page.keyboard.press("Enter");

                await expect(welcomeHeader).toHaveCount(expectedHeaderCount);
                if (expectedFeedback) {
                    await expect(validation).toHaveText(expectedFeedback);
                }
            });
        }
    });


    test("it should not allow duplicate usernames", async ({ page }) => {
        await signUp(page, userEmail, userPassword, userName);
        const logoutButton = page.locator("button", { hasText: "Logout" });
        await logoutButton.click();

        const signInButton = page.locator("button", { hasText: "Login" });
        await expect(signInButton).toHaveCount(2);

        await signUp(page, `${ userEmail }io`, userPassword, userName, true);
        const userNameInput = page.locator("input[name='username']");
        const submitButton = page.locator("button", { hasText: "Submit" });
        const validation = page.locator("p.validation-feedback");
        await userNameInput.fill(userName);

        await expect(submitButton).toBeDisabled();
        await page.keyboard.press("Enter");
        const welcomeHeader = page.locator("h2", {
            hasText: "Welcome to Supaship!",
        });
        await expect(welcomeHeader).toHaveCount(1);
        await expect(validation).toHaveText(`Username "testuser" is already taken`);
    });
})

