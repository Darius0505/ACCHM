
/**
 * Convert number to Vietnamese words (for Currency)
 * Example: 100000 -> "Một trăm nghìn đồng chẵn"
 */

const digitNames = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroup(group: string, isLeadingGroup: boolean = false): string {
    const readDigit = [
        ' không', ' một', ' hai', ' ba', ' bốn', ' năm', ' sáu', ' bảy', ' tám', ' chín'
    ];
    let temp = '';

    if (group === '000' || group === '00' || group === '0' || group === '') return '';

    // For leading group (leftmost), process actual digits only
    // For middle/trailing groups, pad to 3 digits  
    const originalLength = group.length;
    const g = group.padStart(3, '0');
    const tram = parseInt(g.charAt(0));
    const chuc = parseInt(g.charAt(1));
    const donvi = parseInt(g.charAt(2));

    // For leading group with less than 3 digits, skip trăm/chục if they are 0
    if (isLeadingGroup && originalLength < 3) {
        // 1-digit group: just read the digit
        if (originalLength === 1) {
            return readDigit[donvi];
        }
        // 2-digit group: chục + đơn vị
        if (originalLength === 2) {
            if (chuc === 0 && donvi !== 0) {
                return ' linh' + readDigit[donvi];
            } else if (chuc === 1) {
                temp = ' mười';
            } else if (chuc > 1) {
                temp = readDigit[chuc] + ' mươi';
            }
            // Đơn vị
            if (donvi === 1 && chuc > 1) {
                temp += ' mốt';
            } else if (donvi === 5 && chuc > 0) {
                temp += ' lăm';
            } else if (donvi === 5 && chuc === 0) {
                temp += ' năm';
            } else if (donvi > 0 && donvi !== 1) {
                temp += readDigit[donvi];
            } else if (donvi === 1 && chuc <= 1) {
                temp += ' một';
            }
            return temp;
        }
    }

    // Full 3-digit handling (for middle groups or leading groups with 3 digits)
    // Hàng Trăm
    if (tram > 0) {
        temp += readDigit[tram] + ' trăm';
    } else if (!isLeadingGroup) {
        // Middle group with 0 hundreds needs "không trăm" 
        temp += ' không trăm';
    }

    // Hàng Chục
    if (chuc === 0 && donvi === 0) return temp;

    if (chuc === 0 && donvi !== 0) {
        temp += ' linh';
    } else if (chuc === 1) {
        temp += ' mười';
    } else if (chuc > 1) {
        temp += readDigit[chuc] + ' mươi';
    }

    // Hàng Đơn Vị
    if (donvi === 1) {
        if (chuc > 1) temp += ' mốt';
        else temp += ' một';
    } else if (donvi === 5) {
        if (chuc === 0) temp += ' năm';
        else temp += ' lăm';
    } else if (donvi !== 0) {
        temp += readDigit[donvi];
    }
    return temp;
}

export function numberToWordsVND(amount: number): string {
    if (amount === 0) return 'không đồng';
    if (!amount || isNaN(amount)) return '';

    let str = Math.abs(amount).toString();

    // Remove non-digits
    str = str.replace(/\D/g, '');

    let result = '';
    const groups = [];

    // Split into groups of 3
    while (str.length > 0) {
        groups.push(str.slice(Math.max(0, str.length - 3)));
        str = str.slice(0, Math.max(0, str.length - 3));
    }

    const groupNames = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const isLeadingGroup = i === groups.length - 1; // The leading (leftmost) group is at highest index
        const read = readGroup(group, isLeadingGroup);

        if (read !== '') {
            result = read + groupNames[i] + result;
        }
    }

    // Clean up
    result = result.trim();
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    return result + ' đồng chẵn';
}
