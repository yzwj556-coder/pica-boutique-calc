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
  "site.subtitle": "勾选配件/整套时装 = 已拥有；毕业所需许愿星（当前缺口）、总时装数、总配件数、已拥有配件等会自动更新 · 数据自动保存在本地浏览器",
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
  "gender.help": "导入旧数据时会继续匹配原来的套装进度、收藏和许愿星；没有性别字段时使用当前选择的性别。",

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
    "4. 毕业所需许愿星（当前缺口）= 购买所有未拥有配件所需的许愿星；还需许愿星 = 缺口 − 已有库存。",
    "5. 勾选整套时装 = 一次性勾选该套装全部配件（同样按上述规则扣/返许愿星）。",
    "6. 如果许愿星库存录入错误，可以直接修改「已有许愿星库存」，然后点击「提交已有库存」进行修正。",
    "7. 清除全部数据时，已购配件消耗的许愿星会自动返还至库存。"
  ].join("<br>"),

  "summary.totalStars": "许愿星总数",
  "summary.needStars": "毕业所需许愿星（当前缺口）",
  "summary.totalSuits": "总时装数",
  "summary.totalParts": "总配件数",
  "summary.ownedParts": "已拥有配件",
  "summary.missingParts": "未拥有配件",
  "summary.ownedSuits": "已毕业套装",
  "summary.ownedValue": "已拥有许愿星价值",

  "filter.label": "筛选：",
  "filter.all": "全部",
  "filter.gold": "只显示金装",
  "filter.purple": "只显示紫装",
  "filter.fav": "只显示收藏",
  "sort.label": "排序：",
  "sort.default": "默认顺序",
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
  "admin.image": "套装图片",
  "admin.imageHint": "可上传图片文件（自动存入浏览器），或将图片放入仓库 images/ 文件夹后填写文件名",
  "admin.imageFile": "上传图片文件…",
  "admin.imagePath": "或填写图片文件名 / 网址",
  "admin.femaleImage": "女装图片（可选，留空使用默认）",
  "admin.maleImage": "男装图片（可选，留空使用默认）",
  "admin.save": "保存",
  "admin.cancel": "取消",
  "admin.delete": "删除该套装（仅自定义套装）",
  "admin.customList": "自定义套装（已添加到页面）",
  "admin.exportDataJs": "💾 导出 data.js 代码片段",
  "admin.downloadImage": "⬇ 下载图片文件（放入 images/ 文件夹）",
  "admin.fullPrice": "整套合计：{n} 许愿星",

  "edit.textEditor": "页面文字编辑",
  "edit.textHint": "修改后点击「保存文字」即时生效并保存在本地。",
  "edit.saveText": "保存文字",
  "edit.pricesEditor": "价格体系编辑",
  "edit.pricesHint": "修改默认价格后点击保存；未单独改过价格的套装会套用新价格。",
  "edit.savePrices": "保存价格",
  "edit.resetText": "重置文字修改",
  "edit.resetSuits": "重置套装修改",
  "edit.resetCustom": "移除全部自定义套装",
  "edit.modeHint": "编辑模式：点击页面任意文字可直接修改；套装卡片上有 ⚙ 编辑按钮；点击卡片上的 金装/紫装 徽标可切换类型。",
  "edit.suitCount6_7": "6件⇄7件",

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
  "msg.suitSaved": "套装「{name}」已保存。\n\n提示：若要让图片和套装长期保留在网站上（不依赖本浏览器），请点击「下载图片文件」放入仓库 images/ 文件夹，并把导出的 data.js 代码片段合并进 js/data.js。",
  "msg.suitDeleted": "已删除套装「{name}」。",
  "msg.confirmDeleteSuit": "确定删除套装「{name}」吗？\n\n其已拥有记录、收藏等数据会一并移除。",
  "msg.confirmSwitchType": "将「{name}」从 {from} 切换为 {to}？\n\n价格将自动套用对应的默认价格体系（已单独修改过价格的套装会保留原价格）。",
  "msg.textSaved": "文字修改已保存。",
  "msg.pricesSaved": "价格体系已保存。",
  "msg.exportDataJs": "已生成 data.js 代码片段并下载。\n\n请把文件内容合并进 js/data.js 的 BUILTIN_SUITS 部分，即可让新套装永久内置。",
  "msg.overridesReset": "已重置。"
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
 *    - 后 29 套：新加入的图片素材，默认按 紫装·6件 处理，
 *      可在网页「编辑模式」里一键改成 金装 / 7件。
 *    每套默认图片为 images/<套装名>.png，可加可选字段覆盖：
 *      prices: [..]      单独指定各配件价格
 *      image: "路径/url"  单独指定图片（男/女同图）
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
  // 新加入的 29 套：默认紫装·6件
  purpleNew: [
    "乌拉塔印象", "千棘盔印象", "卡瓦重印象", "古卷执政官印象", "古卷画魔像印象",
    "咕德帽帽印象", "圆号鱼印象", "小丑公爵印象", "巨鼓象印象", "幻影灵菇印象",
    "异色咕德帽帽印象", "怖哭菇印象", "捕尘长绒印象", "朔夜伊芙印象", "水灵印象",
    "流浪鼠印象", "海豹船长印象", "混乱鱿彩印象", "火神印象", "烟花伯爵印象",
    "画间沉铁兽印象", "画间法师手印象", "秩序鱿墨印象", "袭卡印象", "蹦床松鼠印象",
    "迷迷箱怪印象", "里拉鳐印象", "食尘短绒印象", "魔力猫印象"
  ]
};

function buildBuiltinSuits() {
  const list = [];
  BUILTIN_SUIT_NAMES.gold.forEach(function (n) {
    list.push({ name: n, type: "gold", partCount: 6 });
  });
  BUILTIN_SUIT_NAMES.purple6.forEach(function (n) {
    list.push({ name: n, type: "purple", partCount: 6 });
  });
  BUILTIN_SUIT_NAMES.purpleNew.forEach(function (n) {
    list.push({ name: n, type: "purple", partCount: 6 });
  });
  return list;
}

const BUILTIN_SUITS = buildBuiltinSuits();

/* 默认图片：images/<套装名>.png */
function defaultImagePath(name) {
  return "images/" + name + ".png";
}

/* 数据库版本号（用于备份/迁移） */
const DATA_VERSION = 3;
