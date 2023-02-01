// ==UserScript==
// @name       bitbucket-csp-mono-link
// @namespace  userscript/astra
// @version    0.0.0
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
    if (!settingsButton)
      return;
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
      navigator.clipboard.writeText(formatMessage(message));
    });
  }
  function getBranch() {
    var _a, _b;
    const name = ((_b = (_a = document.querySelector("header form span a")) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.textContent) ?? "";
    return name;
  }
  function formatMessage(branch) {
    return `*S*, _csp-mono_: ${branch}`;
  }
})();
