// ==UserScript==
// @name       bitbucket-csp-mono-link
// @namespace  userscript/astra
// @version    0.0.1
// @author     Anton
// @match      https://bitbucket.org/*
// @run-at     document-end
// ==/UserScript==

(function() {
  "use strict";
  const WAIT_FOR_ELEMENT_TIMEOUT = 200;
  const WAIT_FOR_ELEMENT_MAXIMUM_TRIES = 10;
  const getRunner = (log, handler, config) => () => {
    log("Preparing handler...");
    if (config.waitForElement) {
      log("Waiting for element...");
      let tries = 0;
      const waitForElementInterval = setInterval(() => {
        const element = document.querySelector(config.waitForElement);
        if (!element && tries < WAIT_FOR_ELEMENT_MAXIMUM_TRIES) {
          log("Element not found, trying again...");
          tries++;
        } else if (element) {
          log("Element found...");
          clearInterval(waitForElementInterval);
          log("Running handler...");
          setTimeout(handler, config.timeoutBeforeHandlerInit);
          log("Handler done...");
        } else {
          log("Element not found, giving up...");
          clearInterval(waitForElementInterval);
        }
      }, WAIT_FOR_ELEMENT_TIMEOUT);
      return;
    }
    log("Running handler...");
    setTimeout(handler, config.timeoutBeforeHandlerInit);
    log("Handler done...");
  };
  const getLogger = (isDebug) => (statement) => {
    if (isDebug) {
      console.log("%cDEBUG SPA-RUNNER: " + statement, "color: blue");
    }
  };
  function matchWithWildcard(string, matcher) {
    const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
    return new RegExp(
      "^" + matcher.split("*").map(escapeRegex).join(".*") + "$"
    ).test(string);
  }
  const defaultConfig = {
    timeBetweenUrlLookup: 500,
    urls: [],
    timeoutBeforeHandlerInit: 0,
    runAtStart: true,
    waitForElement: void 0,
    isDebug: false
  };
  const run = (handler, config = defaultConfig) => {
    const logger = getLogger(config.isDebug ?? false);
    const runner = getRunner(logger, handler, config);
    if (config.runAtStart) {
      logger("Running at start...");
      runner();
    }
    let lastPath = window.location.pathname;
    let lastSearch = window.location.search;
    const runInterval = setInterval(() => {
      var _a;
      const isNewUrl = lastPath !== window.location.pathname || lastSearch !== window.location.search;
      const hasUrls = config.urls && config.urls.length > 0;
      const matchesUrl = hasUrls ? (_a = config.urls) == null ? void 0 : _a.some(
        (url) => matchWithWildcard(window.location.href, url)
      ) : true;
      if (isNewUrl && matchesUrl) {
        logger("New url found, running handler...");
        lastPath = window.location.pathname;
        lastSearch = window.location.search;
        runner();
      } else if (isNewUrl) {
        lastPath = window.location.pathname;
        lastSearch = window.location.search;
        logger("New url found, but does not match...");
      }
    }, config.timeBetweenUrlLookup);
    return () => {
      logger("Stopping...");
      clearInterval(runInterval);
    };
  };
  const w = () => "undefined" != typeof window;
  const Y = (e, n) => (n || document).querySelector(e);
  Y.exists = (e, n) => n ? !!Y(e, n) : !!Y(e), Y.all = (e, n) => Array.from((n || document).querySelectorAll(e));
  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 32 32"><path fill="currentColor" d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm-2 19.59l-5-5L10.59 15L14 18.41L21.41 11l1.596 1.586Z"/><path fill="none" d="m14 21.591l-5-5L10.591 15L14 18.409L21.41 11l1.595 1.585L14 21.591z"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 32 32"><path fill="currentColor" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2zm5.4 21L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4l-1.6 1.6z"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 32 32"><path fill="currentColor" d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14s14-6.3 14-14S23.7 2 16 2zm-1.1 6h2.2v11h-2.2V8zM16 25c-.8 0-1.5-.7-1.5-1.5S15.2 22 16 22s1.5.7 1.5 1.5S16.8 25 16 25z"/></svg>`
  };
  const backgroundColor = {
    success: "#bbf7d0",
    error: "#fecdd3",
    warning: "#fff3cd"
  };
  const color = {
    success: "#0f5132",
    error: "#842029",
    warning: "#664d03"
  };
  const defaultOptions = {
    duration: 5e3,
    type: "success",
    animationTiming: 300,
    fontSize: "1.2rem",
    width: "fit-content",
    useIcon: true
  };
  const toast = (message, options) => {
    if (!w())
      throw new Error("toast can only be used in a browser");
    const { duration, type, animationTiming, fontSize, width, useIcon } = {
      ...defaultOptions,
      ...options
    };
    const toast2 = document.createElement("div");
    toast2.classList.add("banjo-toast");
    toast2.dataset.type = type;
    toast2.dataset.duration = duration.toString();
    toast2.style.cssText = `
        transition: all ${animationTiming}ms ease;
        font-size: ${fontSize};
        width: ${width};
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        height: fit-content;
        transform: translateX(200%);
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        z-index: 9999;
        `;
    toast2.style.backgroundColor = backgroundColor[type];
    toast2.style.color = color[type];
    if (useIcon) {
      const icon = document.createElement("i");
      icon.classList.add("banjo-toast-icon");
      icon.innerHTML = icons[type];
      toast2.appendChild(icon);
    }
    toast2.appendChild(document.createTextNode(message));
    document.body.appendChild(toast2);
    const show = () => {
      toast2.style.transform = "translateX(0%)";
    };
    const hide = (element = toast2, beforeRemove = 5e3) => {
      element.style.transform = "translateX(200%)";
      setTimeout(() => {
        var _a;
        (_a = element.parentNode) == null ? void 0 : _a.removeChild(element);
      }, beforeRemove);
    };
    toast2.addEventListener("click", () => {
      hide();
    });
    if (Y.exists(".banjo-toast")) {
      const oldToasts = Y.all(".banjo-toast");
      oldToasts.forEach((oldToast) => {
        const dur = oldToast.dataset.duration;
        hide(oldToast, Number(dur) + animationTiming);
      });
    }
    setTimeout(show, animationTiming);
    setTimeout(hide, duration);
    return { hide: () => hide() };
  };
  const settingsButtonQuery = '[data-testid="settingsButton"]';
  window.onload = () => {
    run(main, {
      runAtStart: true,
      urls: ["https://bitbucket.org/Intelpharma/csp-mono/pull-requests/*"],
      isDebug: false,
      waitForElement: settingsButtonQuery
    });
  };
  function main() {
    addCspButton();
    addPipelineButton();
  }
  function addPipelineButton() {
    if (document.querySelector(".pipeline-button"))
      return;
    const settingsButton = document.querySelector(settingsButtonQuery);
    if (!settingsButton)
      return;
    const buttonContainer = settingsButton.parentElement;
    const newContainer = buttonContainer == null ? void 0 : buttonContainer.cloneNode(true);
    const newButton = newContainer.querySelector("button");
    if (!newButton)
      return;
    newButton.textContent = "Pipeline";
    newButton.style.cursor = "pointer";
    newButton.classList.add("pipeline-button");
    buttonContainer == null ? void 0 : buttonContainer.insertAdjacentElement("afterend", newContainer);
    newButton.addEventListener("click", async () => {
      window.open(
        "https://dev.azure.com/MES-SEUIT/CSP/_build?definitionId=64",
        "_blank"
      );
    });
  }
  function addCspButton() {
    if (document.querySelector(".csp-button"))
      return;
    const settingsButton = document.querySelector(settingsButtonQuery);
    if (!settingsButton) {
      toast("Could not find settings button", { type: "error" });
      return;
    }
    const buttonContainer = settingsButton.parentElement;
    const newContainer = buttonContainer == null ? void 0 : buttonContainer.cloneNode(true);
    const newButton = newContainer.querySelector("button");
    if (!newButton)
      return;
    newButton.textContent = "CSP-mono";
    newButton.style.cursor = "pointer";
    newButton.classList.add("csp-button");
    buttonContainer == null ? void 0 : buttonContainer.insertAdjacentElement("afterend", newContainer);
    newButton.addEventListener("click", async () => {
      const message = getBranch();
      const size = prompt("Enter size", "S");
      if (!size)
        return;
      navigator.clipboard.writeText(formatMessage(message, size));
      toast(`Copied to clipboard in Markdown`, {
        type: "success",
        duration: 2e3
      });
    });
  }
  function getBranch() {
    var _a;
    const name = ((_a = document.querySelector(".css-atqsw9 > span:nth-child(1)")) == null ? void 0 : _a.textContent) ?? "";
    return name;
  }
  function formatMessage(branch, size) {
    return `*${size}*, _csp-mono_: [${branch}](${window.location.href})`;
  }
})();
