import { run } from "@banjoanton/spa-runner";
import { promptler } from "promptler";
import { toast } from "toastler";
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

    if (!settingsButton) {
        toast("Could not find settings button", { type: "error" });
        return;
    }

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
        const size = (await promptler("Enter size", {
            type: "input",
            default: "S",
        })) as string;

        if (!size) return;

        await navigator.clipboard.writeText(formatMessage(message, size));
        toast(`Copied to clipboard in Markdown`, {
            type: "success",
            duration: 2000,
        });
    });
}

function getBranch() {
    const name =
        document.querySelector(".css-atqsw9 > span:nth-child(1)")
            ?.textContent ?? "";

    return name;
}

function formatMessage(branch: string, size: string): string {
    return `*${size}*, _csp-mono_: [${branch}](${window.location.href})`;
}
