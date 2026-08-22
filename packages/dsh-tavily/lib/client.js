window.__ModuleLoader__.load({
  id: "@pymodel/dsh-tavily",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    let react = require("react");
    let react_jsx_runtime = require("react/jsx-runtime");
    let _client_runtime = require("@deepseek-ai/dsh-client-runtime/client");

    const KEY_REF = "TAVILY_API_KEY";
    const ENABLED_REF = "TAVILY_SEARCH_ENABLED";

    function injectCss() {
      if (typeof document === "undefined") return () => {};
      const prev = document.querySelector("style[data-tavily-search-css]");
      if (prev) prev.remove();
      const tag = document.createElement("style");
      tag.setAttribute("data-tavily-search-css", "8");
      tag.textContent = [
        ".tvly_card{list-style:none;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-3);transition:border-color .16s,background .16s}",
        ".tvly_card:hover{border-color:var(--dsw-alias-label-dimmed)}",
        ".tvly_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}",
        ".tvly_head{width:100%;appearance:none;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px}",
        ".tvly_head:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}",
        ".tvly_headText{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}",
        ".tvly_name{font-size:15px;font-weight:600;line-height:1.4;color:var(--dsw-alias-label-primary)}",
        ".tvly_desc{font-size:13px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
        ".tvly_pending{flex:none;border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px;font-weight:500;white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}",
        ".tvly_chevron{flex:none;display:block;width:14px;height:14px;color:var(--dsw-alias-label-tertiary);transition:transform .16s}",
        ".tvly_chevronOpen{transform:rotate(180deg)}",
        ".tvly_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}",
        ".tvly_field{display:flex;flex-direction:column;gap:6px;padding:12px 0}",
        ".tvly_field+.tvly_field{border-top:1px solid var(--dsw-alias-border-l2)}",
        ".tvly_fieldHead{display:flex;align-items:center;gap:8px}",
        ".tvly_label{flex:1;min-width:0;font-size:13px;font-weight:500;line-height:1.5;color:var(--dsw-alias-label-primary)}",
        ".tvly_badge{flex:none;border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px;white-space:nowrap;font-weight:500;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}",
        ".tvly_clear{flex:none;appearance:none;border:0;background:none;padding:0;font:inherit;font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap}",
        ".tvly_clear:hover:not(:disabled){color:var(--dsw-alias-label-primary)}",
        ".tvly_clear:disabled{opacity:.4;cursor:default}",
        ".tvly_clear:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
        ".tvly_hint{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}",
        ".tvly_input{height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);font:inherit;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-primary)}",
        ".tvly_input:focus-visible{outline:none;border-color:var(--dsw-alias-brand-primary)}",
        ".tvly_input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}",
        ".tvly_switch{flex:none;position:relative;width:36px;height:20px;cursor:pointer}",
        ".tvly_switchInput{position:absolute;inset:0;margin:0;opacity:0;cursor:pointer}",
        ".tvly_switchTrack{display:block;width:36px;height:20px;border-radius:999px;background:var(--dsw-alias-bg-module-platform);transition:background .16s}",
        ".tvly_switchTrack::after{content:\"\";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary);transition:transform .16s}",
        ".tvly_switchInput:checked+.tvly_switchTrack{background:var(--dsw-alias-brand-primary)}",
        ".tvly_switchInput:checked+.tvly_switchTrack::after{transform:translateX(16px);background:#fff}",
        ".tvly_switchInput:focus-visible+.tvly_switchTrack{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
        ".tvly_switchInput:disabled+.tvly_switchTrack{opacity:.4}",
        ".tvly_footer{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:12px 0 4px;border-top:1px solid var(--dsw-alias-border-l2)}",
        ".tvly_probe{display:flex;align-items:center;gap:8px;flex:1;min-width:0}",
        ".tvly_probeStatus{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
        ".tvly_probeFail{color:var(--dsw-alias-label-error)}",
        ".tvly_actions{display:flex;align-items:center;gap:8px;flex:none;margin-left:auto}",
        ".tvly_failed{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-error);white-space:nowrap}",
        ".tvly_discard,.tvly_save,.tvly_probeBtn{appearance:none;border:1px solid transparent;border-radius:8px;padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer;transition:transform .12s,opacity .16s,border-color .16s,color .16s,background .16s}",
        ".tvly_discard,.tvly_probeBtn{border-color:var(--dsw-alias-border-l2);background:none;color:var(--dsw-alias-label-secondary)}",
        ".tvly_discard:hover:not(:disabled),.tvly_probeBtn:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}",
        ".tvly_save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}",
        ".tvly_discard:disabled,.tvly_save:disabled,.tvly_probeBtn:disabled{opacity:.4;cursor:default}",
        ".tvly_discard:focus-visible,.tvly_save:focus-visible,.tvly_probeBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}",
        ".tvly_pills{flex:none;display:flex;align-items:center;gap:6px}",
        ".tvly_mode{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px;font-weight:500;white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}",
        ".tvly_dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary)}",
        ".tvly_dotOn{background:var(--dsw-alias-brand-primary)}",
        ".tvly_probeOk{color:var(--dsw-alias-brand-primary)}",
        ".tvly_live{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);border:0;white-space:nowrap}",
        ".tvly_spin{flex:none;width:12px;height:12px;border-radius:50%;border:2px solid currentColor;border-top-color:transparent;display:inline-block;animation:tvly-rot .7s linear infinite}",
        "@keyframes tvly-rot{to{transform:rotate(360deg)}}",
        ".tvly_input:hover:not(:disabled):not(:focus-visible){border-color:var(--dsw-alias-label-dimmed)}",
        ".tvly_eye{flex:none;appearance:none;border:0;background:none;padding:0;font:inherit;font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap}",
        ".tvly_eye:hover{color:var(--dsw-alias-label-primary)}",
        ".tvly_eye[aria-pressed=\"true\"]{color:var(--dsw-alias-brand-primary)}",
        ".tvly_eye:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}",
        ".tvly_discard:active:not(:disabled),.tvly_save:active:not(:disabled),.tvly_probeBtn:active:not(:disabled){transform:scale(.97)}",
        "@media (prefers-reduced-motion:reduce){.tvly_card,.tvly_chevron,.tvly_switchTrack,.tvly_switchTrack::after,.tvly_discard,.tvly_save,.tvly_probeBtn{transition:none}.tvly_spin{animation:none;opacity:.7}.tvly_discard:active:not(:disabled),.tvly_save:active:not(:disabled),.tvly_probeBtn:active:not(:disabled){transform:none}}",
      ].join("");
      document.head.appendChild(tag);
      return () => tag.remove();
    }

    class TavilyCardController {
      constructor(api) {
        this.api = api;
        this.enabled = false;
        this.savedEnabled = false;
        this.keyConfigured = false;
        this.keyWritable = true;
        this.enabledWritable = true;
        this.draftKey = "";
        this.draftEnabled = false;
        this.clearKey = false;
        this.saving = false;
        this.failed = false;
        this.probing = false;
        this.justSaved = false;
        this.probeStatus = "idle";
        this.probeFail = null;
        this.store = _client_runtime.createSnapshotStore(this.projection());
        this.refresh();
      }

      projection() {
        const dirty = this.draftEnabled !== this.enabled || this.draftKey.trim() !== "" || this.clearKey;
        return {
          enabled: this.draftEnabled,
          savedEnabled: this.savedEnabled,
          keyConfigured: this.keyConfigured,
          justSaved: this.justSaved,
          keyWritable: this.keyWritable,
          enabledWritable: this.enabledWritable,
          draftKey: this.draftKey,
          clearKey: this.clearKey,
          dirty,
          saving: this.saving,
          failed: this.failed,
          probing: this.probing,
          probeStatus: this.probeStatus,
          probeFail: this.probeFail,
        };
      }

      publish() {
        this.store.set(this.projection());
      }

      async describe(ref) {
        try {
          const response = await this.api.credentials.describe({ refs: [ref] });
          if (!response.result.ok) return { configured: false, writable: true };
          return response.result.value.credentials[ref] ?? { configured: false, writable: true };
        } catch {
          return { configured: false, writable: true };
        }
      }

      async refresh() {
        const enabled = await this.describe(ENABLED_REF);
        const key = await this.describe(KEY_REF);
        // describe() is value-free: presence of TAVILY_SEARCH_ENABLED means on.
        this.enabled = !!enabled.configured;
        this.savedEnabled = this.enabled;
        this.enabledWritable = enabled.writable ?? true;
        this.keyConfigured = !!key.configured;
        this.keyWritable = key.writable ?? true;
        this.draftEnabled = this.enabled;
        this.draftKey = "";
        this.clearKey = false;
        this.failed = false;
        this.probeStatus = "idle";
        this.probeFail = null;
        this.publish();
      }

      resetProbe() {
        if (this.probing) return;
        this.probeStatus = "idle";
        this.probeFail = null;
      }

      inject() {
        return {
          hooks: { tavilyCard: this.store },
          setEnabled: (value) => {
            this.draftEnabled = value;
            this.failed = false;
            this.justSaved = false;
            this.resetProbe();
            this.publish();
          },
          setKey: (text) => {
            this.draftKey = text;
            this.clearKey = false;
            this.failed = false;
            this.justSaved = false;
            this.resetProbe();
            this.publish();
          },
          stageClearKey: () => {
            this.draftKey = "";
            this.clearKey = true;
            this.failed = false;
            this.justSaved = false;
            this.resetProbe();
            this.publish();
          },
          discard: () => {
            this.draftEnabled = this.enabled;
            this.draftKey = "";
            this.clearKey = false;
            this.failed = false;
            this.resetProbe();
            this.publish();
          },
          save: () => this.save(),
          probe: () => this.probe(),
        };
      }

      async probe() {
        if (this.probing || this.saving) return;
        this.probing = true;
        this.probeStatus = "testing";
        this.probeFail = null;
        this.publish();
        try {
          const draft = this.draftKey.trim();
          const body = {};
          if (draft) body.apiKey = draft;
          else if (this.clearKey) body.clearKey = true;
          const response = await fetch("/api/tavily-probe", {
            method: "POST",
            headers: { "content-type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(body),
          });
          let json = {};
          try {
            json = await response.json();
          } catch {
            json = {};
          }
          if (response.status === 404) {
            this.probeStatus = "fail";
            this.probeFail = { code: "unavailable" };
          } else if (json && json.ok === true) {
            this.probeStatus = "ok";
            this.probeFail = null;
          } else {
            this.probeStatus = "fail";
            this.probeFail = {
              code: typeof json.code === "string" ? json.code : "other",
              status: typeof json.status === "number" ? json.status : response.status,
              error: typeof json.error === "string" ? json.error : "",
            };
          }
        } catch {
          this.probeStatus = "fail";
          this.probeFail = { code: "network" };
        }
        this.probing = false;
        this.publish();
      }

      async save() {
        if (this.saving) return;
        this.saving = true;
        this.failed = false;
        this.publish();
        try {
          if (this.enabledWritable) {
            if (this.draftEnabled) await this.api.credentials.set({ ref: ENABLED_REF, value: "true" });
            else await this.api.credentials.unset({ ref: ENABLED_REF });
          }
          const key = this.draftKey.trim();
          if (this.keyWritable) {
            if (key) await this.api.credentials.set({ ref: KEY_REF, value: key });
            else if (this.clearKey) await this.api.credentials.unset({ ref: KEY_REF });
          }
          await this.refresh();
          this.justSaved = true;
        } catch {
          this.failed = true;
          this.saving = false;
          this.publish();
          return;
        }
        this.saving = false;
        this.publish();
      }
    }

    function probeFailText(t, fail) {
      const prefix = t ? t("probeFail") : "Failed: ";
      const code = fail && fail.code;
      if (code === "timeout") return prefix + (t ? t("probeTimeout") : "timed out");
      if (code === "invalid_key") return prefix + (t ? t("probeInvalidKey") : "invalid key");
      if (code === "network") return prefix + (t ? t("probeNetwork") : "network error");
      if (code === "unavailable") return prefix + (t ? t("probeUnavailable") : "test endpoint unavailable");
      if (code === "http") return prefix + "HTTP " + (fail.status || "");
      const extra = fail && fail.error ? fail.error : "";
      return prefix + (extra || (t ? t("probeUnknown") : "unknown error"));
    }

    function TavilyCard(props) {
      const { t } = props;
      const state = props.useTavilyCard((s) => s);
      const [open, setOpen] = react.useState(false);
      const [showKey, setShowKey] = react.useState(false);
      const blocked = !state.dirty || state.saving;
      const title = t ? t("title") : "Tavily web search";
      const description = t ? t("description") : "On: Tavily (works without a key). Off: official DeepSeek.";
      return react_jsx_runtime.jsxs("li", {
        className: open ? "tvly_card tvly_cardOpen" : "tvly_card",
        children: [
          react_jsx_runtime.jsxs("button", {
            type: "button",
            className: "tvly_head",
            "aria-expanded": open,
            onClick: () => setOpen(!open),
            children: [
              react_jsx_runtime.jsxs("span", {
                className: "tvly_headText",
                children: [
                  react_jsx_runtime.jsx("span", { className: "tvly_name", children: title }),
                  react_jsx_runtime.jsx("span", { className: "tvly_desc", children: description }),
                ],
              }),
              react_jsx_runtime.jsxs("span", {
                className: "tvly_pills",
                children: [
                  react_jsx_runtime.jsxs("span", {
                    className: "tvly_mode",
                    children: [
                      react_jsx_runtime.jsx("span", { className: state.savedEnabled ? "tvly_dot tvly_dotOn" : "tvly_dot", "aria-hidden": true }),
                      state.savedEnabled
                        ? (state.keyConfigured ? (t ? t("modeKey") : "Tavily · API key") : (t ? t("modeKeyless") : "Tavily · keyless"))
                        : (t ? t("modeDeepseek") : "Official DeepSeek"),
                    ],
                  }),
                  state.dirty ? react_jsx_runtime.jsx("span", { className: "tvly_pending", children: t ? t("unsaved") : "Unsaved" }) : null,
                ],
              }),
              react_jsx_runtime.jsx("svg", {
                className: open ? "tvly_chevron tvly_chevronOpen" : "tvly_chevron",
                width: 14,
                height: 14,
                viewBox: "0 0 14 14",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                "aria-hidden": true,
                children: react_jsx_runtime.jsx("path", {
                  d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
                  fill: "currentColor",
                }),
              }),
            ],
          }),
          open ? react_jsx_runtime.jsxs("div", {
            className: "tvly_body",
            children: [
              react_jsx_runtime.jsxs("div", {
                className: "tvly_field",
                children: [
                  react_jsx_runtime.jsxs("div", {
                    className: "tvly_fieldHead",
                    children: [
                      react_jsx_runtime.jsx("span", { className: "tvly_label", children: t ? t("enable") : "Use Tavily (off = official DeepSeek)" }),
                      react_jsx_runtime.jsxs("label", {
                        className: "tvly_switch",
                        children: [
                          react_jsx_runtime.jsx("input", {
                            className: "tvly_switchInput",
                            type: "checkbox",
                            role: "switch",
                            "aria-checked": state.enabled,
                            checked: state.enabled,
                            disabled: !state.enabledWritable,
                            onChange: (e) => props.setEnabled(e.target.checked),
                          }),
                          react_jsx_runtime.jsx("span", { className: "tvly_switchTrack", "aria-hidden": true }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              react_jsx_runtime.jsxs("div", {
                className: "tvly_field",
                children: [
                  react_jsx_runtime.jsxs("div", {
                    className: "tvly_fieldHead",
                    children: [
                      react_jsx_runtime.jsx("span", { className: "tvly_label", children: "API Key" }),
                      react_jsx_runtime.jsx("span", {
                        className: "tvly_badge",
                        children: state.clearKey
                          ? (t ? t("keyClearing") : "Will clear key")
                          : state.keyConfigured
                            ? (t ? t("keyOk") : "Key configured")
                            : (t ? t("keyMissing") : "No key — keyless"),
                      }),
                      state.draftKey
                        ? react_jsx_runtime.jsx("button", {
                            type: "button",
                            className: "tvly_eye",
                            "aria-pressed": showKey,
                            onClick: () => setShowKey(!showKey),
                            children: showKey ? (t ? t("hideKey") : "Hide") : (t ? t("showKey") : "Show"),
                          })
                        : null,
                      state.keyConfigured && state.keyWritable && !state.clearKey
                        ? react_jsx_runtime.jsx("button", {
                            type: "button",
                            className: "tvly_clear",
                            disabled: state.saving,
                            onClick: props.stageClearKey,
                            children: t ? t("clearKey") : "Clear key",
                          })
                        : null,
                    ],
                  }),
                  react_jsx_runtime.jsx("input", {
                    className: "tvly_input",
                    type: showKey ? "text" : "password",
                    autoComplete: "off",
                    spellCheck: false,
                    placeholder: state.clearKey
                      ? (t ? t("keyPlaceholderClear") : "Save to clear the current key.")
                      : state.keyConfigured
                        ? (t ? t("keyPlaceholderKeep") : "Leave blank to keep the current key.")
                        : (t ? t("keyPlaceholderEmpty") : "Optional. Leave blank for keyless."),
                    value: state.draftKey,
                    disabled: !state.keyWritable,
                    onChange: (e) => props.setKey(e.target.value),
                  }),
                  react_jsx_runtime.jsx("p", {
                    className: "tvly_hint",
                    children: state.clearKey
                      ? (t ? t("keyHintClear") : "Save to delete the key and return to keyless.")
                      : state.keyConfigured
                        ? (t ? t("keyHintKeep") : "Not written to the settings file. Leave blank to keep the current key.")
                        : (t ? t("keyHintEmpty") : "Leave blank to use Tavily keyless; a saved key uses your account quota."),
                  }),
                ],
              }),
              react_jsx_runtime.jsxs("div", {
                className: "tvly_footer",
                children: [
                  react_jsx_runtime.jsxs("div", {
                    className: "tvly_probe",
                    children: [
                      react_jsx_runtime.jsx("button", {
                        type: "button",
                        className: "tvly_probeBtn",
                        disabled: state.probing || state.saving,
                        title: t ? t("probeHint") : "Runs one real Tavily search. Uses 1 credit when a key is configured.",
                        onClick: props.probe,
                        children: state.probing
                          ? [
                              react_jsx_runtime.jsx("span", { className: "tvly_spin", "aria-hidden": true }),
                              (t ? t("probeTesting") : "Testing…"),
                            ]
                          : (t ? t("probe") : "Test connection"),
                      }),
                      state.probeStatus === "ok"
                        ? react_jsx_runtime.jsx("p", { className: "tvly_probeStatus tvly_probeOk", children: t ? t("probeOk") : "Connected" })
                        : state.probeStatus === "fail"
                          ? react_jsx_runtime.jsx("p", { className: "tvly_probeStatus tvly_probeFail", children: probeFailText(t, state.probeFail) })
                          : null,
                    ],
                  }),
                  react_jsx_runtime.jsxs("div", {
                    className: "tvly_actions",
                    children: [
                      state.failed ? react_jsx_runtime.jsx("p", { className: "tvly_failed", children: t ? t("saveFailed") : "Save failed" }) : null,
                      react_jsx_runtime.jsx("button", {
                        type: "button",
                        className: "tvly_discard",
                        disabled: blocked,
                        onClick: props.discard,
                        children: t ? t("discard") : "Discard",
                      }),
                      react_jsx_runtime.jsx("button", {
                        type: "button",
                        className: "tvly_save",
                        disabled: blocked,
                        onClick: props.save,
                        children: state.saving
                          ? [
                              react_jsx_runtime.jsx("span", { className: "tvly_spin", "aria-hidden": true }),
                              (t ? t("saving") : "Saving…"),
                            ]
                          : (t ? t("save") : "Save"),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }) : null,
          react_jsx_runtime.jsx("p", {
            className: "tvly_live",
            role: "status",
            "aria-live": "polite",
            children: liveText(t, state),
          }),
        ],
      });
    }

    function liveText(t, state) {
      if (state.probeStatus === "ok") return t ? t("probeOk") : "Connected";
      if (state.probeStatus === "fail") return probeFailText(t, state.probeFail);
      if (state.justSaved && !state.dirty) return t ? t("savedOk") : "Settings saved";
      return "";
    }

    const inject = ["slots", "locale", "connection", "remote"];

    function apply(ctx) {
      const { api } = ctx.get("connection");
      const en = {
        title: "Tavily web search",
        description: "On: Tavily (works without a key). Off: official DeepSeek.",
        enable: "Use Tavily (off = official DeepSeek)",
        unsaved: "Unsaved",
        keyOk: "Key configured",
        keyMissing: "No key — keyless",
        keyClearing: "Will clear key",
        clearKey: "Clear key",
        keyPlaceholderKeep: "Leave blank to keep the current key.",
        keyPlaceholderEmpty: "Optional. Leave blank for keyless.",
        keyPlaceholderClear: "Save to clear the current key.",
        keyHintKeep: "Not written to the settings file. Leave blank to keep the current key.",
        keyHintEmpty: "Leave blank to use Tavily keyless. A saved key uses your account quota.",
        keyHintClear: "Save to delete the key and return to keyless.",
        saveFailed: "Save failed",
        discard: "Discard",
        save: "Save",
        saving: "Saving…",
        probe: "Test connection",
        probeTesting: "Testing…",
        probeOk: "Connected",
        probeFail: "Failed: ",
        probeTimeout: "timed out",
        probeInvalidKey: "invalid key",
        probeNetwork: "network error",
        probeUnavailable: "test endpoint unavailable",
        probeUnknown: "unknown error",
        probeHint: "Runs one real Tavily search. Uses 1 credit when a key is configured.",
        modeDeepseek: "Official DeepSeek",
        modeKeyless: "Tavily · keyless",
        modeKey: "Tavily · API key",
        showKey: "Show",
        hideKey: "Hide",
        savedOk: "Settings saved",
      };
      ctx.effect(() => injectCss(), "tavily css");
      ctx.effect(() => ctx.locale.register("web-search-tavily", { en }), "tavily locale");

      const card = new TavilyCardController(api);
      const remote = ctx.get("remote");
      if (remote) ctx.effect(() => remote.$on("credentials/updated", () => card.refresh()), "tavily creds");

      ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
        name: "settings.plugin.item",
        key: "web-search-tavily",
        locale: "web-search-tavily",
        inject: () => card.inject(),
      }, TavilyCard));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
