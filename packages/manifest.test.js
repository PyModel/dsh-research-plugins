import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";

// What DSH's installer and the plugin market read from each published package.
const root = new URL("./", import.meta.url);
const packages = readdirSync(root).filter((d) => statSync(new URL(d, root)).isDirectory() && !d.startsWith("."));

for (const dir of packages) {
  const at = (path) => new URL(`${dir}/${path}`, root);
  const pkg = JSON.parse(readFileSync(at("package.json"), "utf8"));

  describe(pkg.name, () => {
    it("declares the supported DSH range in engines.dsh", () => {
      assert.equal(pkg.engines?.dsh, ">=0.1.5-rc.2 <0.3.0-0");
      for (const [dep, range] of Object.entries(pkg.peerDependencies ?? {})) {
        if (dep.startsWith("@deepseek-ai/dsh")) assert.equal(range, pkg.engines.dsh, dep);
      }
    });

    it("ships a small SVG icon and en/zh titles", () => {
      assert.equal(pkg.icon, "./icon.svg");
      assert.ok(statSync(at("icon.svg")).size < 32 * 1024, "market inlines icons up to 32 KiB");
      for (const lang of ["en", "zh"]) {
        const { meta } = JSON.parse(readFileSync(at(`locale/${lang}.json`), "utf8"));
        assert.ok(meta.title && meta.description, `${lang}.json meta`);
      }
    });

    it("packs the patch, icon, locales, README and LICENSE", () => {
      const [{ files }] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: at(""), encoding: "utf8" }));
      const paths = files.map((f) => f.path);
      for (const f of ["cordis.patch.yml", "icon.svg", "locale/en.json", "locale/zh.json", "README.md", "LICENSE", "package.json"]) {
        assert.ok(paths.includes(f), `${f} missing from tarball`);
      }
      assert.ok(!paths.some((p) => p.startsWith("test/")), "tests must not ship");
    });
  });
}
