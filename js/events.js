var KirkianEvents = (function() {
    'use strict';

    var events = [
        {
            name: 'Kirkian New Year',
            gregorianMonth: 9,
            gregorianDay: 10,
            description: 'The beginning of a new Kirkian year. Celebrated as the most important holiday in the Kirkian Calendar.',
            category: 'holiday',
            emoji: '\uD83C\uDF89',
            recurring: true
        },
        {
            name: 'Kirkfall Fest',
            gregorianMonth: 10,
            gregorianDay: 16,
            description: 'Celebration marking the end of Kirkfall, the first month of the Kirkian year.',
            category: 'festival',
            emoji: '\uD83C\uDF3F',
            recurring: true
        },
        {
            name: 'Founding Day',
            gregorianMonth: 9,
            gregorianDay: 10,
            description: 'Anniversary of the creation of the Kirkian Calendar system.',
            category: 'holiday',
            emoji: '\u2B50',
            recurring: true
        },
        {
            name: 'Kirkvember Night',
            gregorianMonth: 12,
            gregorianDay: 11,
            description: 'A night of celebration during Kirkvember, featuring feasts and gatherings.',
            category: 'festival',
            emoji: '\uD83C\uDF19',
            recurring: true
        },
        {
            name: 'Kirkmas',
            gregorianMonth: 12,
            gregorianDay: 25,
            description: 'A day of gift-giving and togetherness during the Kirkian winter.',
            category: 'holiday',
            emoji: '\uD83C\uDF84',
            recurring: true
        },
        {
            name: 'Mid-Kirkian',
            gregorianMonth: 1,
            gregorianDay: 14,
            description: 'The midpoint of the Kirkian year, celebrated with reflection and celebration.',
            category: 'holiday',
            emoji: '\uD83C\uDF1F',
            recurring: true
        },
        {
            name: 'Kirkian Independence Day',
            gregorianMonth: 4,
            gregorianDay: 14,
            description: 'Commemorating the independence and self-determination of the Kirkian system.',
            category: 'holiday',
            emoji: '\uD83C\uDFD3\uFE0F',
            recurring: true
        },
        {
            name: 'Kirkstar Rising',
            gregorianMonth: 7,
            gregorianDay: 11,
            description: 'The beginning of Kirkstar month, celebrating the stars and sky.',
            category: 'festival',
            emoji: '\u2B50',
            recurring: true
        },
        {
            name: 'iQuarters Eve',
            gregorianMonth: 8,
            gregorianDay: 10,
            description: 'The eve of the final and longest month of the Kirkian year.',
            category: 'festival',
            emoji: '\uD83C\uDF06',
            recurring: true
        },
        {
            name: 'Last Day of iQuarters',
            gregorianMonth: 9,
            gregorianDay: 9,
            description: 'The final day of the Kirkian year. A time for reflection before the new year.',
            category: 'holiday',
            emoji: '\uD83C\uDF19',
            recurring: true
        },
        {
            name: 'Kirkian Anniversary',
            gregorianMonth: 9,
            gregorianDay: 10,
            description: 'Annual celebration of the Kirkian Calendar itself.',
            category: 'holiday',
            emoji: '\uD83C\uDF82',
            recurring: true
        },
        {
            name: 'Winter Kirkian Solstice',
            gregorianMonth: 12,
            gregorianDay: 21,
            description: 'The shortest day of the Gregorian year, observed during the Kirkian month of Kirkvember.',
            category: 'observance',
            emoji: '\u2744\uFE0F',
            recurring: true
        },
        {
            name: 'Spring Awakening',
            gregorianMonth: 3,
            gregorianDay: 20,
            description: 'The first day of spring in the Gregorian calendar, falling during Kirkember.',
            category: 'observance',
            emoji: '\uD83C\uDF31',
            recurring: true
        },
        {
            name: 'Summer Kirkian Feast',
            gregorianMonth: 6,
            gregorianDay: 21,
            description: 'The summer solstice feast, celebrated during the Kirkian month of Kirkian.',
            category: 'festival',
            emoji: '\u2600\uFE0F',
            recurring: true
        }
    ];

    function getEventsForGregorianDate(month, day) {
        return events.filter(function(e) {
            return e.gregorianMonth === month && e.gregorianDay === day;
        });
    }

    function getEventsForKirkianDate(kYear, kMonth, kDay) {
        var gregDate = KirkianCalendar.kirkianToGregorian(kYear, kMonth, kDay);
        return getEventsForGregorianDate(gregDate.month, gregDate.day);
    }

    function searchEvents(query) {
        query = query.toLowerCase();
        return events.filter(function(e) {
            return e.name.toLowerCase().indexOf(query) !== -1 ||
                   e.description.toLowerCase().indexOf(query) !== -1 ||
                   e.category.toLowerCase().indexOf(query) !== -1;
        });
    }

    function getAllEvents() {
        return events.slice();
    }

    function getUpcomingEvents(count) {
        var today = KirkianCalendar.getTodayGregorian();
        var todayOrdinal = today.month * 100 + today.day;
        var upcoming = events.filter(function(e) {
            var eOrdinal = e.gregorianMonth * 100 + e.gregorianDay;
            return eOrdinal >= todayOrdinal;
        });
        var past = events.filter(function(e) {
            var eOrdinal = e.gregorianMonth * 100 + e.gregorianDay;
            return eOrdinal < todayOrdinal;
        });
        return upcoming.concat(past).slice(0, count || 5);
    }

    return {
        getEventsForGregorianDate: getEventsForGregorianDate,
        getEventsForKirkianDate: getEventsForKirkianDate,
        searchEvents: searchEvents,
        getAllEvents: getAllEvents,
        getUpcomingEvents: getUpcomingEvents
    };
})();
