// ==UserScript==
// @name       bitbucket-csp-mono-link
// @namespace  userscript/astra
// @version    0.0.3
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
  var v = () => typeof window != "undefined";
  var y = ({ modal: e, resolve: t, value: i }) => {
    let r = (d) => {
      e.remove(), t(d);
    };
    return { okEvent: () => r(i), cancelEvent: () => r(i), onValue: r };
  };
  var k = () => {
    let e = document.createElement("div");
    return e.classList.add("banjo-modal"), e.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        display: none;
    `, e;
  }, C = () => {
    let e = document.createElement("div");
    return e.classList.add("banjo-prompt"), e.style.cssText = `
        background: #fff;
        padding: 20px;
        border-radius: 5px;
        width: 400px;
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    `, e;
  }, j = (e) => {
    let t = document.createElement("div");
    return t.classList.add("banjo-prompt-header"), t.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    `, t.appendChild(document.createTextNode(e)), t;
  }, T = () => {
    let e = document.createElement("div");
    return e.classList.add("banjo-prompt-content"), e.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    `, e;
  }, S = () => {
    let e = document.createElement("div");
    return e.classList.add("banjo-prompt-footer"), e.style.cssText = `
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
        margin-top: 20px;
    `, e;
  }, A = (e, t) => {
    let i = t === "primary", r = document.createElement("button");
    return r.classList.add("banjo-prompt-button"), r.style.cssText = `
        background-color: ${i ? "#007bff" : "#fff"}; 
        font-weight: bold; 
        color: ${i ? "#fff" : "#2d3748"}; 
        padding: 0.5rem 1rem; 
        border-radius: 0.25rem;
        border: ${i ? "none" : "1px solid #cbd5e0"};
        cursor: pointer;
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);`, r.addEventListener("mouseover", function() {
      r.style.backgroundColor = i ? "#0056b3" : "#f7fafc";
    }), r.addEventListener("mouseout", function() {
      r.style.backgroundColor = i ? "#007bff" : "#fff";
    }), r.textContent = e, r;
  }, u = { modal: k, prompt: C, header: j, content: T, footer: S, button: A };
  var b = (e) => {
    let t = u.modal();
    document.body.appendChild(t);
    let i = u.prompt();
    t.appendChild(i);
    let r = u.header(e);
    i.appendChild(r);
    let c = u.content();
    i.appendChild(c);
    let s = u.footer();
    i.appendChild(s);
    let d = u.button("Cancel", "secondary"), n = u.button("OK", "primary");
    return s.appendChild(d), s.appendChild(n), { modal: t, prompt: i, header: r, content: c, footer: s, cancel: d, ok: n };
  };
  function w$1({ options: e, content: t, onValue: i }) {
    var s, d;
    let r, c;
    switch (e.type) {
      case "select": {
        let n = document.createElement("select");
        if (n.classList.add("banjo-prompt-select"), n.style.cssText = `
                    width: 100%;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 10px;
                    background: #fff;
                `, n.addEventListener("input", (o) => {
          r = o.target.value;
        }), setTimeout(() => {
          n.focus();
        }, 0), c = () => {
          i(r);
        }, t.appendChild(n), !e.entries)
          throw new Error("entries is required");
        e.entries.forEach((o) => {
          let a = document.createElement("option");
          a.classList.add("banjo-prompt-option"), a.value = o.value, a.text = o.text, n.appendChild(a);
        });
        break;
      }
      case "checkbox": {
        if (!e.entries)
          throw new Error("entries is required");
        e.entries.forEach((n) => {
          let o = document.createElement("div");
          o.classList.add("banjo-prompt-checkbox-container"), o.style.cssText = `
                        display: inline;
                        align-items: left;
                        justify-content: left;
                        width: 80%;
                        margin: 5px 0;
                    `, t.appendChild(o);
          let a = document.createElement("input");
          a.classList.add("banjo-prompt-checkbox"), a.type = "checkbox", a.value = n.value, a.addEventListener("input", (p) => {
            r = p.target.value;
          }), o.appendChild(a);
          let l = document.createElement("label");
          l.classList.add("banjo-prompt-label"), l.innerText = n.text, o.appendChild(l);
        }), c = () => {
          let n = document.querySelectorAll(".banjo-prompt-checkbox:checked"), o = [];
          n.forEach((a) => {
            o.push(a.value);
          }), i(o);
        }, (s = t.querySelector("input")) == null || s.focus();
        break;
      }
      case "radio": {
        if (!e.entries)
          throw new Error("entries is required");
        e.entries.forEach((n) => {
          let o = document.createElement("div");
          o.classList.add("banjo-prompt-radio-container"), o.style.cssText = `
                        display: flex;
                        align-items: center;
                        width: 100%;
                        gap: 10px;
                        margin-bottom: 10px;
                    `, t.appendChild(o);
          let a = document.createElement("input");
          a.name = "banjo-prompt-radio", a.classList.add("banjo-prompt-radio"), a.type = "radio", a.value = n.value, a.addEventListener("input", (p) => {
            r = p.target.value;
          }), o.appendChild(a);
          let l = document.createElement("label");
          l.classList.add("banjo-prompt-label"), l.innerText = n.text, o.appendChild(l);
        }), c = () => {
          i(r);
        }, (d = t.querySelector("input")) == null || d.focus();
        break;
      }
      default: {
        let n = document.createElement("input");
        n.classList.add("banjo-prompt-input"), n.type = e.type, e.placeholder && (n.placeholder = e.placeholder), n.style.cssText = `
                    width: 100%;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 10px;
                `, n.addEventListener("input", (o) => {
          r = o.target.value;
        }), t.appendChild(n), c = () => {
          i(r);
        }, setTimeout(() => {
          n.focus();
        }, 0);
        break;
      }
    }
    return { okEvent: c };
  }
  var x = { type: "text", entries: [{ value: "1", text: "One" }, { value: "2", text: "Two" }, { value: "3", text: "Three" }] }, $ = async (e, t = x) => {
    if (!v())
      throw new Error("prompt is only available in browser");
    return t = { ...x, ...t }, new Promise((i, r) => {
      var h;
      let c = (h = t.default) != null ? h : void 0, { modal: s, content: d, ok: n, cancel: o } = b(e), { okEvent: a, cancelEvent: l, onValue: p } = y({ modal: s, resolve: i, value: c }), E = () => s.style.display = "flex", { okEvent: L } = w$1({ options: t, content: d, onValue: p });
      a = L, s.addEventListener("click", (f) => {
        f.target === s && l();
      }), document.addEventListener("keydown", (f) => {
        let g = s.style.display === "flex";
        f.key === "Escape" && g && l(), f.key === "Enter" && g && a();
      }), n.addEventListener("click", a), o.addEventListener("click", l), E();
    });
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
      const size = await $("Enter size", {
        type: "input",
        default: "S"
      });
      if (!size)
        return;
      await navigator.clipboard.writeText(formatMessage(message, size));
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
