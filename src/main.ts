import { run } from "@banjoanton/spa-runner";
// @ts-ignore isolatedModules

const settingsButtonQuery = '[data-testid="settingsButton"]';

window.onload = () => {
    run(main, {
        runAtStart: true,
        urls: ["https://bitbucket.org/Intelpharma/csp-mono/pull-requests/*"],
        isDebug: false,
        waitForElement: settingsButtonQuery,
    });
};

function main() {
    addCspButton();
    addPipelineButton();
}

function addPipelineButton() {
    if (document.querySelector(".pipeline-button")) return;

    const settingsButton = document.querySelector(settingsButtonQuery);

    if (!settingsButton) return;

    const buttonContainer = settingsButton.parentElement;
    const newContainer = buttonContainer?.cloneNode(true) as HTMLElement;
    const newButton = newContainer.querySelector("button");

    if (!newButton) return;

    newButton.textContent = "Pipeline";
    newButton.style.cursor = "pointer";
    newButton.classList.add("pipeline-button");

    buttonContainer?.insertAdjacentElement("afterend", newContainer);

    newButton.addEventListener("click", async () => {
        window.open(
            "https://dev.azure.com/MES-SEUIT/CSP/_build?definitionId=64",
            "_blank"
        );
    });
}

function addCspButton() {
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
