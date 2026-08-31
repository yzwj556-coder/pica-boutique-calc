/* ============================================================================
 * pica-boutique-calc — 数据文件（改数据/文字只需要动本文件，或网页内编辑模式）
 * 洛克王国 · 皮卡商店 时装（印象）许愿星计算器（非官方）
 *
 * 术语说明：
 *   印象  = 时装； 许愿星 = 购买时装的货币；
 *   金装  = 金色品质时装（整套 195 许愿星）；
 *   紫装  = 紫色品质时装（整套 98 许愿星，有 6 件 / 7 件两套价格体系）。
 * ========================================================================== */

/* ---------------------------------------------------------------------------
 * 1) 页面文字：所有会显示在页面上的文字都集中在这里。
 *    网页内「编辑模式」可以直接改这些文字（改动保存在浏览器 localStorage）。
 *    也可以用下面的 {x} 占位符（渲染时替换为数字等）。
 * ------------------------------------------------------------------------- */
const TEXT = {
  "site.title": "洛克王国 · 皮卡商店 时装许愿星计算器",
  "site.subtitle": "勾选配件 / 整套时装 / 整个主题 = 已拥有；毕业所需许愿星、当前缺口（已入池）、未入池许愿星总数等自动更新 · 数据自动保存在本地浏览器",
  "site.disclaimer": "非官方粉丝工具 · 与腾讯/魔方工作室无关 · 素材来源于游戏内截图 · 仅供玩家交流参考",

  "btn.clear": "清除数据",
  "btn.export": "导出数据",
  "btn.import": "导入数据",
  "btn.backfill": "📝 补录模式：{on}",          // {on} = 开/关
  "btn.addSuit": "➕ 添加套装",
  "btn.editMode": "✏️ 编辑模式：{on}",          // {on} = 开/关

  "gender.title": "性别",
  "gender.female": "女",
  "gender.male": "男",
  "gender.help": "切换性别时套装图片会对应切换：女装图在 images/<套装名>女装.png，男装图在 images/<套装名>男装.png。尚未提供男装图时自动使用女装图。导入旧数据时会继续匹配原来的套装进度、收藏和许愿星。",

  "backfill.banner": "📝 <strong>当前处于补录模式</strong> — 标记/取消配件不扣除也不返还许愿星，适合首次录入已购配件。<br>录入完成后，请在下方「预算规划」填写您<strong>当前实际的许愿星库存</strong>并提交，然后关闭补录模式，之后的标记将自动扣减库存。",

  "budget.title": "⭐ 许愿星预算规划",
  "budget.desc.initial": "首次使用时，请在「已有许愿星库存」中填写当前库存并提交。之后标记配件为已拥有时，许愿星会自动从库存中扣除；取消标记时自动返还；库存不足则禁止标记。每天新增许愿星后填写「今日获取量」并提交即可。",
  "budget.desc.filled": "已有许愿星库存已填写。之后每天打开网页，只需填写今日许愿星获取量并提交即可。",
  "budget.stockLabel": "已有许愿星库存",
  "budget.gainLabel": "今日许愿星获取量",
  "budget.submitStock": "📦 提交已有库存",
  "budget.submitGain": "📥 提交今日获取量",
  "budget.clearStock": "🧹 清除已有许愿星库存",
  "budget.clearHistory": "🗑️ 清空预算历史",
  "budget.stockDisplay": "已有许愿星库存",
  "budget.gainDisplay": "今日许愿星获取量",
  "budget.need": "还需许愿星（扣除库存）",
  "budget.daysNormal": "预计毕业天数（按今日获取量）",
  "budget.daysMax": "预计毕业天数（按每日上限 25）",
  "budget.history": "查看预算提交历史",
  "budget.tip": "查看使用说明",
  "budget.tipContent": [
    "1. 首次使用时，请在「已有许愿星库存」中填写你当前的许愿星数量，然后点击「提交已有库存」，之后才能标记配件。",
    "2. 标记配件为已拥有时，系统会自动从库存中扣除对应许愿星；取消标记时自动返还；库存不足则禁止标记。",
    "3. 每天新增许愿星时，填写「今日许愿星获取量」（如 15、20、25），点击「提交今日获取量」，会自动累加到库存。",
    "4. 毕业所需许愿星 = 购买所有未拥有配件（含未入池）所需的许愿星；当前缺口许愿星只算已入池的时装；还需许愿星 = 毕业所需 − 已有库存。",
    "5. 勾选整套时装 = 一次性勾选该套装全部配件；勾选整个主题 = 一次性勾选该主题全部时装（同样按上述规则扣/返许愿星）。",
    "6. 如果许愿星库存录入错误，可以直接修改「已有许愿星库存」，然后点击「提交已有库存」进行修正。",
    "7. 清除全部数据时，已购配件消耗的许愿星会自动返还至库存。"
  ].join("<br>"),

  "summary.totalStars": "许愿星总数",
  "summary.needStars": "毕业所需许愿星",
  "summary.gapStars": "当前缺口许愿星（已入池）",
  "summary.unpooledStars": "未入池许愿星总数",
  "summary.unpooledSuits": "未入池时装数",
  "summary.totalSuits": "总时装数",
  "summary.totalParts": "总配件数",
  "summary.ownedParts": "已拥有配件",
  "summary.missingParts": "未拥有配件",
  "summary.ownedSuits": "已毕业套装",
  "summary.ownedValue": "已拥有许愿星价值",

  "theme.unpooled": "未入池",
  "theme.pooled": "已入池",
  "theme.entryTime": "入池时间",
  "theme.entryTimeLabel": "预计 {date} 入池",
  "theme.entryTimeUnknown": "入池时间待定",
  "theme.whole": "勾选该主题全部时装",
  "theme.quality": "主题品质：{type}",

  "filter.label": "筛选：",
  "filter.all": "全部",
  "filter.gold": "只显示金装",
  "filter.purple": "只显示紫装",
  "filter.fav": "只显示收藏",
  "filter.themeHint": "套装按主题分组展示，默认按主题顺序排列",
  "sort.label": "排序：",
  "sort.default": "默认顺序（按主题）",
  "sort.missingAsc": "优先展示缺口小",
  "sort.missingDesc": "优先展示缺口大",
  "sort.progressAsc": "优先展示进度低",
  "sort.progressDesc": "优先展示进度高",
  "search.placeholder": "输入套装名称",

  "chart.overviewTitle": "整体卡池进度",
  "chart.overviewOwned": "已拥有配件",
  "chart.overviewMissing": "未拥有配件",
  "chart.favTitle": "收藏套装进度",
  "chart.favOwned": "已拥有价值",
  "chart.favMissing": "未拥有价值",
  "chart.favEmpty": "暂无收藏套装，点击套装右上角 ★ 即可收藏",

  "favSection.title": "★ 收藏置顶",
  "allSection.title": "全部套装",

  "card.whole": "整套",
  "card.typeGold": "金装",
  "card.typePurple": "紫装",
  "card.meta": "{type}套装 · 整套 {full} 许愿星",
  "card.ownedFmt": "已拥有 <strong>{owned}</strong>/{total}，集齐还需 <strong>{missing}</strong> 许愿星",
  "card.noImage": "暂无示意图",
  "card.edit": "⚙ 编辑",

  "star.float": "⭐ 许愿星库存",

  "admin.title": "添加 / 编辑套装",
  "admin.name": "套装名称",
  "admin.type": "品质类型",
  "admin.typeGold": "金装（整套 {n} 许愿星）",
  "admin.typePurple": "紫装（整套 {n} 许愿星）",
  "admin.partCount": "配件数（紫装可切换 6 件 / 7 件价格体系）",
  "admin.partCount6": "6 个配件",
  "admin.partCount7": "7 个配件",
  "admin.prices": "各配件价格（合计自动计算）",
  "admin.theme": "所属主题",
  "admin.themeNone": "（请选择主题）",
  "admin.imageFemale": "女装图片",
  "admin.imageMale": "男装图片",
  "admin.imageHint": "女装图和男装图分开上传/填写；上传的图片自动存入浏览器，放入仓库 images/ 文件夹的图片按 images/<套装名>女装.png、images/<套装名>男装.png 命名即可长期保留",
  "admin.imageFile": "上传图片文件…",
  "admin.imagePath": "或填写图片文件名 / 网址",
  "admin.save": "保存",
  "admin.cancel": "取消",
  "admin.delete": "删除该套装（仅自定义套装）",
  "admin.customList": "自定义套装（已添加到页面）",
  "admin.exportDataJs": "💾 导出 data.js 代码片段",
  "admin.downloadImageF": "⬇ 下载女装图（放入 images/ 文件夹）",
  "admin.downloadImageM": "⬇ 下载男装图（放入 images/ 文件夹）",
  "admin.fullPrice": "整套合计：{n} 许愿星",

  "themeForm.title": "➕ 添加新主题（一个主题 = 3 或 4 套时装）",
  "themeForm.name": "主题名称",
  "themeForm.quality": "主题品质（该主题所有时装品质一致）",
  "themeForm.count": "该主题含几套时装",
  "themeForm.count3": "3 套",
  "themeForm.count4": "4 套",
  "themeForm.entryTime": "入池时间（可留空，之后在编辑模式填写）",
  "themeForm.suitNo": "时装 {n}",
  "themeForm.autoPoolTip": "保存后自动标记主题序号；若未入池主题超过 4 个，最旧的一个会自动入池。",

  "account.title": "👤 账号管理",
  "account.help": "每个账号拥有独立的许愿星库存、已拥有配件、收藏与性别设置，互不影响；时装、图片、页面文字等配置所有账号共用。",
  "account.add": "➕ 新建账号",
  "account.rename": "✏️ 重命名",
  "account.delete": "🗑️ 删除账号",
  "account.newName": "请输入新账号名称：",
  "account.renameTo": "请输入新的账号名称：",
  "account.needName": "账号名称不能为空。",
  "account.confirmDelete": "确定删除账号「{name}」吗？\n\n该账号的许愿星库存、已拥有配件、收藏、性别等数据将被永久删除。",
  "account.deleted": "已删除账号「{name}」。",
  "account.onlyOne": "至少需要保留一个账号。",
  "account.default": "默认账号",

  "edit.textEditor": "页面文字编辑",
  "edit.textHint": "修改后点击「保存文字」即时生效并保存在本地。",
  "edit.saveText": "保存文字",
  "edit.pricesEditor": "价格体系编辑",
  "edit.pricesHint": "修改默认价格后点击保存；未单独改过价格的套装会套用新价格。",
  "edit.savePrices": "保存价格",
  "edit.resetText": "重置文字修改",
  "edit.resetSuits": "重置套装修改",
  "edit.resetCustom": "移除全部自定义套装",
  "edit.exportBasic": "💾 导出时装基本信息（供同步到 GitHub）",
  "edit.modeHint": "编辑模式：点击页面任意文字可直接修改；套装卡片上有 ⚙ 编辑按钮；点击卡片上的 金装/紫装 徽标可切换类型；每个主题行可设置「已入池」与「入池时间」。",
  "edit.suitCount6_7": "6件⇄7件",

  "tutorial.title": "📖 使用说明：查看未毕业套装已有的配件",
  "tutorial.summary": "点击查看教程（可折叠）",
  "tutorial.desc": "点击任意套装卡片上的配件标签（如「连衣 74」）即可标记已拥有；标签被划线表示已拥有。查看某套未毕业时装已拥有哪些配件：直接看该套装卡片上哪些配件标签被划线，或参考下方示意图：",

  "msg.confirmClearData": "确定要清除所有已拥有标记和收藏吗？\n\n通过「正常模式」购买的配件许愿星将返还至库存；通过「补录模式」记录的配件不影响库存。\n预算历史保留。",
  "msg.confirmClearStock": "确定要清除已有许愿星库存吗？\n\n此操作不会清空卡池数据、收藏数据和预算历史。",
  "msg.confirmClearHistory": "确定要清空预算历史记录吗？\n已有许愿星库存不会被清空。",
  "msg.insufficientStars": "许愿星不足！\n\n「{part}」需要 {cost} ⭐\n当前库存：{stock} ⭐\n\n请先补充许愿星库存，或开启「补录模式」直接记录。",
  "msg.needPositiveGain": "请输入大于 0 的今日许愿星获取量。",
  "msg.stockNoChange": "已有许愿星库存没有变化，无需提交。",
  "msg.stockUpdated": "已有许愿星库存已更新！\n\n原库存：{old}\n新库存：{new}",
  "msg.stockUpdatedTip": "\n\n💡 提示：库存已填写，建议现在关闭「补录模式」，之后的标记将自动扣减许愿星。",
  "msg.gainConfirm": "今天已经提交过今日获取量了。\n\n是否仍要重新提交？\n如果确定，本次获取量会再次累加到已有库存中。",
  "msg.gainSuccess": "提交成功！\n\n今日获取量：{gain}\n更新后库存：{stock}",
  "msg.importSuccess": "导入成功！",
  "msg.importFail": "导入失败：{err}",
  "msg.suitNameExists": "已存在同名套装：{name}",
  "msg.suitNameEmpty": "套装名称不能为空。",
  "msg.suitSaved": "套装「{name}」已保存。\n\n提示：若要让图片和套装长期保留在网站上（不依赖本浏览器），请点击「下载女装图/男装图」放入仓库 images/ 文件夹，并把导出的 data.js 代码片段合并进 js/data.js。",
  "msg.suitDeleted": "已删除套装「{name}」。",
  "msg.confirmDeleteSuit": "确定删除套装「{name}」吗？\n\n其已拥有记录、收藏等数据会一并移除。",
  "msg.confirmSwitchType": "将「{name}」从 {from} 切换为 {to}？\n\n价格将自动套用对应的默认价格体系（已单独修改过价格的套装会保留原价格）。",
  "msg.textSaved": "文字修改已保存。",
  "msg.pricesSaved": "价格体系已保存。",
  "msg.exportDataJs": "已生成 data.js 代码片段并下载。\n\n请把文件内容合并进 js/data.js 的 BUILTIN_SUITS 部分，即可让新套装永久内置。",
  "msg.exportBasic": "已导出「时装基本信息.json」（仅含时装/主题的基础信息，不含拥有情况和许愿星数据）。\n\n把它发给我，我即可据此同步更新 GitHub 网页的数据。",
  "msg.overridesReset": "已重置。",
  "msg.themeNameEmpty": "主题名称不能为空。",
  "msg.themeSuitNameEmpty": "第 {n} 套时装名称不能为空。",
  "msg.themeSuitExists": "第 {n} 套时装「{name}」与已有套装重名。",
  "msg.themeSaved": "主题「{name}」已保存（主题序号 {seq}，共 {count} 套时装）。\n\n最旧的未入池主题已自动入池（保持 4 个未入池）。",
  "msg.themeSavedNoPool": "主题「{name}」已保存（主题序号 {seq}，共 {count} 套时装）。\n\n当前未入池主题数量未超过 4 个，无需自动入池。",
  "msg.themeNeedImages": "建议为每套时装上传女装图和男装图（也可稍后在编辑模式补充）。"
};

/* ---------------------------------------------------------------------------
 * 2) 品质与价格体系
 *    金装：6 个配件，整套 195（连衣74 头饰41 背饰34 手饰17 袜子9 鞋子20）
 *    紫装：两套价格体系，整套均为 98
 *          - 6 件：连衣42 头饰20 背饰18 手饰6 袜子4 鞋子8
 *          - 7 件：上衣21 裤子21 头饰20 背饰18 手饰6 袜子4 鞋子8
 *    配件名与价格都可以在网页「编辑模式」中修改。
 * ------------------------------------------------------------------------- */
const QUALITY_META = {
  gold:   { label: "金装", cssClass: "gold" },
  purple: { label: "紫装", cssClass: "purple" }
};

const PRICE_SCHEMES = {
  gold6: {
    partNames: ["连衣", "头饰", "背饰", "手饰", "袜子", "鞋子"],
    prices: [74, 41, 34, 17, 9, 20],          // 合计 195
    full: 195
  },
  purple6: {
    partNames: ["连衣", "头饰", "背饰", "手饰", "袜子", "鞋子"],
    prices: [42, 20, 18, 6, 4, 8],            // 合计 98
    full: 98
  },
  purple7: {
    partNames: ["上衣", "裤子", "头饰", "背饰", "手饰", "袜子", "鞋子"],
    prices: [21, 21, 20, 18, 6, 4, 8],        // 合计 98
    full: 98
  }
};

/* 根据套装类型与配件数返回价格体系 key */
function schemeKeyOf(type, partCount) {
  if (type === "gold") return "gold6";
  return partCount === 7 ? "purple7" : "purple6";
}

/* ---------------------------------------------------------------------------
 * 3) 内置时装（印象）列表
 *    - 前 18 套：金装（原网站数据）
 *    - 中 12 套：紫装 6 件（原网站数据）
 *    - 后 28 套：新加入的图片素材，默认按 紫装·6件 处理，
 *      可在网页「编辑模式」里一键改成 金装 / 7件。
 *    每套默认图片按性别命名：images/<套装名>女装.png（女）/ images/<套装名>男装.png（男）。
 *    男装图尚未提供时自动回退用女装图。可选字段覆盖：
 *      prices: [..]      单独指定各配件价格
 *      image: "路径/url"  单独指定图片（男/女通用，优先级低于分性别图）
 *      femaleImage / maleImage: 分性别图片（可选）
 * ------------------------------------------------------------------------- */
const BUILTIN_SUIT_NAMES = {
  gold: [
    "音速犬印象", "岚鸟印象", "厉毒修萝印象", "星光狮印象", "烈火守护印象",
    "皇家狮鹫印象", "翠顶夫人印象", "卡洛儿印象", "花魁蜂后印象", "爵士鹿印象",
    "熔岩布丁印象", "蹦蹦花印象", "红绒十字印象", "白金独角兽印象", "花衣蝶印象",
    "嘟嘟锅印象", "九幽菇印象", "琉璃水母印象"
  ],
  purple6: [
    "獠牙猪印象", "圣代甜甜印象", "蒲公英娃娃印象", "梦悠悠印象",
    "电球咩咩印象", "雪影娃娃印象", "幽冥眼印象", "雪灵印象",
    "高脚鹬印象", "魔草巫灵印象", "魔眷鸟印象", "奇丽花印象"
  ],
  // 新加入的 28 套：默认紫装·6件
  purpleNew: [
    "乌拉塔印象", "千棘盔印象", "卡瓦重印象", "古卷执政官印象", "古卷匣魔像印象",
    "咕德帽帽印象", "圆号鱼印象", "小丑公爵印象", "巨鼓象印象", "幻影灵菇印象",
    "怖哭菇印象", "捕尘长绒印象", "朔夜伊芙印象", "水灵印象",
    "流浪鼠印象", "海豹船长印象", "混乱鱿彩印象", "火神印象", "烟花伯爵印象",
    "画间沉铁兽印象", "画间法师手印象", "秩序鱿墨印象", "裘卡印象", "蹦床松鼠印象",
    "迷迷箱怪印象", "里拉鳐印象", "食尘短绒印象", "魔力猫印象"
  ]
};

function buildBuiltinSuits() {
  const list = [];
  function add(n, type, partCount) {
    const ov = SUIT_DEFAULTS[n] || {};
    list.push({ name: n, type: ov.type || type, partCount: ov.partCount || partCount });
  }
  BUILTIN_SUIT_NAMES.gold.forEach(function (n) { add(n, "gold", 6); });
  BUILTIN_SUIT_NAMES.purple6.forEach(function (n) { add(n, "purple", 6); });
  BUILTIN_SUIT_NAMES.purpleNew.forEach(function (n) { add(n, "purple", 6); });
  return list;
}

/* 单套时装默认覆盖（与「时装基本信息.json」保持一致；type=品质，partCount=6/7件）
 * 未列出的套装使用所在分组的默认值（金装=6件 / 紫装=6件） */
const SUIT_DEFAULTS = {
  /* 紫装改为 7 件（上衣21 裤子21 头饰20 背饰18 手饰6 袜子4 鞋子8） */
  "高脚鹬印象": { partCount: 7 },
  "魔草巫灵印象": { partCount: 7 },
  "魔眷鸟印象": { partCount: 7 },
  "奇丽花印象": { partCount: 7 },
  "卡瓦重印象": { partCount: 7 },
  "古卷执政官印象": { partCount: 7 },
  "咕德帽帽印象": { partCount: 7 },
  "圆号鱼印象": { partCount: 7 },
  "小丑公爵印象": { partCount: 7 },
  "巨鼓象印象": { partCount: 7 },
  "混乱鱿彩印象": { partCount: 7 },
  "烟花伯爵印象": { partCount: 7 },
  "蹦床松鼠印象": { partCount: 7 },
  "里拉鳐印象": { partCount: 7 },
  "食尘短绒印象": { partCount: 7 },
  /* 紫装改为金装（连衣74 头饰41 背饰34 手饰17 袜子9 鞋子20） */
  "乌拉塔印象": { type: "gold" },
  "千棘盔印象": { type: "gold" },
  "幻影灵菇印象": { type: "gold" },
  "怖哭菇印象": { type: "gold" },
  "朔夜伊芙印象": { type: "gold" },
  "水灵印象": { type: "gold" },
  "流浪鼠印象": { type: "gold" },
  "海豹船长印象": { type: "gold" },
  "火神印象": { type: "gold" },
  "裘卡印象": { type: "gold" },
  "迷迷箱怪印象": { type: "gold" },
  "魔力猫印象": { type: "gold" }
};

const BUILTIN_SUITS = buildBuiltinSuits();

/* ---------------------------------------------------------------------------
 * 4) 主题（主题 = 一组 3~4 套时装；同一主题品质一致）
 *    数据来源：参考文本「时装和主题的对应关系及入池时间」
 *    - seq：主题序号（按顺序 1,2,3...，网页上不显示，仅用于排序/参考）
 *    - entryTime：入池时间（YYYY-MM-DD，尚未提供时为 null，可在编辑模式填写）
 *    - pooled：默认是否已入池；编辑模式可手动改；entryTime 到了也会自动入池；
 *      上传新主题时最旧的未入池主题会自动入池（一般保持 4 个未入池）
 *    入池状态最终以 themeOverrides（浏览器本地）为准，data.js 只是初始值。
 * ------------------------------------------------------------------------- */
const THEMES = [
	{ seq: 1,  name: "毛绒巡林者",           entryTime: null, pooled: true,  suits: ["音速犬印象", "厉毒修萝印象", "岚鸟印象"] },
	{ seq: 2,  name: "重逢圆舞曲",           entryTime: null, pooled: true,  suits: ["翠顶夫人印象", "花魁蜂后印象", "卡洛儿印象"] },
	{ seq: 3,  name: "雪山研究员",           entryTime: null, pooled: true,  suits: ["雪灵印象", "獠牙猪印象", "蒲公英娃娃印象", "圣代甜甜印象"] },
	{ seq: 4,  name: "誓约圣骑士",           entryTime: null, pooled: true,  suits: ["星光狮印象", "烈火守护印象", "皇家狮鹫印象"] },
	{ seq: 5,  name: "壁炉边伙伴",           entryTime: null, pooled: true,  suits: ["蹦蹦花印象", "熔岩布丁印象", "爵士鹿印象"] },
	{ seq: 6,  name: "治愈童话书",           entryTime: null, pooled: true,  suits: ["花衣蝶印象", "白金独角兽印象", "红绒十字印象"] },
	{ seq: 7,  name: "晚安睡衣派对",         entryTime: null, pooled: true,  suits: ["雪影娃娃印象", "梦悠悠印象", "电球咩咩印象", "幽冥眼印象"] },
	{ seq: 8,  name: "膨!炼金药剂",          entryTime: null, pooled: true,  suits: ["琉璃水母印象", "九幽菇印象", "嘟嘟锅印象"] },
	{ seq: 9,  name: "野外考察队",           entryTime: null, pooled: true,  suits: ["魔草巫灵印象", "奇丽花印象", "高脚鹬印象", "魔眷鸟印象"] },
	{ seq: 10, name: "深海的馈赠",           entryTime: null, pooled: true,  suits: ["海豹船长印象", "千棘盔印象", "迷迷箱怪印象"] },
	{ seq: 11, name: "魔法嘉年华",           entryTime: null, pooled: true,  suits: ["烟花伯爵印象", "巨鼓象印象", "咕德帽帽印象", "小丑公爵印象"] },
	{ seq: 12, name: "梦境流浪者",           entryTime: null, pooled: true,  suits: ["幻影灵菇印象", "怖哭菇印象", "流浪鼠印象"] },
	{ seq: 13, name: "乐团协奏曲",           entryTime: null, pooled: true,  suits: ["圆号鱼印象", "里拉鳐印象", "卡瓦重印象", "蹦床松鼠印象"] },
	{ seq: 14, name: "秘密潜入计划",         entryTime: "2026-09-10", pooled: false, suits: ["朔夜伊芙印象", "乌拉塔印象", "裘卡印象"] },
	{ seq: 15, name: "年轮诗社",             entryTime: "2026-09-25", pooled: false, suits: ["古卷执政官印象", "古卷匣魔像印象", "画间法师手印象", "画间沉铁兽印象"] },
	{ seq: 16, name: "初心的继承者",         entryTime: "2026-10-10", pooled: false, suits: ["水灵印象", "魔力猫印象", "火神印象"] },
	{ seq: 17, name: "怎么可以用魔法扫帚当画笔", entryTime: "2026-10-23", pooled: false, suits: ["食尘短绒印象", "捕尘长绒印象", "混乱鱿彩印象", "秩序鱿墨印象"] }
];

/* 默认图片：images/<套装名>女装.png（女）/ images/<套装名>男装.png（男）
 * 男装图片尚未提供时，网页会自动回退使用女装图。 */
function defaultImagePath(name, gender) {
  const g = gender === "male" ? "男装" : "女装";
  return "images/" + name + g + ".png";
}

/* 数据库版本号（用于备份/迁移） */
const DATA_VERSION = 6;
