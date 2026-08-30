/* ============================================================================
 * pica-boutique-calc — 核心逻辑
 * 依赖：js/data.js（数据） / js/admin.js（管理 & 编辑模式）
 * ========================================================================== */
"use strict";

/* ---------------- 存储键 ---------------- */
const LS = {
	state: "pb_state_v1",
	fav: "pb_favorites_v1",
	budget: "pb_budget_v1",
	gender: "pb_gender_v1",
	custom: "pb_custom_suits_v1",
	textOv: "pb_text_overrides_v1",
	suitOv: "pb_suit_overrides_v1",
	scheme: "pb_scheme_overrides_v1"
};

/* ---------------- 全局状态 ---------------- */
let state = {};              // { 套装名: (false|'purchase'|'backfill')[] }
let favorites = new Set();   // 收藏的套装名
let budget = { starStock: 0, todayGain: 0, lastSubmitDate: "", history: [] };
let currentGender = "female";
let customSuits = [];        // 自定义套装（管理面板添加）
let textOverrides = {};      // 页面文字修改 { textKey: html }
let suitOverrides = {};      // 内置套装修改 { 原套装名: {name?,type?,partCount?,prices?,image?,femaleImage?,maleImage?} }
let idbImages = {};          // 自定义图片缓存 { 套装名: dataURL }
let schemeOverrides = {};    // 价格体系修改（本地保存）
let backfillMode = false;
let editMode = false;

/* ---------------- 小工具 ---------------- */
function $(id) { return document.getElementById(id); }
function esc(s) {
	return String(s).replace(/[&<>"']/g, function (c) {
		return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
	});
}
function sum(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }

/* 取文字（带 {占位符} 替换）；编辑模式修改的内容优先 */
function t(key, vars) {
	let raw = (textOverrides && textOverrides[key] !== undefined) ? textOverrides[key] : TEXT[key];
	if (raw === undefined || raw === null) return "";
	raw = String(raw);
	if (vars) {
		Object.keys(vars).forEach(function (k) {
			raw = raw.split("{" + k + "}").join(esc(vars[k]));
		});
	}
	return raw;
}

/* 把 data-text 元素的文字刷新为当前 TEXT/覆盖值 */
function applyTexts() {
	document.querySelectorAll("[data-text]").forEach(function (el) {
		const k = el.getAttribute("data-text");
		const v = t(k);
		if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = v;
		else el.innerHTML = v;
	});
	document.getElementById("searchInput").placeholder = t("search.placeholder");
}

/* 图片加载失败时的占位（供 img onerror 调用） */
window.imgErr = function (el) {
	const sp = document.createElement("span");
	sp.textContent = t("card.noImage");
	el.replaceWith(sp);
};

/* ---------------- 套装数据访问 ---------------- */
/* 内置套装套用覆盖；返回最终显示的套装对象 */
function applySuitOverride(b) {
	const ov = suitOverrides[b.name];
	if (!ov) return b;
	const s = Object.assign({}, b);
	if (ov.name) s.name = ov.name;
	if (ov.type) s.type = ov.type;
	if (ov.partCount) s.partCount = ov.partCount;
	if (ov.prices) s.prices = ov.prices;
	if (ov.image) s.image = ov.image;
	if (ov.femaleImage !== undefined) s.femaleImage = ov.femaleImage;
	if (ov.maleImage !== undefined) s.maleImage = ov.maleImage;
	return s;
}

/* 全部套装 = 内置（套用覆盖）+ 自定义 */
function getAllSuits() {
	return BUILTIN_SUITS.map(applySuitOverride).concat(customSuits);
}

function getSuit(name) {
	return getAllSuits().find(function (s) { return s.name === name; }) || null;
}

function schemeKey(suit) { return schemeKeyOf(suit.type, suit.partCount); }

/* 该套装的各配件价格（有单独指定则优先） */
function getSuitPrices(suit) {
	if (suit.prices && suit.prices.length > 0) return suit.prices;
	return PRICE_SCHEMES[schemeKey(suit)].prices;
}

function getSuitPartNames(suit) {
	if (suit.partNames && suit.partNames.length > 0) return suit.partNames;
	return PRICE_SCHEMES[schemeKey(suit)].partNames;
}

function getSuitFull(suit) { return sum(getSuitPrices(suit)); }

/* 图片：自定义图片(浏览器内) > 套装指定 > 默认 images/<名>.png */
function getSuitImage(suit) {
	if (idbImages[suit.name]) return idbImages[suit.name];
	if (currentGender === "male" && suit.maleImage) return suit.maleImage;
	if (currentGender === "female" && suit.femaleImage) return suit.femaleImage;
	if (suit.image) return suit.image;
	return defaultImagePath(suit.name);
}

/* ---------------- 本地存储 ---------------- */
function lsGet(key, fallback) {
	try {
		const r = localStorage.getItem(key);
		if (r) return JSON.parse(r);
	} catch (e) { console.error(e); }
	return fallback;
}
function lsSet(key, val) {
	try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error(e); }
}

function loadState() {
	const s = lsGet(LS.state, {});
	return (typeof s === "object" && s !== null) ? s : {};
}
function saveState() { lsSet(LS.state, state); }

function loadFavorites() {
	const f = lsGet(LS.fav, []);
	return new Set(Array.isArray(f) ? f : []);
}
function saveFavorites() { lsSet(LS.fav, Array.from(favorites)); }

function loadBudget() {
	const b = lsGet(LS.budget, null);
	if (b && typeof b === "object") return Object.assign({ starStock: 0, todayGain: 0, lastSubmitDate: "", history: [] }, b);
	return { starStock: 0, todayGain: 0, lastSubmitDate: "", history: [] };
}
function saveBudget() { lsSet(LS.budget, budget); }

function loadGender() { return lsGet(LS.gender, "female") === "male" ? "male" : "female"; }
function saveGender() { lsSet(LS.gender, currentGender); }

function loadCustomSuits() {
	const c = lsGet(LS.custom, []);
	return Array.isArray(c) ? c : [];
}
function saveCustomSuits() { lsSet(LS.custom, customSuits); }

function loadTextOverrides() { const o = lsGet(LS.textOv, {}); return (typeof o === "object" && o) ? o : {}; }
function saveTextOverrides() { lsSet(LS.textOv, textOverrides); }
function loadSuitOverrides() { const o = lsGet(LS.suitOv, {}); return (typeof o === "object" && o) ? o : {}; }
function saveSuitOverrides() { lsSet(LS.suitOv, suitOverrides); }

function loadSchemeOverrides() { const o = lsGet(LS.scheme, {}); return (typeof o === "object" && o) ? o : {}; }
function saveSchemeOverrides() { lsSet(LS.scheme, schemeOverrides); }

/* 把本地保存的价格体系修改套用到 PRICE_SCHEMES */
function applySchemeOverrides() {
	Object.keys(schemeOverrides).forEach(function (k) {
		if (PRICE_SCHEMES[k] && schemeOverrides[k] && Array.isArray(schemeOverrides[k].prices)) {
			PRICE_SCHEMES[k].prices = schemeOverrides[k].prices;
		}
	});
}

/* ---------------- IndexedDB：自定义图片 ---------------- */
const IDB = (function () {
	let dbPromise = null;
	function open() {
		if (dbPromise) return dbPromise;
		dbPromise = new Promise(function (resolve, reject) {
			const req = indexedDB.open("pb_assets", 1);
			req.onupgradeneeded = function () {
				if (!req.result.objectStoreNames.contains("images")) req.result.createObjectStore("images");
			};
			req.onsuccess = function () { resolve(req.result); };
			req.onerror = function () { reject(req.error); };
		});
		return dbPromise;
	}
	return {
		set: function (key, val) {
			return open().then(function (db) {
				return new Promise(function (res, rej) {
					const tx = db.transaction("images", "readwrite");
					tx.objectStore("images").put(val, key);
					tx.oncomplete = res;
					tx.onerror = function () { rej(tx.error); };
				});
			});
		},
		del: function (key) {
			return open().then(function (db) {
				return new Promise(function (res, rej) {
					const tx = db.transaction("images", "readwrite");
					tx.objectStore("images").delete(key);
					tx.oncomplete = res;
					tx.onerror = function () { rej(tx.error); };
				});
			});
		},
		getAll: function () {
			return open().then(function (db) {
				return new Promise(function (res, rej) {
					const out = [];
					const tx = db.transaction("images", "readonly");
					const store = tx.objectStore("images");
					const cur = store.openCursor();
					cur.onsuccess = function () {
						const c = cur.result;
						if (c) { out.push({ key: c.key, value: c.value }); c.continue(); }
						else res(out);
					};
					cur.onerror = function () { rej(cur.error); };
				});
			});
		}
	};
})();

function loadIDBImages() {
	return IDB.getAll().then(function (items) {
		idbImages = {};
		items.forEach(function (it) { idbImages[it.key] = it.value; });
	}).catch(function (e) { console.error(e); });
}

/* ---------------- 状态操作 ---------------- */
function ensureState(name, len) {
	if (!state[name] || state[name].length !== len) state[name] = Array(len).fill(false);
	return state[name];
}

function getTodayStr() {
	const d = new Date();
	return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function pushHistory(entry) {
	budget.history.push(entry);
	saveBudget();
}

/* 标记/取消单个配件 */
function togglePart(name, idx) {
	const suit = getSuit(name);
	if (!suit) return;
	const prices = getSuitPrices(suit);
	const pnames = getSuitPartNames(suit);
	const arr = ensureState(name, prices.length);
	const cost = prices[idx];
	const wasOwned = arr[idx];

	if (!wasOwned) {
		if (backfillMode) {
			arr[idx] = "backfill";                       // 补录：只记录不扣星
		} else {
			if (budget.starStock < cost) {
				alert(t("msg.insufficientStars", { part: pnames[idx], cost: cost, stock: budget.starStock }));
				return;
			}
			budget.starStock -= cost;
			pushHistory({
				日期: getTodayStr(), 操作: "购买配件", 套装: name, 配件: pnames[idx],
				花费: cost, 操作后库存: budget.starStock
			});
			arr[idx] = "purchase";
		}
	} else {
		if (wasOwned === "purchase") {
			budget.starStock += cost;
			pushHistory({
				日期: getTodayStr(), 操作: "退回配件", 套装: name, 配件: pnames[idx],
				返还: cost, 操作后库存: budget.starStock
			});
		}
		arr[idx] = false;
	}
	saveState();
	render();
}

/* 勾选/取消整套时装（= 勾选/取消全部配件） */
function toggleWholeSuit(name, checked) {
	const suit = getSuit(name);
	if (!suit) return;
	const prices = getSuitPrices(suit);
	const arr = ensureState(name, prices.length);

	if (checked) {
		// 未拥有的配件全部标记为已拥有
		if (!backfillMode) {
			let need = 0;
			prices.forEach(function (p, i) { if (!arr[i]) need += p; });
			if (budget.starStock < need) {
				alert(t("msg.insufficientStars", { part: "整套·" + suit.name, cost: need, stock: budget.starStock }));
				return;
			}
			budget.starStock -= need;
			if (need > 0) {
				pushHistory({
					日期: getTodayStr(), 操作: "整套购入", 套装: name,
					花费: need, 操作后库存: budget.starStock
				});
			}
			prices.forEach(function (p, i) { if (!arr[i]) arr[i] = "purchase"; });
		} else {
			prices.forEach(function (p, i) { if (!arr[i]) arr[i] = "backfill"; });
		}
	} else {
		// 取消整套：退回「正常模式」购买的部分
		let refund = 0;
		prices.forEach(function (p, i) {
			if (arr[i] === "purchase") { refund += p; arr[i] = false; }
			else if (arr[i] === "backfill") arr[i] = false;
		});
		if (refund > 0) {
			budget.starStock += refund;
			pushHistory({
				日期: getTodayStr(), 操作: "整套退回", 套装: name,
				返还: refund, 操作后库存: budget.starStock
			});
		}
		saveBudget();
	}
	saveState();
	render();
}

/* ---------------- 统计 ---------------- */
function computeStats() {
	const suits = getAllSuits();
	const st = {
		totalStars: 0, gap: 0, ownedValue: 0,
		totalParts: 0, ownedParts: 0, ownedSuits: 0, totalSuits: suits.length, missingParts: 0
	};
	suits.forEach(function (s) {
		const prices = getSuitPrices(s);
		const arr = state[s.name] || [];
		let full = 0, ov = 0, oc = 0;
		prices.forEach(function (p, i) {
			full += p;
			st.totalParts++;
			if (arr[i]) { oc++; ov += p; }
		});
		st.totalStars += full;
		st.ownedValue += ov;
		st.ownedParts += oc;
		st.gap += full - ov;
		if (oc === prices.length) st.ownedSuits++;
	});
	st.missingParts = st.totalParts - st.ownedParts;
	return st;
}

function calcSuitInfo(s) {
	const prices = getSuitPrices(s);
	const arr = state[s.name] || [];
	let oc = 0, op = 0;
	prices.forEach(function (p, i) { if (arr[i]) { oc++; op += p; } });
	const full = sum(prices);
	return {
		name: s.name,
		ownedCount: oc,
		ownedPrice: op,
		missingPrice: Math.max(0, full - op),
		progress: prices.length ? (oc / prices.length * 100) : 0,
		fullPrice: full,
		totalParts: prices.length,
		isGold: s.type === "gold",
		isPurple: s.type === "purple",
		typeLabel: s.type === "gold" ? t("card.typeGold") : t("card.typePurple"),
		isFav: favorites.has(s.name),
		img: getSuitImage(s),
		suit: s
	};
}

/* ---------------- 预算 ---------------- */
function isBudgetInitialized() {
	return budget.starStock > 0 || budget.history.some(function (h) {
		return h.操作 === "修正已有库存" || h.操作 === "提交今日获取量";
	});
}

function toggleBackfill() {
	backfillMode = !backfillMode;
	updateBackfillUI();
	render();
}

function updateBackfillUI() {
	const btn = $("btnBackfill");
	const banner = $("backfillBanner");
	if (backfillMode) {
		btn.textContent = t("btn.backfill", { on: "开" });
		btn.className = "btn-backfill-on";
		banner.classList.add("visible");
	} else {
		btn.textContent = t("btn.backfill", { on: "关" });
		btn.className = "btn-backfill-off";
		banner.classList.remove("visible");
	}
}

function submitStarStock() {
	const inp = $("budgetStarStock");
	const ns = Math.max(0, parseInt(inp.value, 10) || 0);
	if (ns === budget.starStock) { alert(t("msg.stockNoChange")); return; }
	const os = budget.starStock;
	budget.starStock = ns;
	pushHistory({ 日期: getTodayStr(), 操作: "修正已有库存", 原库存: os, 新库存: ns });
	render();
	let msg = t("msg.stockUpdated", { old: os, new: ns });
	if (backfillMode) msg += t("msg.stockUpdatedTip");
	alert(msg);
}

function submitTodayGain() {
	const inp = $("budgetTodayGain");
	const gain = Math.max(0, parseInt(inp.value, 10) || 0);
	if (gain <= 0) { alert(t("msg.needPositiveGain")); return; }
	const today = getTodayStr();
	if (budget.lastSubmitDate === today) {
		if (!confirm(t("msg.gainConfirm"))) return;
	}
	budget.starStock += gain;
	budget.todayGain = gain;
	budget.lastSubmitDate = today;
	pushHistory({ 日期: today, 操作: "提交今日获取量", 今日获取量: gain, 提交后库存: budget.starStock });
	render();
	alert(t("msg.gainSuccess", { gain: gain, stock: budget.starStock }));
}

function clearStarStock() {
	if (!confirm(t("msg.confirmClearStock"))) return;
	budget.starStock = 0;
	saveBudget();
	render();
}

function clearBudgetHistory() {
	if (!confirm(t("msg.confirmClearHistory"))) return;
	budget.history = [];
	budget.lastSubmitDate = "";
	saveBudget();
	render();
}

function renderBudget() {
	const stockInp = $("budgetStarStock");
	const gainInp = $("budgetTodayGain");
	if (document.activeElement !== stockInp) stockInp.value = budget.starStock;
	if (document.activeElement !== gainInp) gainInp.value = budget.todayGain;
	$("budgetStockDisplay").textContent = budget.starStock;
	$("budgetTodayDisplay").textContent = budget.todayGain;
	const cv = $("starCounterVal");
	if (cv) cv.textContent = budget.starStock;

	const gap = computeStats().gap;
	const need = Math.max(0, gap - budget.starStock);
	$("budgetNeed").textContent = need;

	if (need <= 0) {
		$("budgetDaysNormal").textContent = "0 天";
		$("budgetDaysMax").textContent = "0 天";
	} else {
		const tg = Math.max(1, budget.todayGain);
		$("budgetDaysNormal").textContent = Math.ceil(need / tg) + " 天";
		$("budgetDaysMax").textContent = Math.ceil(need / 25) + " 天";
	}

	const he = $("budgetHistoryText");
	if (budget.history.length === 0) he.textContent = "暂无记录";
	else he.textContent = budget.history.slice().reverse().map(function (h) {
		if (h.操作 === "修正已有库存") return h.日期 + " ｜ 修正库存 " + h.原库存 + " → " + h.新库存;
		if (h.操作 === "提交今日获取量") return h.日期 + " ｜ +" + h.今日获取量 + "⭐（今日获取）→ 库存 " + h.提交后库存;
		if (h.操作 === "购买配件") return h.日期 + " ｜ -" + h.花费 + "⭐ 购入【" + h.套装 + "】" + h.配件 + " → 库存 " + h.操作后库存;
		if (h.操作 === "退回配件") return h.日期 + " ｜ +" + h.返还 + "⭐ 退回【" + h.套装 + "】" + h.配件 + " → 库存 " + h.操作后库存;
		if (h.操作 === "整套购入") return h.日期 + " ｜ -" + h.花费 + "⭐ 整套购入【" + h.套装 + "】 → 库存 " + h.操作后库存;
		if (h.操作 === "整套退回") return h.日期 + " ｜ +" + h.返还 + "⭐ 整套退回【" + h.套装 + "】 → 库存 " + h.操作后库存;
		if (h.操作 === "清除全部数据并返还") return h.日期 + " ｜ +" + h.返还 + "⭐（清除全部返还）→ 库存 " + h.操作后库存;
		return JSON.stringify(h);
	}).join("\n");

	const guide = $("budgetGuide");
	guide.innerHTML = budget.starStock > 0 ? t("budget.desc.filled") : t("budget.desc.initial");
	$("budgetTipContent").innerHTML = t("budget.tipContent");
}

/* ---------------- 图表（纯 SVG，无外部依赖） ---------------- */
function renderDonut(wrapId, legendId, data, centerB, centerLabel) {
	const wrap = $(wrapId);
	const legend = $(legendId);
	if (!wrap) return;
	const total = data.reduce(function (a, b) { return a + b.value; }, 0);
	if (total <= 0) { wrap.innerHTML = ""; return; }
	const r = 82, C = 2 * Math.PI * r;
	let acc = 0;
	let svg = '<svg viewBox="0 0 220 220" width="220" height="220">';
	svg += '<circle cx="110" cy="110" r="' + r + '" fill="none" stroke="#eee" stroke-width="26"/>';
	svg += '<g transform="rotate(-90 110 110)">';
	data.forEach(function (d) {
		if (d.value <= 0) return;
		const frac = d.value / total;
		const len = frac * C;
		svg += '<circle cx="110" cy="110" r="' + r + '" fill="none" stroke="' + d.color + '" stroke-width="26"'
			+ ' stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '"'
			+ ' stroke-dashoffset="' + (-acc * C).toFixed(2) + '"/>';
		acc += frac;
	});
	svg += '</g></svg>';
	wrap.innerHTML = svg + '<div class="donut-center"><b>' + centerB + '</b><span>' + centerLabel + '</span></div>';
	legend.innerHTML = data.map(function (d) {
		return '<span><span class="dot" style="background:' + d.color + '"></span>' + esc(d.label) + '：' + d.value + '</span>';
	}).join("");
}

/* ---------------- 卡片 ---------------- */
function createCard(item) {
	const card = document.createElement("div");
	card.className = "card " + (item.isGold ? "gold" : "purple");
	card.dataset.suit = item.name;
	const prices = getSuitPrices(item.suit);
	const pnames = getSuitPartNames(item.suit);

	let partsHtml = "";
	prices.forEach(function (p, i) {
		const isOwned = state[item.name] && state[item.name][i];
		let cls = "part";
		if (isOwned) cls += " owned";
		else if (!backfillMode && p > budget.starStock) cls += " unaffordable";
		partsHtml += '<span class="' + cls + '" data-suit="' + esc(item.name) + '" data-index="' + i + '">'
			+ esc(pnames[i]) + " " + p + "</span>";
	});

	const allOwned = item.ownedCount === item.totalParts && item.totalParts > 0;
	const someOwned = item.ownedCount > 0 && !allOwned;
	const wholeChecked = allOwned ? " checked" : "";

	card.innerHTML =
		'<div class="card-header">'
		+ '<div><div class="suit-name">' + esc(item.name) + '</div>'
		+ '<div class="suit-type-badge ' + (item.isGold ? "gold" : "purple") + '" data-suit="' + esc(item.name) + '" title="点击切换 金装/紫装（编辑模式）">' + esc(item.typeLabel) + '</div></div>'
		+ '<div class="card-actions">'
		+ '<button class="fav-btn ' + (item.isFav ? "active" : "") + '" data-name="' + esc(item.name) + '" title="收藏">★</button>'
		+ '<button class="suit-edit-btn" data-name="' + esc(item.name) + '">⚙ 编辑</button>'
		+ '</div></div>'
		+ '<div class="whole-row"><label><input type="checkbox" class="whole-cb" data-suit="' + esc(item.name) + '"' + wholeChecked + '> '
		+ esc(t("card.whole")) + (allOwned ? ' <span class="whole-checked">✓ ' + esc(t("card.whole")) + '</span>' : "") + '</label></div>'
		+ '<div class="suit-image"><img loading="lazy" src="' + esc(item.img) + '" alt="' + esc(item.name) + '" onerror="imgErr(this)"></div>'
		+ '<div class="suit-meta">' + esc(t("card.meta", { type: item.typeLabel, full: item.fullPrice })) + '</div>'
		+ '<div class="suit-cost">' + t("card.ownedFmt", { owned: item.ownedCount, total: item.totalParts, missing: item.missingPrice }) + '</div>'
		+ '<div class="progress-bar-bg"><div class="progress-bar" style="width:' + item.progress + '%"></div></div>'
		+ '<div class="parts">' + partsHtml + '</div>';

	/* 收藏 */
	card.querySelector(".fav-btn").addEventListener("click", function () {
		const n = this.dataset.name;
		if (favorites.has(n)) favorites.delete(n);
		else favorites.add(n);
		saveFavorites();
		render();
	});

	/* 单个配件 */
	card.querySelectorAll(".part").forEach(function (el) {
		el.addEventListener("click", function () {
			togglePart(this.dataset.suit, parseInt(this.dataset.index, 10));
		});
	});

	/* 整套勾选 */
	const cb = card.querySelector(".whole-cb");
	if (someOwned) cb.indeterminate = true;
	cb.addEventListener("change", function () {
		toggleWholeSuit(this.dataset.suit, this.checked);
	});

	/* 编辑模式：⚙ 编辑按钮 / 类型徽标 / 6件⇄7件（绑定在 admin.js 里声明的全局函数） */
	if (window.bindSuitEditControls) window.bindSuitEditControls(card, item.suit);
	else {
		const eb = card.querySelector(".suit-edit-btn");
		if (eb) eb.addEventListener("click", function () { if (window.openSuitEditor) window.openSuitEditor(this.dataset.name); });
		const tb = card.querySelector(".suit-type-badge");
		if (tb) tb.addEventListener("click", function () { if (window.toggleSuitType) window.toggleSuitType(this.dataset.suit); });
	}
	return card;
}

/* ---------------- 渲染 ---------------- */
function render() {
	applyTexts();

	const filterType = $("filterType").value;
	const sortType = $("sortType").value;
	const searchText = $("searchInput").value.trim().toLowerCase();

	const stats = computeStats();
	$("totalStars").textContent = stats.totalStars;
	$("needStars").textContent = stats.gap;
	$("totalSuits").textContent = stats.totalSuits;
	$("totalParts").textContent = stats.totalParts;
	$("ownedParts").textContent = stats.ownedParts;
	$("missingParts").textContent = stats.missingParts;
	$("ownedSuits").textContent = stats.ownedSuits;
	$("ownedValue").textContent = stats.ownedValue;

	let list = getAllSuits().map(function (s) { return calcSuitInfo(s); });
	if (searchText) list = list.filter(function (i) { return i.name.toLowerCase().includes(searchText); });
	if (filterType === "gold") list = list.filter(function (i) { return i.isGold; });
	else if (filterType === "purple") list = list.filter(function (i) { return i.isPurple; });
	else if (filterType === "fav") list = list.filter(function (i) { return i.isFav; });

	if (sortType === "missingAsc") list.sort(function (a, b) { return a.missingPrice - b.missingPrice; });
	else if (sortType === "missingDesc") list.sort(function (a, b) { return b.missingPrice - a.missingPrice; });
	else if (sortType === "progressAsc") list.sort(function (a, b) { return a.progress - b.progress; });
	else if (sortType === "progressDesc") list.sort(function (a, b) { return b.progress - a.progress; });

	const favList = list.filter(function (i) { return i.isFav; });
	const favSec = $("favSection");
	if (favList.length > 0) {
		favSec.style.display = "block";
		const fc = $("favContainer");
		fc.innerHTML = "";
		favList.forEach(function (i) { fc.appendChild(createCard(i)); });
	} else {
		favSec.style.display = "none";
	}

	const allCont = $("allContainer");
	allCont.innerHTML = "";
	list.forEach(function (i) { allCont.appendChild(createCard(i)); });

	/* 图表 */
	const pct = stats.totalParts ? Math.round(stats.ownedParts / stats.totalParts * 100) : 0;
	renderDonut("overviewDonut", "overviewLegend", [
		{ value: stats.ownedParts, color: "#2ecc71", label: t("chart.overviewOwned") },
		{ value: stats.missingParts, color: "#e74c32", label: t("chart.overviewMissing") }
	], pct + "%", "整体进度");

	const favItems = list.filter(function (i) { return i.isFav; });
	const favDonut = $("favDonut");
	const favEmpty = $("favEmptyMsg");
	if (favItems.length > 0) {
		let ownVal = 0, totVal = 0;
		favItems.forEach(function (it) {
			ownVal += it.ownedPrice;
			totVal += it.fullPrice;
		});
		const missVal = Math.max(0, totVal - ownVal);
		favDonut.style.display = "block";
		favEmpty.style.display = "none";
		const fpct = totVal ? Math.round(ownVal / totVal * 100) : 0;
		renderDonut("favDonut", "favLegend", [
			{ value: ownVal, color: "#3498db", label: t("chart.favOwned") },
			{ value: missVal, color: "#e67e22", label: t("chart.favMissing") }
		], fpct + "%", "收藏进度");
	} else {
		favDonut.style.display = "none";
		favEmpty.style.display = "flex";
		favEmpty.textContent = t("chart.favEmpty");
		$("favLegend").innerHTML = "";
	}

	renderBudget();
	updateBackfillUI();
	updateEditModeUI();
	enableInlineEdit();
}

/* ---------------- 性别 ---------------- */
function setGender(g) {
	currentGender = g === "male" ? "male" : "female";
	saveGender();
	syncGenderUI();
	render();
}
function syncGenderUI() {
	document.querySelectorAll('input[name="gender"]').forEach(function (input) {
		input.checked = input.value === currentGender;
	});
}

/* ---------------- 编辑模式（开关由 admin.js 调用） ---------------- */
function updateEditModeUI() {
	const btn = $("btnEditMode");
	if (editMode) {
		btn.textContent = t("btn.editMode", { on: "开" });
		btn.className = "btn-editmode-on";
		document.body.classList.add("edit-mode");
	} else {
		btn.textContent = t("btn.editMode", { on: "关" });
		btn.className = "btn-editmode-off";
		document.body.classList.remove("edit-mode");
	}
}

/* 编辑模式：点击页面文字直接修改 */
function enableInlineEdit() {
	if (!editMode) return;
	document.querySelectorAll("[data-text]").forEach(function (el) {
		if (el.dataset.editBound) return;
		el.dataset.editBound = "1";
		el.addEventListener("click", function (e) {
			if (!editMode) return;
			if (e.target.closest("a,button,input,select,textarea,label,summary")) return;
			e.preventDefault();
			e.stopPropagation();
			const key = this.getAttribute("data-text");
			this.contentEditable = "true";
			this.focus();
			const range = document.createRange();
			range.selectNodeContents(this);
			const sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
			const finish = function () {
				this.contentEditable = "false";
				textOverrides[key] = this.innerHTML;
				saveTextOverrides();
				this.removeEventListener("blur", finish);
				this.removeEventListener("keydown", onKey);
				applyTexts();
			};
			const onKey = function (e2) {
				if (e2.key === "Enter" && !e2.shiftKey) { e2.preventDefault(); this.blur(); }
				else if (e2.key === "Escape") { e2.preventDefault(); this.blur(); }
			};
			this.addEventListener("blur", finish);
			this.addEventListener("keydown", onKey);
		});
	});
}

/* ---------------- 数据管理 ---------------- */
function clearData() {
	if (!confirm(t("msg.confirmClearData"))) return;
	let refund = 0;
	getAllSuits().forEach(function (s) {
		const prices = getSuitPrices(s);
		(state[s.name] || []).forEach(function (o, i) {
			if (o === "purchase") refund += prices[i];
		});
	});
	if (refund > 0) {
		budget.starStock += refund;
		pushHistory({ 日期: getTodayStr(), 操作: "清除全部数据并返还", 返还: refund, 操作后库存: budget.starStock });
	}
	state = {};
	favorites = new Set();
	saveState();
	saveFavorites();
	render();
}

function downloadFile(filename, text, mime) {
	const blob = new Blob([text], { type: mime || "application/octet-stream" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function exportData() {
	const data = {
		version: DATA_VERSION,
		exportTime: new Date().toISOString(),
		gender: currentGender,
		state: state,
		favorites: Array.from(favorites),
		budget: budget,
		customSuits: customSuits,
		textOverrides: textOverrides,
		suitOverrides: suitOverrides,
		customImages: {}
	};
	customSuits.forEach(function (s) { if (idbImages[s.name]) data.customImages[s.name] = idbImages[s.name]; });
	downloadFile("洛克王国时装许愿星数据.json", JSON.stringify(data, null, 2), "application/json");
}

function importData() {
	const inp = document.createElement("input");
	inp.type = "file";
	inp.accept = ".json";
	inp.onchange = function () {
		const file = inp.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = function (e) {
			try {
				const data = JSON.parse(e.target.result);
				if (data.gender === "male" || data.gender === "female") currentGender = data.gender;
				if (data.state && typeof data.state === "object") state = data.state;
				if (Array.isArray(data.favorites)) favorites = new Set(data.favorites);
				if (data.budget && typeof data.budget === "object") {
					budget = Object.assign({ starStock: 0, todayGain: 0, lastSubmitDate: "", history: [] }, data.budget);
					if (!Array.isArray(budget.history)) budget.history = [];
				}
				if (Array.isArray(data.customSuits)) customSuits = data.customSuits;
				if (data.textOverrides && typeof data.textOverrides === "object") textOverrides = data.textOverrides;
				if (data.suitOverrides && typeof data.suitOverrides === "object") suitOverrides = data.suitOverrides;

				/* 恢复自定义图片到 IndexedDB */
				const imgs = data.customImages || {};
				const keys = Object.keys(imgs);
				Promise.all(keys.map(function (k) { return IDB.set(k, imgs[k]); })).then(function () {
					return loadIDBImages();
				}).then(function () {
					saveState(); saveFavorites(); saveGender(); saveCustomSuits();
					saveTextOverrides(); saveSuitOverrides();
					syncGenderUI();
					render();
					alert(t("msg.importSuccess"));
				}).catch(function (err) {
					alert(t("msg.importFail", { err: err.message }));
				});
			} catch (err) {
				alert(t("msg.importFail", { err: err.message }));
			}
		};
		reader.readAsText(file);
	};
	inp.click();
}

/* ---------------- 事件绑定 & 启动 ---------------- */
function bindStaticEvents() {
	$("btnClear").addEventListener("click", clearData);
	$("btnExport").addEventListener("click", exportData);
	$("btnImport").addEventListener("click", importData);
	$("btnBackfill").addEventListener("click", toggleBackfill);
	$("btnSubmitStock").addEventListener("click", submitStarStock);
	$("btnSubmitGain").addEventListener("click", submitTodayGain);
	$("btnClearStock").addEventListener("click", clearStarStock);
	$("btnClearHistory").addEventListener("click", clearBudgetHistory);
	$("filterType").addEventListener("change", render);
	$("sortType").addEventListener("change", render);
	$("searchInput").addEventListener("input", render);
	document.querySelectorAll('input[name="gender"]').forEach(function (input) {
		input.addEventListener("change", function () { setGender(this.value); });
	});
}

function initPage() {
	state = loadState();
	favorites = loadFavorites();
	budget = loadBudget();
	currentGender = loadGender();
	customSuits = loadCustomSuits();
	textOverrides = loadTextOverrides();
	suitOverrides = loadSuitOverrides();
	schemeOverrides = loadSchemeOverrides();
	applySchemeOverrides();

	/* 合并 js/data.js 里开发者写死的 EXTRA_SUITS（管理面板导出的永久内置代码） */
	if (typeof EXTRA_SUITS !== "undefined" && Array.isArray(EXTRA_SUITS)) {
		EXTRA_SUITS.forEach(function (e) {
			if (!customSuits.some(function (c) { return c.name === e.name; })) customSuits.push(e);
		});
	}

	loadIDBImages().then(function () {
		backfillMode = !isBudgetInitialized();
		syncGenderUI();
		bindStaticEvents();
		if (window.bindAdminEvents) window.bindAdminEvents();
		render();
	});
}

document.addEventListener("DOMContentLoaded", initPage);
