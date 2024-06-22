import {execSync} from "child_process";
import detect from "detect-port";
import {expect, Page} from "@playwright/test";

export async function setupE2eTest() {
    await startSupabase();
    reseedDb();
}

async function startSupabase() {
    const port = await detect(54321);
    if (port !== 54321) {
        return;
    }
    console.warn("Supabase not detected - Starting it now");
    execSync("npx supabase start");
}

function reseedDb() {
    const postgresPath = '/opt/homebrew/opt/postgresql@15/bin'; // Adjust this if your path is different
    const currentPath = process.env.PATH;
    const newPath = `${postgresPath}:${currentPath}`;

    try {
        execSync("which psql", { stdio: "inherit" })
        // execSync(
        //     "PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -p 54322 -d postgres -f supabase/clear-db-data.sql",
        //     {env: {...process.env, newPath}, stdio: "inherit",} // Changed from "ignore" to "inherit" to capture the output
        // );
    } catch (error) {
        console.error('Error executing command:', error.message);
        console.error('Command output:', error.output);
        throw error; // Re-throw the error after logging it
    }
}

export async function signUp(page: Page, email: string, password: string, userName: string, skipUserName = false) {
    const signUpButton = page.locator("button", {hasText: "Sign up"}).first();
    await signUpButton.click();

    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill(email);
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill(password);
    await page.keyboard.press("Enter");

    const welcomeNotice = page.locator("h2", {hasText: "Welcome to Supaship!"});
    await expect(welcomeNotice).toHaveCount(1);

    if (skipUserName) {
        return;
    }
    const usernameInput = page.locator('input[name="username"]');
    await usernameInput.fill(userName);
    const submitButton = page.locator("button", {hasText: "Submit"});
    await expect(submitButton).toBeEnabled();
    await page.keyboard.press("Enter");

    const logoutButton = page.locator("button", {hasText: "Logout"});
    await expect(logoutButton).toHaveCount(1);
}

export async function login(page: Page, email: string, password: string, userName: string, loginButtonSelector = "button") {
    const signUpButton = page.locator(loginButtonSelector, {hasText: "Login"}).first();
    await signUpButton.click();

    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill(email);

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill(password);
    await page.keyboard.press("Enter");

    const logoutButton = page.locator("button", {hasText: "Logout"});
    await expect(logoutButton).toHaveCount(1);
    const userNameMention = page.locator("h2", {hasText: userName});
    await expect(userNameMention).toHaveCount(1);
}

export async function createPost(page: Page, title: string, contents: string) {
    page.goto("/1");
    const postTitleInput = page.locator('input[name="title"]');
    const postContentInput = page.locator('textarea[name="contents"]');
    const postSubmitButton = page.locator("button[type='submit']");

    await postTitleInput.fill(title);
    await postContentInput.fill(contents);
    await postSubmitButton.click();

    const post = page.locator("h3", {hasText: title});
    await expect(post).toHaveCount(1);
    return post;
}