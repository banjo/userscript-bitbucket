// @ts-ignore isolatedModules
window.onload = () => {
    main();
};

function main() {
    const settingsButton = document.querySelector(
        '[data-testid="settingsButton"]'
    );

    if (!settingsButton) return;

    const buttonContainer = settingsButton.parentElement;
    const newContainer = buttonContainer?.cloneNode(true) as HTMLElement;
    const newButton = newContainer.querySelector("button");

    if (!newButton) return;

    newButton.textContent = "CSP-mono";
    newButton.style.cursor = "pointer";

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
