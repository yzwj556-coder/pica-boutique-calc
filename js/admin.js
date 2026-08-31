/* ============================================================================
 * pica-boutique-calc — 管理面板 & 编辑模式
 * 功能：添加/编辑套装（含图片上传）、编辑页面文字、编辑价格体系、
 *       金装⇄紫装 快速切换、紫装 6件⇄7件、导出 data.js 代码片段
 * ========================================================================== */
"use strict";

let currentEditName = null;   // 正在编辑的套装名；null = 新建
let pendingUploadF = null;    // 女装上传图片 dataURL
let pendingUploadM = null;    // 男装上传图片 dataURL
let pendingUploadNameF = "";  // 女装上传文件名
let pendingUploadNameM = "";  // 男装上传文件名

/* ---------------- 模态框 ---------------- */
function openModal(html) {
	$("modalBody").innerHTML = html;
	$("modalMask").classList.add("open");
}
function closeModal() {
	$("modalMask").classList.remove("open");
	currentEditName = null;
	pendingUploadF = null;
	pendingUploadM = null;
	pendingUploadNameF = "";
	pendingUploadNameM = "";
	themeUploads = {};
}

/* ---------------- 套装名迁移（改名后同步 state/收藏/图片缓存，男女装图片一起迁移） ---------------- */
function migrateSuitName(oldName, newName) {
	if (oldName === newName) return;
	if (state[oldName] !== undefined) {
		state[newName] = state[oldName];
		delete state[oldName];
	}
	if (favorites.has(oldName)) {
		favorites.delete(oldName);
		favorites.add(newName);
	}
	["", "::male"].forEach(function (suf) {
		if (idbImages[oldName + suf] !== undefined) {
			idbImages[newName + suf] = idbImages[oldName + suf];
			delete idbImages[oldName + suf];
		}
	});
}

/* 修改套装属性（自定义 or 内置覆盖）；dropPrices=true 时清除单独价格（回到默认价格体系） */
function applySuitProps(name, props) {
	const ci = customSuits.findIndex(function (s) { return s.name === name; });
	if (ci >= 0) {
		const e = customSuits[ci];
		if (props.type) e.type = props.type;
		if (props.partCount) e.partCount = props.partCount;
		if (props.dropPrices) delete e.prices;
		saveCustomSuits();
		return;
	}
	/* 内置套装：以原内置名为 key（支持已改过名的情况） */
	let key = null;
	const k1 = BUILTIN_SUITS.find(function (x) { return x.name === name; });
	if (k1) key = k1.name;
	else {
		key = Object.keys(suitOverrides).find(function (k) {
			return suitOverrides[k] && suitOverrides[k].name === name;
		}) || null;
	}
	if (!key) return;
	const ov = suitOverrides[key] || {};
	if (props.type) ov.type = props.type;
	if (props.partCount) ov.partCount = props.partCount;
	if (props.dropPrices) delete ov.prices;
	suitOverrides[key] = ov;
	saveSuitOverrides();
}

/* 编辑模式：快速切换 金装⇄紫装 */
function toggleSuitType(name) {
	if (!editMode) return;
	const suit = getSuit(name);
	if (!suit) return;
	const to = suit.type === "gold" ? "purple" : "gold";
	const fromLabel = suit.type === "gold" ? t("card.typeGold") : t("card.typePurple");
	const toLabel = to === "gold" ? t("card.typeGold") : t("card.typePurple");
	if (!confirm(t("msg.confirmSwitchType", { name: name, from: fromLabel, to: toLabel }))) return;
	applySuitProps(name, { type: to, dropPrices: true });
	render();
}

/* 编辑模式：紫装 6件⇄7件 */
function toggleSuitCount(name) {
	if (!editMode) return;
	const suit = getSuit(name);
	if (!suit || suit.type !== "purple") return;
	const nc = suit.partCount === 6 ? 7 : 6;
	applySuitProps(name, { partCount: nc, dropPrices: true });
	render();
}

/* app.js 的 createCard 调用：绑定卡片上的编辑控件 */
function bindSuitEditControls(card, suit) {
	const eb = card.querySelector(".suit-edit-btn");
	if (eb) eb.addEventListener("click", function () { openSuitEditor(suit.name); });
	const tb = card.querySelector(".suit-type-badge");
	if (tb) tb.addEventListener("click", function () { toggleSuitType(suit.name); });
	if (suit.type === "purple") {
		const btn = document.createElement("button");
		btn.className = "suit-count-toggle";
		btn.textContent = "6件⇄7件";
		btn.title = "切换紫装价格体系（编辑模式）";
		btn.addEventListener("click", function () { toggleSuitCount(suit.name); });
		const ca = card.querySelector(".card-actions");
		if (ca) ca.appendChild(btn);
	}
}

/* ---------------- 套装编辑器 ---------------- */
function suitEditorHtml(suit) {
	const isNew = !suit;
	const name = suit ? suit.name : "";
	const type = suit ? suit.type : "purple";
	const partCount = suit ? suit.partCount : 6;
	const scheme = PRICE_SCHEMES[schemeKeyOf(type, partCount)];
	const isCustom = suit ? customSuits.some(function (s) { return s.name === name; }) : false;
	const useDefault = suit ? !(suit.prices && suit.prices.length > 0) : true;

	let actions = '<button class="btn-save" id="btnSeSave">' + esc(t("admin.save")) + '</button>'
		+ '<button class="btn-cancel" id="btnCancelModal">' + esc(t("admin.cancel")) + '</button>';
	if (isCustom) {
		actions += '<button class="btn-danger2" id="btnSeDelete">' + esc(t("admin.delete")) + '</button>'
			+ '<button class="btn-export" id="btnSeDownloadF">' + esc(t("admin.downloadImageF")) + '</button>'
			+ '<button class="btn-export" id="btnSeDownloadM">' + esc(t("admin.downloadImageM")) + '</button>';
	}

	const pathF = effectiveImagePath(suit, "female");
	const pathM = effectiveImagePath(suit, "male");

	/* 所属主题下拉 */
	const curTheme = suit ? suitTheme(suit.name) : null;
	const themesOpts = getThemes().map(function (th) {
		return '<option value="' + th.seq + '"' + (curTheme && curTheme.theme.seq === th.seq ? " selected" : "") + '>' + esc(th.name) + '</option>';
	}).join("");

	return '<h3>' + esc(isNew ? t("admin.title") : t("admin.title") + " · " + name) + '</h3>'
		+ '<div class="field"><label>' + esc(t("admin.name")) + '</label>'
		+ '<input type="text" id="seName" value="' + esc(name) + '"></div>'

		+ '<div class="field"><label>' + esc(t("admin.theme")) + '</label>'
		+ '<select id="seTheme">' + (themesOpts || '<option value="">' + esc(t("admin.themeNone")) + '</option>') + '</select></div>'

		+ '<div class="field"><label>' + esc(t("admin.type")) + '</label><div class="radio-row">'
		+ '<label><input type="radio" name="seType" value="gold" ' + (type === "gold" ? "checked" : "") + '> ' + esc(t("admin.typeGold", { n: sum(PRICE_SCHEMES.gold6.prices) })) + '</label>'
		+ '<label><input type="radio" name="seType" value="purple" ' + (type === "purple" ? "checked" : "") + '> ' + esc(t("admin.typePurple", { n: sum(PRICE_SCHEMES.purple6.prices) })) + '</label>'
		+ '</div></div>'

		+ '<div class="field"><label>' + esc(t("admin.partCount")) + '</label><div class="radio-row">'
		+ '<label><input type="radio" name="seCount" value="6" ' + (partCount === 6 ? "checked" : "") + '> ' + esc(t("admin.partCount6")) + '</label>'
		+ '<label><input type="radio" name="seCount" value="7" ' + (partCount === 7 ? "checked" : "") + '> ' + esc(t("admin.partCount7")) + '</label>'
		+ '</div></div>'

		+ '<div class="field"><label><input type="checkbox" id="seDefaultPrices" ' + (useDefault ? "checked" : "") + '> 使用该类型的默认价格</label>'
		+ '<div class="price-grid" id="sePriceGrid"></div>'
		+ '<div class="total-row" id="seTotalRow"></div></div>'

		+ '<div class="field"><label>' + esc(t("admin.imageFemale")) + '</label>'
		+ '<input type="file" id="seImageFileF" accept="image/*">'
		+ '<input type="text" id="seImagePathF" placeholder="' + esc(t("admin.imagePath")) + '" value="' + esc(pathF) + '" style="margin-top:6px">'
		+ '<img id="sePreviewF" class="img-preview" alt=""></div>'

		+ '<div class="field"><label>' + esc(t("admin.imageMale")) + '</label>'
		+ '<input type="file" id="seImageFileM" accept="image/*">'
		+ '<input type="text" id="seImagePathM" placeholder="' + esc(t("admin.imagePath")) + '" value="' + esc(pathM) + '" style="margin-top:6px">'
		+ '<img id="sePreviewM" class="img-preview" alt=""></div>'

		+ '<div style="font-size:12px;color:#888;margin-bottom:10px">' + esc(t("admin.imageHint")) + '</div>'

		+ '<div class="actions">' + actions + '</div>';
}

/* 编辑器里展示/保存的图片路径：有浏览器内上传图则为空串，否则为当前生效路径 */
function effectiveImagePath(suit, gender) {
	if (!suit) return "";
	if (idbImages[idbKey(suit.name, gender)]) return "";
	if (gender === "male") {
		if (suit.maleImage) return suit.maleImage;
		if (suit.image) return suit.image;
		return defaultImagePath(suit.name, "male");
	}
	if (suit.femaleImage) return suit.femaleImage;
	if (suit.image) return suit.image;
	return defaultImagePath(suit.name, "female");
}

function refreshPriceGrid() {
	const type = document.querySelector('input[name="seType"]:checked').value;
	const count = parseInt(document.querySelector('input[name="seCount"]:checked').value, 10);
	const scheme = PRICE_SCHEMES[schemeKeyOf(type, count)];
	const useDefault = $("seDefaultPrices").checked;
	const grid = $("sePriceGrid");
	/* 尽量保留用户已填写的旧值 */
	const oldVals = [];
	grid.querySelectorAll("input[data-i]").forEach(function (inp) {
		oldVals[parseInt(inp.dataset.i, 10)] = Math.max(0, parseInt(inp.value, 10) || 0);
	});
	grid.innerHTML = scheme.partNames.map(function (pn, i) {
		let v;
		if (useDefault) v = scheme.prices[i];
		else if (oldVals[i] !== undefined) v = oldVals[i];
		else v = scheme.prices[i];
		return '<div class="price-cell"><span>' + esc(pn) + '</span>'
			+ '<input data-i="' + i + '" type="number" min="0" value="' + v + '" ' + (useDefault ? "disabled" : "") + '></div>';
	}).join("");
	updateTotal();
}

function updateTotal() {
	const grid = $("sePriceGrid");
	if (!grid) return;
	let total = 0;
	grid.querySelectorAll("input[data-i]").forEach(function (inp) {
		total += Math.max(0, parseInt(inp.value, 10) || 0);
	});
	const row = $("seTotalRow");
	if (row) row.innerHTML = t("admin.fullPrice", { n: total });
}

function onImageFile(e, which) {
	const file = e.target.files && e.target.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = function (ev) {
		if (which === "M") {
			pendingUploadM = ev.target.result;
			pendingUploadNameM = file.name;
		} else {
			pendingUploadF = ev.target.result;
			pendingUploadNameF = file.name;
		}
		const pv = $(which === "M" ? "sePreviewM" : "sePreviewF");
		if (pv) {
			pv.src = ev.target.result;
			pv.style.display = "block";
		}
	};
	reader.readAsDataURL(file);
}

function openSuitEditor(name) {
	currentEditName = name || null;
	pendingUploadF = null;
	pendingUploadM = null;
	pendingUploadNameF = "";
	pendingUploadNameM = "";
	const suit = name ? getSuit(name) : null;
	openModal(suitEditorHtml(suit));

	document.querySelectorAll('input[name="seType"], input[name="seCount"]').forEach(function (el) {
		el.addEventListener("change", refreshPriceGrid);
	});
	$("seDefaultPrices").addEventListener("change", refreshPriceGrid);
	$("seImageFileF").addEventListener("change", function (e) { onImageFile(e, "F"); });
	$("seImageFileM").addEventListener("change", function (e) { onImageFile(e, "M"); });
	$("btnSeSave").addEventListener("click", saveSuitEditor);
	$("btnCancelModal").addEventListener("click", closeModal);
	if ($("btnSeDelete")) $("btnSeDelete").addEventListener("click", deleteCustomSuit);
	if ($("btnSeDownloadF")) $("btnSeDownloadF").addEventListener("click", function () { downloadSuitImage("female"); });
	if ($("btnSeDownloadM")) $("btnSeDownloadM").addEventListener("click", function () { downloadSuitImage("male"); });

	refreshPriceGrid();
	/* 预览当前男女装图片 */
	if (suit) {
		["female", "male"].forEach(function (g) {
			const src = getSuitImage(suit, g);
			if (src) {
				const pv = $(g === "male" ? "sePreviewM" : "sePreviewF");
				pv.src = src;
				pv.style.display = "block";
			}
		});
	}
}

function saveSuitEditor() {
	const name = $("seName").value.trim();
	if (!name) { alert(t("msg.suitNameEmpty")); return; }
	const type = document.querySelector('input[name="seType"]:checked').value;
	const partCount = parseInt(document.querySelector('input[name="seCount"]:checked').value, 10);
	const useDefault = $("seDefaultPrices").checked;
	const scheme = PRICE_SCHEMES[schemeKeyOf(type, partCount)];
	let prices = null;
	if (useDefault) prices = scheme.prices.slice();
	else {
		prices = [];
		$("sePriceGrid").querySelectorAll("input[data-i]").forEach(function (inp) {
			prices[parseInt(inp.dataset.i, 10)] = Math.max(0, parseInt(inp.value, 10) || 0);
		});
	}
	const pathF = $("seImagePathF").value.trim();
	const pathM = $("seImagePathM").value.trim();

	const editingName = currentEditName;
	if (editingName && editingName !== name && getSuit(name)) {
		alert(t("msg.suitNameExists", { name: name }));
		return;
	}

	/* 保存男女装图片（浏览器内上传 → IndexedDB；路径 → 套装字段） */
	function saveImages(suitObj) {
		if (pathF) suitObj.femaleImage = pathF; else delete suitObj.femaleImage;
		if (pathM) suitObj.maleImage = pathM; else delete suitObj.maleImage;
		if (pendingUploadF) {
			idbImages[idbKey(name, "female")] = pendingUploadF;
			IDB.set(idbKey(name, "female"), pendingUploadF).catch(function (e) { console.error(e); });
		}
		if (pendingUploadM) {
			idbImages[idbKey(name, "male")] = pendingUploadM;
			IDB.set(idbKey(name, "male"), pendingUploadM).catch(function (e) { console.error(e); });
		}
	}

	/* ---- 新建 ---- */
	if (!editingName) {
		if (getSuit(name)) { alert(t("msg.suitNameExists", { name: name })); return; }
		const entry = { name: name, type: type, partCount: partCount };
		if (prices) entry.prices = prices;
		saveImages(entry);
		customSuits.push(entry);
		saveCustomSuits();
		/* 归属主题 */
		const themeSel = $("seTheme");
		if (themeSel && themeSel.value) addSuitToTheme(name, parseInt(themeSel.value, 10));
		closeModal();
		render();
		alert(t("msg.suitSaved", { name: name }));
		return;
	}

	/* ---- 编辑已有 ---- */
	const isCustom = customSuits.some(function (s) { return s.name === editingName; });
	/* 主题变更：先从旧主题移除，再加入新主题（改名时用新名） */
	const oldTh = suitTheme(editingName);
	const themeSel2 = $("seTheme");
	const newThSeq = themeSel2 && themeSel2.value ? parseInt(themeSel2.value, 10) : null;
	if (oldTh && (!newThSeq || oldTh.theme.seq !== newThSeq)) {
		removeSuitFromTheme(editingName, oldTh.theme.seq);
	}
	if (editingName !== name) migrateSuitName(editingName, name);
	if (newThSeq) addSuitToTheme(name, newThSeq);

	if (isCustom) {
		const entry = customSuits.find(function (s) { return s.name === name; });
		entry.type = type;
		entry.partCount = partCount;
		if (prices) entry.prices = prices; else delete entry.prices;
		saveImages(entry);
		saveCustomSuits();
	} else {
		/* 内置套装：记录到 suitOverrides（以原内置名为 key，支持已改过名的情况） */
		let key = null;
		const k1 = BUILTIN_SUITS.find(function (x) { return x.name === editingName; });
		if (k1) key = k1.name;
		else {
			/* 可能已改过名：在覆盖表里找 name === editingName 的项 */
			key = Object.keys(suitOverrides).find(function (k) {
				return suitOverrides[k] && suitOverrides[k].name === editingName;
			}) || editingName;
		}
		const ov = suitOverrides[key] || {};
		ov.name = name;
		ov.type = type;
		ov.partCount = partCount;
		if (prices) ov.prices = prices; else delete ov.prices;
		saveImages(ov);
		suitOverrides[key] = ov;
		saveSuitOverrides();
	}
	closeModal();
	render();
	alert(t("msg.suitSaved", { name: name }));
}

function deleteCustomSuit() {
	const name = currentEditName;
	if (!name) return;
	if (!confirm(t("msg.confirmDeleteSuit", { name: name }))) return;
	const th = suitTheme(name);
	if (th) removeSuitFromTheme(name, th.theme.seq);
	customSuits = customSuits.filter(function (s) { return s.name !== name; });
	saveCustomSuits();
	delete state[name];
	if (favorites.has(name)) favorites.delete(name);
	["", "::male"].forEach(function (suf) {
		IDB.del(name + suf).catch(function (e) { console.error(e); });
		delete idbImages[name + suf];
	});
	saveState();
	saveFavorites();
	closeModal();
	render();
	alert(t("msg.suitDeleted", { name: name }));
}

function downloadSuitImage(gender) {
	const name = currentEditName;
	const src = name && idbImages[idbKey(name, gender)];
	if (!src) {
		alert(gender === "male" ? "当前套装没有浏览器内上传的男装图。" : "当前套装没有浏览器内上传的女装图。");
		return;
	}
	downloadFile((name || "suit") + (gender === "male" ? "男装" : "女装") + ".png", src, "image/png");
}

/* ---------------- 导出 data.js 代码片段（让自定义套装永久内置） ---------------- */
function exportDataJs() {
	const list = customSuits.map(function (s) {
		const o = { name: s.name, type: s.type, partCount: s.partCount };
		if (s.prices && s.prices.length) o.prices = s.prices;
		if (s.image) o.image = s.image;
		if (s.femaleImage) o.femaleImage = s.femaleImage;
		if (s.maleImage) o.maleImage = s.maleImage;
		return JSON.stringify(o);
	});
	const snippet = "/* 自定义套装（来自网页管理面板导出）\n"
		+ " * 把这段粘贴到 js/data.js 的末尾（EXTRA_SUITS 会自动合并进页面）。\n"
		+ " * 若套装图片只存在浏览器里，请先点「下载女装图/男装图」放入 images/ 文件夹，\n"
		+ " * 并给该套装加上 femaleImage/maleImage: \"images/文件名.png\"。\n"
		+ " */\n"
		+ "const EXTRA_SUITS = [\n" + list.join(",\n") + "\n];\n";
	downloadFile("data-extra-suites.js", snippet, "text/javascript");
	alert(t("msg.exportDataJs"));
}

/* ---------------- 页面文字编辑器 ---------------- */
function openTextEditor() {
	const rows = Object.keys(TEXT).map(function (k) {
		const cur = textOverrides[k] !== undefined ? textOverrides[k] : TEXT[k];
		const isLong = String(cur).length > 60;
		return '<tr><td><code>' + esc(k) + '</code></td><td>'
			+ (isLong
				? '<textarea data-key="' + esc(k) + '">' + esc(cur) + '</textarea>'
				: '<input data-key="' + esc(k) + '" value="' + esc(cur) + '">')
			+ '</td></tr>';
	}).join("");
	openModal('<h3>' + esc(t("edit.textEditor")) + '</h3>'
		+ '<p style="font-size:12px;color:#888">' + esc(t("edit.textHint")) + '</p>'
		+ '<table class="text-editor-table"><tr><th style="width:190px">key</th><th>' + esc(t("edit.textEditor")) + '</th></tr>'
		+ rows + '</table>'
		+ '<div class="actions"><button class="btn-save" id="btnSaveTexts">' + esc(t("edit.saveText")) + '</button>'
		+ '<button class="btn-cancel" id="btnCancelModal">' + esc(t("admin.cancel")) + '</button></div>');
	$("btnSaveTexts").addEventListener("click", function () {
		document.querySelectorAll("[data-key]").forEach(function (inp) {
			textOverrides[inp.dataset.key] = inp.value;
		});
		saveTextOverrides();
		closeModal();
		render();
		alert(t("msg.textSaved"));
	});
	$("btnCancelModal").addEventListener("click", closeModal);
}

/* ---------------- 价格体系编辑器 ---------------- */
function openPricesEditor() {
	const rows = Object.keys(PRICE_SCHEMES).map(function (key) {
		const s = PRICE_SCHEMES[key];
		const cells = s.prices.map(function (p, i) {
			return '<input data-scheme="' + key + '" data-i="' + i + '" type="number" min="0" value="' + p + '" title="' + esc(s.partNames[i]) + '">';
		}).join("");
		return '<div class="price-editor-row"><span class="scheme-name">' + esc(key) + '</span><span style="font-size:11px;color:#888">' + esc(s.partNames.join(" / ")) + '</span>' + cells + '</div>';
	}).join("");
	openModal('<h3>' + esc(t("edit.pricesEditor")) + '</h3>'
		+ '<p style="font-size:12px;color:#888">' + esc(t("edit.pricesHint")) + '</p>'
		+ rows
		+ '<div class="actions"><button class="btn-save" id="btnSavePrices">' + esc(t("edit.savePrices")) + '</button>'
		+ '<button class="btn-cancel" id="btnCancelModal">' + esc(t("admin.cancel")) + '</button></div>');
	$("btnSavePrices").addEventListener("click", function () {
		const overrides = {};
		document.querySelectorAll("[data-scheme]").forEach(function (inp) {
			const sk = inp.dataset.scheme;
			const i = parseInt(inp.dataset.i, 10);
			const v = Math.max(0, parseInt(inp.value, 10) || 0);
			if (!overrides[sk]) overrides[sk] = { prices: [] };
			overrides[sk].prices[i] = v;
		});
		Object.keys(overrides).forEach(function (sk) {
			if (PRICE_SCHEMES[sk]) PRICE_SCHEMES[sk].prices = overrides[sk].prices;
		});
		schemeOverrides = overrides;
		saveSchemeOverrides();
		closeModal();
		render();
		alert(t("msg.pricesSaved"));
	});
	$("btnCancelModal").addEventListener("click", closeModal);
}

/* ---------------- 重置 ---------------- */
function resetTextOverrides() {
	if (!confirm("确定重置所有页面文字修改？")) return;
	textOverrides = {};
	saveTextOverrides();
	render();
	alert(t("msg.overridesReset"));
}
function resetSuitOverrides() {
	if (!confirm("确定重置所有内置套装的修改（类型/配件数/价格/图片）？")) return;
	suitOverrides = {};
	saveSuitOverrides();
	render();
	alert(t("msg.overridesReset"));
}
function resetCustomSuits() {
	if (!confirm("确定移除全部自定义套装？\n\n其浏览器内保存的男女装图片、自定义主题也会删除。")) return;
	const names = customSuits.map(function (s) { return s.name; });
	names.forEach(function (n) {
		const th = suitTheme(n);
		if (th) removeSuitFromTheme(n, th.theme.seq);
		delete state[n];
		if (favorites.has(n)) favorites.delete(n);
		["", "::male"].forEach(function (suf) {
			IDB.del(n + suf).catch(function () {});
			delete idbImages[n + suf];
		});
	});
	customSuits = [];
	customThemes = [];
	saveCustomSuits();
	saveCustomThemes();
	saveState();
	saveFavorites();
	render();
	alert(t("msg.overridesReset"));
}

/* ---------------- 编辑模式开关 ---------------- */
function toggleEditMode() {
	editMode = !editMode;
	updateEditModeUI();
	render();
}

/* ---------------- 事件绑定 ---------------- */
function bindAdminEvents() {
	$("btnAddSuit").addEventListener("click", function () { openSuitEditor(null); });
	$("btnAddSuit2").addEventListener("click", function () { openSuitEditor(null); });
	$("btnAddTheme").addEventListener("click", openThemeEditor);
	$("btnAddTheme2").addEventListener("click", openThemeEditor);
	$("btnExportBasic").addEventListener("click", exportBasicData);
	$("btnEditMode").addEventListener("click", toggleEditMode);
	$("btnTextEditor").addEventListener("click", openTextEditor);
	$("btnPricesEditor").addEventListener("click", openPricesEditor);
	$("btnResetText").addEventListener("click", resetTextOverrides);
	$("btnResetSuits").addEventListener("click", resetSuitOverrides);
	$("btnResetCustom").addEventListener("click", resetCustomSuits);
	$("modalMask").addEventListener("click", function (e) {
		if (e.target === $("modalMask")) closeModal();
	});
}

/* ---------------- 添加新主题（一个主题 = 3 或 4 套时装，品质一致） ---------------- */
let themeUploads = {};   // { i: {F: dataURL|null, M: dataURL|null} }

function openThemeEditor() {
	themeUploads = {};
	const typeRadio = '<label><input type="radio" name="seTType" value="gold" checked> ' + esc(t("admin.typeGold", { n: sum(PRICE_SCHEMES.gold6.prices) })) + '</label>'
		+ '<label><input type="radio" name="seTType" value="purple"> ' + esc(t("admin.typePurple", { n: sum(PRICE_SCHEMES.purple6.prices) })) + '</label>';
	const countRadio = '<label><input type="radio" name="seTCount" value="3" checked> ' + esc(t("themeForm.count3")) + '</label>'
		+ '<label><input type="radio" name="seTCount" value="4"> ' + esc(t("themeForm.count4")) + '</label>';
	openModal('<h3>' + esc(t("themeForm.title")) + '</h3>'
		+ '<div class="field"><label>' + esc(t("themeForm.name")) + '</label><input type="text" id="seTName"></div>'
		+ '<div class="field"><label>' + esc(t("themeForm.quality")) + '</label><div class="radio-row">' + typeRadio + '</div></div>'
		+ '<div class="field"><label>' + esc(t("themeForm.count")) + '</label><div class="radio-row">' + countRadio + '</div></div>'
		+ '<div class="field"><label>' + esc(t("themeForm.entryTime")) + '</label><input type="date" id="seTTime"></div>'
		+ '<div id="seTSuits"></div>'
		+ '<div style="font-size:12px;color:#888">' + esc(t("themeForm.autoPoolTip")) + '</div>'
		+ '<div class="actions"><button class="btn-save" id="btnTSSave">' + esc(t("admin.save")) + '</button>'
		+ '<button class="btn-cancel" id="btnCancelModal">' + esc(t("admin.cancel")) + '</button></div>');
	renderThemeSuitBlocks();
	document.querySelectorAll('input[name="seTCount"]').forEach(function (el) {
		el.addEventListener("change", renderThemeSuitBlocks);
	});
	$("btnTSSave").addEventListener("click", saveThemeEditor);
	$("btnCancelModal").addEventListener("click", closeModal);
}

function renderThemeSuitBlocks() {
	const count = parseInt(document.querySelector('input[name="seTCount"]:checked').value, 10);
	const wrap = $("seTSuits");
	wrap.innerHTML = "";
	for (let i = 0; i < count; i++) {
		const div = document.createElement("div");
		div.className = "field";
		div.style.cssText = "border-top:1px dashed #ddd;padding-top:10px";
		div.innerHTML = '<label>' + esc(t("themeForm.suitNo", { n: i + 1 })) + '</label>'
			+ '<input type="text" id="seTSName' + i + '" placeholder="套装名称">'
			+ '<div class="radio-row" style="margin:6px 0">'
			+ '<label><input type="radio" name="seTPC' + i + '" value="6" checked> ' + esc(t("admin.partCount6")) + '</label>'
			+ '<label><input type="radio" name="seTPC' + i + '" value="7"> ' + esc(t("admin.partCount7")) + '</label></div>'
			+ '<input type="file" id="seTSFileF' + i + '" accept="image/*">'
			+ '<input type="text" id="seTSPathF' + i + '" placeholder="' + esc(t("admin.imagePath")) + '（女装）" style="margin-top:4px">'
			+ '<input type="file" id="seTSFileM' + i + '" accept="image/*" style="margin-top:4px">'
			+ '<input type="text" id="seTSPathM' + i + '" placeholder="' + esc(t("admin.imagePath")) + '（男装）" style="margin-top:4px">';
		wrap.appendChild(div);
		$("seTSFileF" + i).addEventListener("change", function (e) { onThemeImage(e, i, "F"); });
		$("seTSFileM" + i).addEventListener("change", function (e) { onThemeImage(e, i, "M"); });
	}
}

function onThemeImage(e, i, which) {
	const file = e.target.files && e.target.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = function (ev) {
		if (!themeUploads[i]) themeUploads[i] = {};
		themeUploads[i][which] = ev.target.result;
	};
	reader.readAsDataURL(file);
}

function saveThemeEditor() {
	const name = $("seTName").value.trim();
	if (!name) { alert(t("msg.themeNameEmpty")); return; }
	const type = document.querySelector('input[name="seTType"]:checked').value;
	const count = parseInt(document.querySelector('input[name="seTCount"]:checked').value, 10);
	const entryTime = $("seTTime").value || null;

	const suitNames = [];
	const entries = [];
	for (let i = 0; i < count; i++) {
		const sn = $("seTSName" + i).value.trim();
		if (!sn) { alert(t("msg.themeSuitNameEmpty", { n: i + 1 })); return; }
		if (getSuit(sn) || suitNames.indexOf(sn) >= 0) { alert(t("msg.themeSuitExists", { n: i + 1, name: sn })); return; }
		const pc = parseInt(document.querySelector('input[name="seTPC' + i + '"]:checked').value, 10);
		const pathF = $("seTSPathF" + i).value.trim();
		const pathM = $("seTSPathM" + i).value.trim();
		const up = themeUploads[i] || {};
		const entry = { name: sn, type: type, partCount: pc, prices: PRICE_SCHEMES[schemeKeyOf(type, pc)].prices.slice() };
		if (pathF) entry.femaleImage = pathF;
		if (pathM) entry.maleImage = pathM;
		if (up.F) { idbImages[idbKey(sn, "female")] = up.F; IDB.set(idbKey(sn, "female"), up.F).catch(function (e) { console.error(e); }); }
		if (up.M) { idbImages[idbKey(sn, "male")] = up.M; IDB.set(idbKey(sn, "male"), up.M).catch(function (e) { console.error(e); }); }
		entries.push(entry);
		suitNames.push(sn);
	}

	/* 保存时装 */
	entries.forEach(function (en) { customSuits.push(en); });
	saveCustomSuits();

	/* 保存主题（自动标记主题序号，不显示） */
	const seq = nextThemeSeq();
	customThemes.push({ seq: seq, name: name, entryTime: entryTime, pooled: false, suits: suitNames, custom: true });
	saveCustomThemes();

	/* 自动入池：未入池主题超过 4 个时，最旧的一个自动入池 */
	const upThemes = unpooledThemes();
	if (upThemes.length > 4) {
		const oldest = upThemes[0];
		themeOverrides[String(oldest.seq)] = Object.assign({}, themeOverrides[String(oldest.seq)], { pooled: true });
		saveThemeOverrides();
	}

	closeModal();
	render();
	alert(t("msg.themeSaved", { name: name, seq: seq, count: count })
		+ "\n\n" + t("msg.themeNeedImages"));
}
