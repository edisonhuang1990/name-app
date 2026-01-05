// 天干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行映射
const ELEMENT_MAP = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

function getYearGanZhi(year) {
    const idx = (year - 4) % 60;
    const stemIdx = idx % 10;
    const branchIdx = idx % 12;
    return HEAVENLY_STEMS[stemIdx] + EARTHLY_BRANCHES[branchIdx];
}

// 简单的月干支计算 (基于节气近似，这里简化处理，以立春为界或直接按农历月近似)
// 真实八字需要精确节气，这里使用简化算法：
// 年上起月法：甲己之年丙作首...
function getMonthGanZhi(year, month, yearStemIndex) {
    // month is 1-12
    // 假设2月4日立春，此前为上一年。这里简化，直接按公历月调整
    // 实际上八字月是按节气走的，1月小寒-大寒，2月立春-雨水...
    // 这里简单映射：2月立春后为寅月(1月)，3月卯月...
    
    // 修正月份，使2月对应寅(index 2)
    let branchIdx = (month + 12) % 12; 
    if (branchIdx === 0) branchIdx = 1; // fix edge case if needed, actually:
    // 2月->寅(2), 3月->卯(3)... 1月->丑(1)
    // standard: Yin is 1st month in Bazi (usually Feb)
    
    // 简化：直接取 (month + 2 - 1) % 12 作为地支索引 (2月->2寅, 1月->1丑)
    // 实际上1月往往还在丑月(上一年腊月)或子月，这里为了演示效果做简化
    // 更好的简化：2月=寅，3月=卯... 1月=丑
    const bIdx = month === 1 ? 1 : (month === 12 ? 0 : month); 
    // Wait, standard mapping:
    // Zi(0): 11月 (Nov), Chou(1): 12月 (Dec), Yin(2): 1月 (Jan/Feb - Start of Spring)
    // Let's stick to a simpler mapping for the demo: 
    // Month 1 (Jan) -> Chou (1)
    // Month 2 (Feb) -> Yin (2)
    // ...
    // Month 11 (Nov) -> Zi (0)
    // Month 12 (Dec) -> Chou (1) -- wait conflict.
    
    // Let's use the standard "Year Stem -> Month Stem" table (Wu Hu Dun)
    // 甲己之年丙作首 -> 甲/己年，正月(寅月)是丙寅
    // 乙庚之年戊为头 -> 乙/庚年，正月是戊寅
    // 丙辛之岁寻庚上 -> 丙/辛年，正月是庚寅
    // 丁壬壬寅顺水流 -> 丁/壬年，正月是壬寅
    // 戊癸之年甲寅好 -> 戊/癸年，正月是甲寅
    
    // Calculate Year Stem Index (0-9)
    const yStemIdx = (year - 4) % 10;
    let startStemIdx = 0;
    if (yStemIdx === 0 || yStemIdx === 5) startStemIdx = 2; // Jia/Ji -> Bing (2)
    else if (yStemIdx === 1 || yStemIdx === 6) startStemIdx = 4; // Yi/Geng -> Wu (4)
    else if (yStemIdx === 2 || yStemIdx === 7) startStemIdx = 6; // Bing/Xin -> Geng (6)
    else if (yStemIdx === 3 || yStemIdx === 8) startStemIdx = 8; // Ding/Ren -> Ren (8)
    else if (yStemIdx === 4 || yStemIdx === 9) startStemIdx = 0; // Wu/Gui -> Jia (0)
    
    // Month Branch: Feb is roughly Yin (2). 
    // We will assume input month is roughly aligned.
    // If month < 2 (Jan), treat as prev year's last month (Chou 1) for branch, but this complicates year.
    // For this simplified app, let's map Gregorian Month directly to Branch index roughly.
    // Feb -> Yin (2), Mar -> Mao (3)... Jan -> Chou (1)
    
    let mBranchIdx = month; 
    if (month === 1) mBranchIdx = 1; // Chou
    else mBranchIdx = month; // 2->2, 3->3... 12->12(Chou? No 12 is 0 Zi?)
    // Real mapping:
    // Feb (approx) -> Yin (2)
    // ...
    // Jan (approx) -> Chou (1)
    
    // Let's align offset.
    // Month 1 (Jan) -> usually Chou (1)
    // Month 2 (Feb) -> usually Yin (2)
    // ...
    // Month 11 (Nov) -> Zi (0)
    // Month 12 (Dec) -> Chou (1) - Wait, 12 Earthly Branches.
    // 11: Zi(0), 12: Chou(1), 1: Yin(2)... NO.
    // Standard: 
    // Month 1 (Tiger/Yin) starts around Feb 4.
    // So if Month >= 2, mIndex = month - 2. 
    // If Month = 1, mIndex = 11 (Chou of prev year? or just Chou).
    
    // SIMPLIFICATION:
    // We treat Feb as Month 1 of the lunar year for index calculation.
    let lunarMonthIdx = month - 2;
    if (lunarMonthIdx < 0) lunarMonthIdx += 12; // Jan -> 11 (Chou), Feb -> 0 (Yin)...
    // Wait, let's just use standard mapping:
    // Feb -> Yin (2)
    // Jan -> Chou (1)
    // Dec -> Zi (0)
    // ...
    
    const branches = [
        '子', '丑', '寅', '卯', '辰', '巳', 
        '午', '未', '申', '酉', '戌', '亥'
    ];
    // Map Gregorian to Branch Index (0=Zi, 1=Chou...)
    // Dec -> 0 (Zi)
    // Jan -> 1 (Chou)
    // Feb -> 2 (Yin)
    // ...
    let branchVal = month === 12 ? 0 : month;
    
    // Calculate Stem
    // We need "Month Index" starting from Yin=0 for the formula
    // Feb(Yin) is 0th month for stem calc
    let stemOffset = month - 2;
    if (stemOffset < 0) stemOffset += 12;
    
    let mStemIdx = (startStemIdx + stemOffset) % 10;
    
    return HEAVENLY_STEMS[mStemIdx] + branches[branchVal];
}

function calculateBazi(year, month, day, hour) {
    // 简化版八字计算
    const yearGZ = getYearGanZhi(year);
    const yearStemIdx = (year - 4) % 10;
    const monthGZ = getMonthGanZhi(year, month, yearStemIdx);
    
    // 日柱：高难度，需要儒略日。这里使用简化算法或随机模拟（演示用）
    // 真实应用需要查表。为了演示效果，这里我们基于日期做一个伪随机映射
    // 保证同一天输入得到相同结果
    const baseDate = new Date(1900, 0, 31); // 甲午日
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    
    const dayIdx = diffDays % 60;
    const dayStemIdx = dayIdx % 10;
    const dayBranchIdx = dayIdx % 12;
    
    // Handle negative modulus for dates before 1900 (unlikely but safe)
    const safeDayStemIdx = dayStemIdx < 0 ? dayStemIdx + 10 : dayStemIdx;
    const safeDayBranchIdx = dayBranchIdx < 0 ? dayBranchIdx + 12 : dayBranchIdx;
    
    const dayGZ = HEAVENLY_STEMS[safeDayStemIdx] + EARTHLY_BRANCHES[safeDayBranchIdx];
    
    // 时柱：五鼠遁
    // 甲己还加甲...
    // Input hour is 0-23
    // Branch: 23-1 -> Zi, 1-3 -> Chou...
    let hourBranchIdx = Math.floor((hour + 1) / 2) % 12;
    
    let hStartStem = 0;
    if (safeDayStemIdx === 0 || safeDayStemIdx === 5) hStartStem = 0; // Jia/Ji -> Jia
    else if (safeDayStemIdx === 1 || safeDayStemIdx === 6) hStartStem = 2; // Yi/Geng -> Bing
    else if (safeDayStemIdx === 2 || safeDayStemIdx === 7) hStartStem = 4; // Bing/Xin -> Wu
    else if (safeDayStemIdx === 3 || safeDayStemIdx === 8) hStartStem = 6; // Ding/Ren -> Geng
    else if (safeDayStemIdx === 4 || safeDayStemIdx === 9) hStartStem = 8; // Wu/Gui -> Ren
    
    const hourStemIdx = (hStartStem + hourBranchIdx) % 10;
    const hourGZ = HEAVENLY_STEMS[hourStemIdx] + EARTHLY_BRANCHES[hourBranchIdx];
    
    return {
        year: yearGZ,
        month: monthGZ,
        day: dayGZ,
        hour: hourGZ
    };
}

function analyzeElements(bazi) {
    const allChars = [
        bazi.year[0], bazi.year[1],
        bazi.month[0], bazi.month[1],
        bazi.day[0], bazi.day[1],
        bazi.hour[0], bazi.hour[1]
    ];
    
    const counts = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    
    allChars.forEach(c => {
        const el = ELEMENT_MAP[c];
        if (el) counts[el]++;
    });
    
    // 简单的喜用神判断：找最少的五行（简化逻辑）
    // 真实逻辑需要判断日主强弱、格局等。
    // 这里我们假设"缺什么补什么"
    let minCount = 8;
    let missing = [];
    
    for (let el in counts) {
        if (counts[el] < minCount) minCount = counts[el];
        if (counts[el] === 0) missing.push(el);
    }
    
    // 如果没有缺的，找最弱的
    let weakest = [];
    if (missing.length > 0) {
        weakest = missing;
    } else {
        for (let el in counts) {
            if (counts[el] === minCount) weakest.push(el);
        }
    }
    
    return { counts, weakest, missing };
}

function generateNames(lastName, gender, birthInfo) {
    const { year, month, day, hour } = birthInfo;
    const bazi = calculateBazi(year, month, day, hour);
    const analysis = analyzeElements(bazi);
    
    const targetElements = analysis.weakest;
    const primaryTarget = targetElements[0] || '金'; // default fallback
    
    // Filter chars
    const candidates = CHAR_DB.filter(c => targetElements.includes(c.element));
    // If not enough candidates, add from other elements to balance or just random good ones
    const backups = CHAR_DB.filter(c => !targetElements.includes(c.element));
    
    const results = [];
    
    // Generate 3 options
    for (let i = 0; i < 3; i++) {
        // Pick 1 or 2 chars
        const isTwoChar = Math.random() > 0.3; // 70% chance for 2 chars
        
        let name = '';
        let meaning = '';
        let elements = [];
        
        if (isTwoChar) {
            const c1 = candidates.length > 0 
                ? candidates[Math.floor(Math.random() * candidates.length)] 
                : backups[Math.floor(Math.random() * backups.length)];
            
            const c2 = candidates.length > 0 
                ? candidates[Math.floor(Math.random() * candidates.length)] 
                : backups[Math.floor(Math.random() * backups.length)];
                
            name = c1.char + c2.char;
            meaning = `${c1.char} (${c1.element}): ${c1.meaning}；${c2.char} (${c2.element}): ${c2.meaning}`;
            elements = [c1.element, c2.element];
        } else {
            const c1 = candidates.length > 0 
                ? candidates[Math.floor(Math.random() * candidates.length)] 
                : backups[Math.floor(Math.random() * backups.length)];
            name = c1.char;
            meaning = `${c1.char} (${c1.element}): ${c1.meaning}`;
            elements = [c1.element];
        }
        
        // Check for duplicates in results
        if (results.some(r => r.name === lastName + name)) {
            i--;
            continue;
        }

        // Random I Ching Hexagram
        const hexKeys = Object.keys(I_CHING_DATA);
        const randomHex = hexKeys[Math.floor(Math.random() * hexKeys.length)];
        const iching = I_CHING_DATA[randomHex];

        results.push({
            name: lastName + name,
            pinyin: '...', // Simplified
            bazi: `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`,
            analysis: `五行缺/弱: ${targetElements.join(',')}`,
            elements: elements.join('+'),
            meaning: meaning,
            iching: iching
        });
    }
    
    return results;
}
