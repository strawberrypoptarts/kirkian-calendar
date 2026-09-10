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
            name: 'Christmas',
            gregorianMonth: 12,
            gregorianDay: 25,
            description: 'A day of gift-giving and togetherness, held on December 25.',
            category: 'holiday',
            emoji: '\uD83C\uDF84',
            recurring: true
        },
        {
            name: 'Halloween',
            gregorianMonth: 10,
            gregorianDay: 31,
            description: 'A spooky celebration with costumes and treats on October 31.',
            category: 'festival',
            emoji: '\uD83C\uDF83',
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