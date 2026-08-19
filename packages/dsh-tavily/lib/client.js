window.__ModuleLoader__.load({
  id: "dsh-tavily",
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
      tag.setAttribute("data-tavily-search-css", "7");
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
        ".tvly_discard,.tvly_save,.tvly_probeBtn{appearance:none;border:1px solid transparent;border-radius:8px;padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer}",
        ".tvly_discard,.tvly_probeBtn{border-color:var(--dsw-alias-border-l2);background:none;color:var(--dsw-alias-label-secondary)}",
        ".tvly_discard:hover:not(:disabled),.tvly_probeBtn:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}",
        ".tvly_save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}",
        ".tvly_discard:disabled,.tvly_save:disabled,.tvly_probeBtn:disabled{opacity:.4;cursor:default}",
        ".tvly_discard:focus-visible,.tvly_save:focus-visible,.tvly_probeBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}",
      ].join("");
      document.head.appendChild(tag);
      return () => tag.remove();
    }

    class TavilyCardController {
      constructor(api) {
        this.api = api;
        this.enabled = false;
        this.keyConfigured = false;
        this.keyWritable = true;
        this.enabledWritable = true;
        this.draftKey = "";
        this.draftEnabled = false;
        this.clearKey = false;
        this.saving = false;
        this.failed = false;
        this.probing = false;
        this.probeStatus = "idle";
        this.probeFail = null;
        this.store = _client_runtime.createSnapshotStore(this.projection());
        this.refresh();
      }

      projection() {
        const dirty = this.draftEnabled !== this.enabled || this.draftKey.trim() !== "" || this.clearKey;
        return {
          enabled: this.draftEnabled,
          keyConfigured: this.keyConfigured,
          keyWritable: this.keyWritable,
          enabledWritable: this.enabledWritable,
          draftKey: this.draftKey,
