/* ============================================================================
 * 同步检查工具：对比「时装基本信息.json」与当前 js/data.js 的差异
 * 用法（在仓库根目录）：
 *   node tools/sync-check.js [时装基本信息.json 的路径，默认 ./时装基本信息.json]
 * 输出差异列表；无差异即表示 data.js 已与导出的基本信息完全一致
 * ========================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* ---- 极简浏览器 API 桩（仅用于加载 data.js / app.js） ---- */
function makeEl(id) {
	return {
		id: id || "", value: "", textContent: "", _html: undefined, className: "", placeholder: "",
		checked: false, indeterminate: false, disabled: false, files: [], dataset: {}, style: {},
		attributes: {}, classList: { add() {}, remove() {}, contains() { return false; } },
		addEventListener() {}, removeEventListener() {}, setAttribute() {}, getAttribute() { return null; },
		querySelector() { return makeEl("q"); }, querySelectorAll() { return []; }, focus() {}, blur() {}, click() {},
		replaceWith() {}, contentEditable: "false", src: "", selected: false, options: [], children: [],
		appendChild(c) { return c; }
	};
}
global.document = {
	getElementById: () => makeEl("x"), querySelectorAll: () => [], createElement: () => makeEl("d"),
	createTextNode: (t) => ({ textContent: t, nodeType: 3 }), addEventListener: () => {},
	createRange: () => ({ selectNodeContents() {} }), getSelection: () => ({ removeAllRanges() {}, addRange() {} }),
	activeElement: null, body: makeEl("body")
};
global.location = { href: "http://localhost/" };
global.localStorage = { _s: {}, getItem(k) { return this._s[k] !== undefined ? this._s[k] : null; }, setItem(k, v) { this._s[k] = String(v); }, removeItem(k) { delete this._s[k]; } };
global.indexedDB = { open() { const store = { put() { return {}; }, delete() { return {}; }, openCursor() { return { onsuccess: null, result: null }; } }; const req = { result: { objectStoreNames: { contains: () => false }, createObjectStore: () => store, transaction: () => ({ objectStore: () => store, oncomplete: null, onerror: null }) }, onupgradeneeded: null, onsuccess: null, onerror: null }; queueMicrotask(() => { if (req.onupgradeneeded) req.onupgradeneeded(); if (req.onsuccess) req.onsuccess(); }); return req; } };
global.alert = () => {}; global.confirm = () => true; global.prompt = () => "";
global.Blob = class {}; global.URL = { createObjectURL: () => "", revokeObjectURL() {} };
global.FileReader = class { readAsText() {} };
global.window = global;

const base = __dirname + "/../";
vm.runInThisContext(fs.readFileSync(path.join(base, "js/data.js"), "utf8"), { filename: "data.js" });
vm.runInThisContext(fs.readFileSync(path.join(base, "js/app.js"), "utf8"), { filename: "app.js" });

const src = process.argv[2] || path.join(process.cwd(), "时装基本信息.json");
if (!fs.existsSync(src)) { console.error("找不到文件: " + src); process.exit(2); }
const theirs = JSON.parse(fs.readFileSync(src, "utf8"));
const ours = vm.runInThisContext("buildBasicData()");

function j(a) { return JSON.stringify(a); }
let diffCount = 0;
function report(cond, label, extra) {
	if (!cond) { diffCount++; console.log("  ✗ " + label + (extra !== undefined ? "  " + extra : "")); }
}

console.log("== 主题对比 ==");
report(theirs.themes.length === ours.themes.length, "主题数量一致", theirs.themes.length + " vs " + ours.themes.length);
for (let i = 0; i < Math.max(theirs.themes.length, ours.themes.length); i++) {
	const a = theirs.themes[i], b = ours.themes[i];
	if (!a) { report(false, "我方多出主题 seq=" + b.seq + " " + b.name); continue; }
	if (!b) { report(false, "对方多出主题 seq=" + a.seq + " " + a.name); continue; }
	report(a.name === b.name, "主题" + a.seq + " 名称", (a.name || "?") + " vs " + (b.name || "?"));
	report((a.entryTime || null) === (b.entryTime || null), "主题" + a.seq + " 入池时间", JSON.stringify(a.entryTime) + " vs " + JSON.stringify(b.entryTime));
	report(a.pooled === b.pooled, "主题" + a.seq + " 已入池", a.pooled + " vs " + b.pooled);
	report(j(a.suits) === j(b.suits), "主题" + a.seq + " 时装列表", j(a.suits) + " vs " + j(b.suits));
}

console.log("== 时装对比 ==");
report(theirs.suits.length === ours.suits.length, "时装数量一致", theirs.suits.length + " vs " + ours.suits.length);
const map = {};
ours.suits.forEach(function (s) { map[s.name] = s; });
for (const a of theirs.suits) {
	const b = map[a.name];
	if (!b) { report(false, "对方新增时装: " + a.name + " type=" + a.type + " partCount=" + a.partCount); continue; }
	report(a.type === b.type, "时装 " + a.name + " 品质", a.type + " vs " + b.type);
	report(a.partCount === b.partCount, "时装 " + a.name + " 件数", a.partCount + " vs " + b.partCount);
	report(j(a.prices) === j(b.prices), "时装 " + a.name + " 价格", j(a.prices) + " vs " + j(b.prices));
	/* 图片：显式路径与默认路径等价时不算差异 */
	const defF = "images/" + a.name + "女装.png", defM = "images/" + a.name + "男装.png";
	const okF = (a.femaleImage || null) === (b.femaleImage || null) || ((a.femaleImage || defF) === defF && !b.femaleImage);
	const okM = (a.maleImage || null) === (b.maleImage || null) || ((a.maleImage || defM) === defM && !b.maleImage);
	report(okF, "时装 " + a.name + " 女装图");
	report(okM, "时装 " + a.name + " 男装图");
}
for (const name of Object.keys(map)) {
	if (!theirs.suits.some(function (s) { return s.name === name; })) {
		report(false, "对方删除时装: " + name);
	}
}

console.log("\n差异总数: " + diffCount + (diffCount === 0 ? "（data.js 与基本信息一致 ✓）" : ""));
process.exit(diffCount > 0 ? 1 : 0);
