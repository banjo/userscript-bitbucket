import { run } from "@banjoanton/spa-runner";
// @ts-ignore isolatedModules

const settingsButtonQuery = '[data-testid="settingsButton"]';

window.onload = () => {
    run(main, {
        runAtStart: true,
        urls: ["https://bitbucket.org/Intelpharma/csp-mono/pull-requests/*"],
        isDebug: true,
        waitForElement: settingsButtonQuery,
    });
};

function main() {
    if (document.querySelector(".csp-button")) return;

    const settingsButton = document.querySelector(settingsButtonQuery);

    if (!settingsButton) return;

    const buttonContainer = settingsButton.parentElement;
    const newContainer = buttonContainer?.cloneNode(true) as HTMLElement;
    const newButton = newContainer.querySelector("button");

    if (!newButton) return;

    newButton.textContent = "CSP-mono";
    newButton.style.cursor = "pointer";
    newButton.classList.add("csp-button");

    buttonContainer?.insertAdjacentElement("afterend", newContainer);

    newButton.addEventListener("click", async () => {
        const message = getBranch();
        navigator.clipboard.writeText(formatMessage(message));
    });
}

function getBranch() {
    const name =
        document.querySelector("header form span a")?.parentElement
            ?.textContent ?? "";

    return name;
}

function formatMessage(branch: string): string {
    return `*S*, _csp-mono_: ${branch}`;
}
