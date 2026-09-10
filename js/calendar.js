var KirkianCalendar = (function() {
    'use strict';

    var EPOCH_GREG_YEAR = 2025;
    var EPOCH_GREG_MONTH = 9;
    var EPOCH_GREG_DAY = 10;

    var MONTH_NAMES = [
        'Kirkfall', 'Kirktember', 'Kirkvember', 'Kirkember',
        'July', 'Kirkian', 'Kirkward', 'Kirkday', 'Kirkstar', 'iQuarters'
    ];

    var MONTH_DAYS = [36, 36, 36, 36, 36, 36, 36, 36, 36, 41];

    var GREG_MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    var GREG_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    function gregorianOrdinal(year, month, day) {
        var days = 0;
        for (var yy = 1970; yy < year; yy++) {
            days += isLeapYear(yy) ? 366 : 365;
        }
        for (var mm = 1; mm < month; mm++) {
            days += GREG_MONTH_DAYS[mm - 1];
            if (mm === 2 && isLeapYear(year)) {
                days += 1;
            }
        }
        days += day - 1;
        return days;
    }

    var EPOCH_ORDINAL = gregorianOrdinal(EPOCH_GREG_YEAR, EPOCH_GREG_MONTH, EPOCH_GREG_DAY);

    function gregorianToTotalDays(year, month, day) {
        return gregorianOrdinal(year, month, day) - EPOCH_ORDINAL;
    }

    function totalDaysToGregorian(totalDays) {
        var ordinal = EPOCH_ORDINAL + totalDays;

        var year = 1970;
        while (ordinal >= (isLeapYear(year) ? 366 : 365)) {
            ordinal -= isLeapYear(year) ? 366 : 365;
            year++;
        }

        var month = 1;
        while (month <= 12) {
            var daysInMonth = GREG_MONTH_DAYS[month - 1];
            if (month === 2 && isLeapYear(year)) {
                daysInMonth = 29;
            }
            if (ordinal < daysInMonth) {
                break;
            }
            ordinal -= daysInMonth;
            month++;
        }

        return { year: year, month: month, day: ordinal + 1 };
    }

    function getKirkianSpanDays(kYear) {
        return isLeapYear(EPOCH_GREG_YEAR + kYear + 1) ? 366 : 365;
    }

    function getDaysInKirkianMonth(kYear, kMonth) {
        if (kMonth === 9 && getKirkianSpanDays(kYear) === 366) {
            return MONTH_DAYS[9] + 1;
        }
        return MONTH_DAYS[kMonth];
    }

    function gregorianToKirkian(year, month, day) {
        var totalDays = gregorianToTotalDays(year, month, day);

        var kYear = 0;
        var remaining = totalDays;
        while (remaining >= getKirkianSpanDays(kYear)) {
            remaining -= getKirkianSpanDays(kYear);
            kYear++;
        }

        var kMonth = 0;
        for (var m = 0; m < 10; m++) {
            if (remaining < getDaysInKirkianMonth(kYear, m)) {
                kMonth = m;
                break;
            }
            remaining -= getDaysInKirkianMonth(kYear, m);
        }

        return { year: kYear, month: kMonth, day: remaining + 1 };
    }

    function kirkianToGregorian(kYear, kMonth, kDay) {
        var totalDays = 0;

        for (var y = 0; y < kYear; y++) {
            totalDays += getKirkianSpanDays(y);
        }

        for (var m = 0; m < kMonth; m++) {
            totalDays += getDaysInKirkianMonth(kYear, m);
        }

        totalDays += kDay - 1;

        return totalDaysToGregorian(totalDays);
    }

    function getDayOfWeek(year, month, day) {
        var jan1 = new Date(year, 0, 1).getDay();
        var dayOfYear = 0;
        for (var m = 1; m < month; m++) {
            dayOfYear += GREG_MONTH_DAYS[m - 1];
            if (m === 2 && isLeapYear(year)) {
                dayOfYear += 1;
            }
        }
        dayOfYear += day;
        return (jan1 + dayOfYear - 1) % 7;
    }

    function getDayOfWeekName(year, month, day) {
        return DAY_NAMES[getDayOfWeek(year, month, day)];
    }

    function getDayOfWeekShort(year, month, day) {
        return DAY_NAMES_SHORT[getDayOfWeek(year, month, day)];
    }

    function getTodayGregorian() {
        var now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
    }

    function getTodayKirkian() {
        var g = getTodayGregorian();
        return gregorianToKirkian(g.year, g.month, g.day);
    }

    function getKirkianMonthStartGregorian(kYear, kMonth) {
        var totalDays = 0;
        for (var y = 0; y < kYear; y++) {
            totalDays += getKirkianSpanDays(y);
        }
        for (var m = 0; m < kMonth; m++) {
            totalDays += getDaysInKirkianMonth(kYear, m);
        }
        return totalDaysToGregorian(totalDays);
    }

    function getKirkianYearStartGregorian(kYear) {
        return getKirkianMonthStartGregorian(kYear, 0);
    }

    function getDaysInKirkianYear(kYear) {
        return getKirkianSpanDays(kYear);
    }

    function formatGregorianDate(year, month, day) {
        return GREG_MONTH_NAMES[month - 1] + ' ' + day + ', ' + year;
    }

    function formatKirkianDate(kYear, kMonth, kDay) {
        return kYear + ' AK \u00B7 ' + MONTH_NAMES[kMonth] + ' ' + kDay;
    }

    function formatGregorianDateShort(year, month, day) {
        return GREG_MONTH_NAMES[month - 1].substring(0, 3) + ' ' + day;
    }

    function getDaysInGregorianMonth(year, month) {
        if (month === 2 && isLeapYear(year)) {
            return 29;
        }
        return GREG_MONTH_DAYS[month - 1];
    }

    function generateMonthGrid(kYear, kMonth) {
        var startDate = getKirkianMonthStartGregorian(kYear, kMonth);
        var startDayOfWeek = getDayOfWeek(startDate.year, startDate.month, startDate.day);
        var daysInMonth = getDaysInKirkianMonth(kYear, kMonth);

        var totalWeeks = Math.ceil((startDayOfWeek + daysInMonth) / 7);
        var grid = [];
        var currentDay = 1;

        for (var week = 0; week < totalWeeks; week++) {
            var weekRow = [];
            for (var dow = 0; dow < 7; dow++) {
                if ((week === 0 && dow < startDayOfWeek) || currentDay > daysInMonth) {
                    weekRow.push(null);
                } else {
                    var gregDate = kirkianToGregorian(kYear, kMonth, currentDay);
                    weekRow.push({
                        kDay: currentDay,
                        gregYear: gregDate.year,
                        gregMonth: gregDate.month,
                        gregDay: gregDate.day,
                        dayOfWeek: getDayOfWeek(gregDate.year, gregDate.month, gregDate.day)
                    });
                    currentDay++;
                }
            }
            grid.push(weekRow);
        }

        return grid;
    }

    function getAvailableKirkianYears() {
        var today = getTodayGregorian();
        var currentKYear = gregorianToKirkian(today.year, today.month, today.day).year;
        var years = [];
        for (var y = 0; y <= currentKYear + 2; y++) {
            years.push(y);
        }
        return years;
    }

    function isToday(gregYear, gregMonth, gregDay) {
        var today = getTodayGregorian();
        return today.year === gregYear && today.month === gregMonth && today.day === gregDay;
    }

    function isKirkianToday(kYear, kMonth, kDay) {
        var today = getTodayKirkian();
        return today.year === kYear && today.month === kMonth && today.day === kDay;
    }

    function getTotalDaysBetweenGregorian(y1, m1, d1, y2, m2, d2) {
        return gregorianToTotalDays(y2, m2, d2) - gregorianToTotalDays(y1, m1, d1);
    }

    function parseGregorianDate(str) {
        var months = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12,
            'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
            'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
        };

        str = str.trim();

        var match = str.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/);
        if (match) {
            var m = months[match[1].toLowerCase()];
            var d = parseInt(match[2], 10);
            var y = parseInt(match[3], 10);
            if (m && d >= 1 && d <= 31 && y >= 2025) {
                return { year: y, month: m, day: d };
            }
        }

        match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            var m2 = parseInt(match[1], 10);
            var d2 = parseInt(match[2], 10);
            var y2 = parseInt(match[3], 10);
            if (m2 >= 1 && m2 <= 12 && d2 >= 1 && d2 <= 31 && y2 >= 2025) {
                return { year: y2, month: m2, day: d2 };
            }
        }

        match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
            var y3 = parseInt(match[1], 10);
            var m3 = parseInt(match[2], 10);
            var d3 = parseInt(match[3], 10);
            if (m3 >= 1 && m3 <= 12 && d3 >= 1 && d3 <= 31 && y3 >= 2025) {
                return { year: y3, month: m3, day: d3 };
            }
        }

        return null;
    }

    function parseKirkianDate(str) {
        str = str.trim().toLowerCase();

        var match = str.match(/^(\d+)\s+ak\s+(\w+)\s+(\d+)$/);
        if (match) {
            var year = parseInt(match[1], 10);
            var monthIdx = findMonthIndex(match[2]);
            var day = parseInt(match[3], 10);
            if (monthIdx >= 0 && day >= 1 && day <= getDaysInKirkianMonth(year, monthIdx)) {
                return { year: year, month: monthIdx, day: day };
            }
            return null;
        }

        match = str.match(/^(\d+)\s+ak\s+(\w+)$/);
        if (match) {
            var year2 = parseInt(match[1], 10);
            var monthIdx2 = findMonthIndex(match[2]);
            if (monthIdx2 >= 0) {
                return { year: year2, month: monthIdx2, day: 1 };
            }
        }

        return null;
    }

    function findMonthIndex(name) {
        name = name.toLowerCase();
        for (var i = 0; i < MONTH_NAMES.length; i++) {
            if (MONTH_NAMES[i].toLowerCase() === name) {
                return i;
            }
        }
        return -1;
    }

    return {
        EPOCH_GREG_YEAR: EPOCH_GREG_YEAR,
        EPOCH_GREG_MONTH: EPOCH_GREG_MONTH,
        EPOCH_GREG_DAY: EPOCH_GREG_DAY,
        MONTH_NAMES: MONTH_NAMES,
        MONTH_DAYS: MONTH_DAYS,
        GREG_MONTH_NAMES: GREG_MONTH_NAMES,
        DAY_NAMES: DAY_NAMES,
        DAY_NAMES_SHORT: DAY_NAMES_SHORT,

        isLeapYear: isLeapYear,
        gregorianToTotalDays: gregorianToTotalDays,
        totalDaysToGregorian: totalDaysToGregorian,
        gregorianToKirkian: gregorianToKirkian,
        kirkianToGregorian: kirkianToGregorian,
        getDayOfWeek: getDayOfWeek,
        getDayOfWeekName: getDayOfWeekName,
        getDayOfWeekShort: getDayOfWeekShort,
        getTodayGregorian: getTodayGregorian,
        getTodayKirkian: getTodayKirkian,
        getKirkianMonthStartGregorian: getKirkianMonthStartGregorian,
        getKirkianYearStartGregorian: getKirkianYearStartGregorian,
        getDaysInKirkianYear: getDaysInKirkianYear,
        getDaysInKirkianMonth: getDaysInKirkianMonth,
        formatGregorianDate: formatGregorianDate,
        formatKirkianDate: formatKirkianDate,
        formatGregorianDateShort: formatGregorianDateShort,
        getDaysInGregorianMonth: getDaysInGregorianMonth,
        generateMonthGrid: generateMonthGrid,
        getAvailableKirkianYears: getAvailableKirkianYears,
        isToday: isToday,
        isKirkianToday: isKirkianToday,
        getTotalDaysBetweenGregorian: getTotalDaysBetweenGregorian,
        parseGregorianDate: parseGregorianDate,
        parseKirkianDate: parseKirkianDate,
        findMonthIndex: findMonthIndex
    };
})();