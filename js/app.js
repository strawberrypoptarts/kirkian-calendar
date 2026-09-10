var KirkianApp = (function() {
    'use strict';

    var C = KirkianCalendar;
    var E = KirkianEvents;

    var currentKYear;
    var currentKMonth;
    var darkMode = false;

    function init() {
        var today = C.getTodayKirkian();
        currentKYear = today.year;
        currentKMonth = today.month;

        loadTheme();
        setupNavigation();
        setupThemeToggle();
        setupSearch();
        setupConverter();
        handleRoute();
        window.addEventListener('hashchange', handleRoute);
    }

    function loadTheme() {
        var saved = localStorage.getItem('kirkian-theme');
        if (saved === 'dark') {
            darkMode = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function setupThemeToggle() {
        var btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.addEventListener('click', function() {
                darkMode = !darkMode;
                document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
                localStorage.setItem('kirkian-theme', darkMode ? 'dark' : 'light');
                btn.textContent = darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19';
            });
            btn.textContent = darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19';
        }
    }

    function setupNavigation() {
        var links = document.querySelectorAll('.nav-link');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var target = this.getAttribute('data-page');
                window.location.hash = target;
            });
        });
    }

    function handleRoute() {
        var hash = window.location.hash.replace('#', '') || 'calendar';
        showPage(hash);
    }

    function showPage(page) {
        var pages = document.querySelectorAll('.page');
        pages.forEach(function(p) { p.classList.remove('active'); });

        var navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(function(l) { l.classList.remove('active'); });

        var targetPage = document.getElementById('page-' + page);
        var targetLink = document.querySelector('.nav-link[data-page="' + page + '"]');

        if (targetPage) {
            targetPage.classList.add('active');
        }
        if (targetLink) {
            targetLink.classList.add('active');
        }

        if (page === 'calendar') {
            renderCalendar();
        } else if (page === 'converter') {
            initConverter();
        } else if (page === 'search') {
            var searchInput = document.getElementById('global-search');
            if (searchInput) searchInput.focus();
        }
    }

    function renderCalendar() {
        renderTodaySummary();
        renderMonthHeader();
        renderCalendarGrid();
        renderUpcomingEvents();
    }

    function renderTodaySummary() {
        var todayG = C.getTodayGregorian();
        var todayK = C.getTodayKirkian();
        var el = document.getElementById('today-summary');
        if (!el) return;

        el.innerHTML =
            '<div class="today-gregorian">' + C.formatGregorianDate(todayG.year, todayG.month, todayG.day) + '</div>' +
            '<div class="today-kirkian">' + todayK.year + ' AK \u00B7 ' + C.MONTH_NAMES[todayK.month] + ' ' + todayK.day + '</div>' +
            '<div class="today-dayofweek">' + C.getDayOfWeekName(todayG.year, todayG.month, todayG.day) + '</div>';
    }

    function renderMonthHeader() {
        var el = document.getElementById('month-header');
        if (!el) return;

        var yearStart = C.getKirkianYearStartGregorian(currentKYear);

        el.innerHTML =
            '<div class="month-nav">' +
            '  <button class="nav-arrow" id="prev-year" title="Previous Year">\u00AB</button>' +
            '  <button class="nav-arrow" id="prev-month" title="Previous Month">\u2039</button>' +
            '  <div class="month-title">' +
            '    <span class="month-name">' + C.MONTH_NAMES[currentKMonth] + '</span>' +
            '    <span class="month-year">' + currentKYear + ' AK</span>' +
            '  </div>' +
            '  <button class="nav-arrow" id="next-month" title="Next Month">\u203A</button>' +
            '  <button class="nav-arrow" id="next-year" title="Next Year">\u00BB</button>' +
            '  <span class="nav-separator"></span>' +
            '  <button class="nav-today" id="today-button" title="Go to today">Today</button>' +
            '</div>' +
            '<div class="month-info">' +
            '  <span>' + C.getDaysInKirkianMonth(currentKYear, currentKMonth) + ' days</span>' +
            '  <span class="separator">\u00B7</span>' +
            '  <span>' + C.formatGregorianDate(yearStart.year, yearStart.month, yearStart.day) + ' \u2013 ' +
            getKirkianMonthEndFormatted(currentKYear, currentKMonth) + '</span>' +
            '</div>';

        document.getElementById('prev-year').addEventListener('click', function() {
            currentKYear--;
            renderCalendar();
        });
        document.getElementById('prev-month').addEventListener('click', function() {
            currentKMonth--;
            if (currentKMonth < 0) {
                currentKMonth = 9;
                currentKYear--;
            }
            renderCalendar();
        });
        document.getElementById('next-month').addEventListener('click', function() {
            currentKMonth++;
            if (currentKMonth > 9) {
                currentKMonth = 0;
                currentKYear++;
            }
            renderCalendar();
        });
        document.getElementById('next-year').addEventListener('click', function() {
            currentKYear++;
            renderCalendar();
        });
        document.getElementById('today-button').addEventListener('click', function() {
            var today = C.getTodayKirkian();
            currentKYear = today.year;
            currentKMonth = today.month;
            renderCalendar();
        });
    }

    function getKirkianMonthEndFormatted(kYear, kMonth) {
        var lastDay = C.getDaysInKirkianMonth(kYear, kMonth);
        var gregDate = C.kirkianToGregorian(kYear, kMonth, lastDay);
        return C.formatGregorianDate(gregDate.year, gregDate.month, gregDate.day);
    }

    function renderCalendarGrid() {
        var el = document.getElementById('calendar-grid');
        if (!el) return;

        var grid = C.generateMonthGrid(currentKYear, currentKMonth);

        var html = '<div class="calendar-weekdays">';
        C.DAY_NAMES_SHORT.forEach(function(d) {
            html += '<div class="weekday-header">' + d + '</div>';
        });
        html += '</div>';

        html += '<div class="calendar-days">';
        grid.forEach(function(week) {
            week.forEach(function(cell) {
                if (cell === null) {
                    html += '<div class="calendar-cell empty"></div>';
                } else {
                    var isTodayCell = C.isToday(cell.gregYear, cell.gregMonth, cell.gregDay);
                    var events = E.getEventsForGregorianDate(cell.gregMonth, cell.gregDay);
                    var classes = 'calendar-cell';
                    if (isTodayCell) classes += ' today';
                    if (events.length > 0) classes += ' has-event';

                    html += '<div class="' + classes + '" data-kyear="' + currentKYear +
                            '" data-kmonth="' + currentKMonth + '" data-kday="' + cell.kDay +
                            '" data-gregyear="' + cell.gregYear + '" data-gregmonth="' + cell.gregMonth +
                            '" data-gregday="' + cell.gregDay + '" tabindex="0" role="button" aria-label="' +
                            C.MONTH_NAMES[currentKMonth] + ' ' + cell.kDay + ', ' + currentKYear + ' AK">';
                    html += '<div class="cell-kday">' + cell.kDay + '</div>';
                    html += '<div class="cell-gregday">' + C.formatGregorianDateShort(cell.gregYear, cell.gregMonth, cell.gregDay) + '</div>';
                    if (events.length > 0) {
                        var emoji = events[0].emoji || '\u2022';
                        html += '<div class="cell-event-dot" title="' + events[0].name + '">' + emoji + '</div>';
                    }
                    html += '</div>';
                }
            });
        });
        html += '</div>';

        el.innerHTML = html;

        var cells = el.querySelectorAll('.calendar-cell:not(.empty)');
        cells.forEach(function(cell) {
            cell.addEventListener('click', function() {
                openDateDetails(this);
            });
            cell.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDateDetails(this);
                }
            });
        });
    }

    function renderUpcomingEvents() {
        var el = document.getElementById('upcoming-events');
        if (!el) return;

        var upcoming = E.getUpcomingEvents(6);
        var html = '<h3>Upcoming Events</h3>';

        if (upcoming.length === 0) {
            html += '<p class="no-events">No upcoming events</p>';
        } else {
            html += '<div class="events-list">';
            upcoming.forEach(function(ev) {
                var kDate = C.gregorianToKirkian(2025, ev.gregorianMonth, ev.gregorianDay);
                var shortGreg = C.formatGregorianDateShort(2025, ev.gregorianMonth, ev.gregorianDay);
                html += '<div class="event-item" data-month="' + ev.gregorianMonth + '" data-day="' + ev.gregorianDay + '">';
                html += '  <span class="event-emoji">' + (ev.emoji || '') + '</span>';
                html += '  <div class="event-info">';
                html += '    <span class="event-name">' + ev.name + '</span>';
                html += '    <span class="event-date">' + C.MONTH_NAMES[kDate.month] + ' ' + kDate.day + ' \u00B7 ' + shortGreg + (ev.recurring ? ' \u00B7 yearly' : '') + '</span>';
                html += '  </div>';
                html += '  <span class="event-category cat-' + ev.category + '">' + ev.category + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }

        el.innerHTML = html;

        var eventItems = el.querySelectorAll('.event-item');
        eventItems.forEach(function(item) {
            item.addEventListener('click', function() {
                var month = parseInt(this.getAttribute('data-month'), 10);
                var day = parseInt(this.getAttribute('data-day'), 10);
                var kDate = C.gregorianToKirkian(2025, month, day);
                currentKYear = kDate.year;
                currentKMonth = kDate.month;
                renderCalendar();
                setTimeout(function() {
                    var cell = document.querySelector('.calendar-cell[data-kday="' + kDate.day + '"]');
                    if (cell) cell.click();
                }, 100);
            });
        });
    }

    function openDateDetails(cellEl) {
        var kYear = parseInt(cellEl.getAttribute('data-kyear'), 10);
        var kMonth = parseInt(cellEl.getAttribute('data-kmonth'), 10);
        var kDay = parseInt(cellEl.getAttribute('data-kday'), 10);
        var gregYear = parseInt(cellEl.getAttribute('data-gregyear'), 10);
        var gregMonth = parseInt(cellEl.getAttribute('data-gregmonth'), 10);
        var gregDay = parseInt(cellEl.getAttribute('data-gregday'), 10);

        var dayOfWeek = C.getDayOfWeekName(gregYear, gregMonth, gregDay);
        var events = E.getEventsForGregorianDate(gregMonth, gregDay);

        var modal = document.getElementById('date-modal');
        var content = document.getElementById('modal-content');

        var html = '<div class="modal-header">';
        html += '<h2>' + C.MONTH_NAMES[kMonth] + ' ' + kDay + ', ' + kYear + ' AK</h2>';
        html += '<button class="modal-close" id="modal-close-btn">&times;</button>';
        html += '</div>';

        html += '<div class="modal-body">';
        html += '<div class="detail-grid">';
        html += '<div class="detail-item"><span class="detail-label">Gregorian Date</span><span class="detail-value">' + C.formatGregorianDate(gregYear, gregMonth, gregDay) + '</span></div>';
        html += '<div class="detail-item"><span class="detail-label">Day of Week</span><span class="detail-value">' + dayOfWeek + '</span></div>';
        html += '<div class="detail-item"><span class="detail-label">Kirkian Year</span><span class="detail-value">' + kYear + ' AK</span></div>';
        html += '<div class="detail-item"><span class="detail-label">Month Number</span><span class="detail-value">' + (kMonth + 1) + ' of 10</span></div>';
        html += '<div class="detail-item"><span class="detail-label">Day of Month</span><span class="detail-value">' + kDay + ' of ' + C.getDaysInKirkianMonth(kYear, kMonth) + '</span></div>';
        html += '<div class="detail-item"><span class="detail-label">Days in Year</span><span class="detail-value">' + C.getDaysInKirkianYear(kYear) + '</span></div>';
        html += '</div>';

        if (events.length > 0) {
            html += '<div class="detail-events">';
            html += '<h3>Events</h3>';
            events.forEach(function(ev) {
                html += '<div class="detail-event">';
                html += '<span class="event-emoji">' + (ev.emoji || '') + '</span>';
                html += '<div><strong>' + ev.name + '</strong>';
                if (ev.description) html += '<p>' + ev.description + '</p>';
                html += '</div></div>';
            });
            html += '</div>';
        }

        html += '<div class="detail-actions">';
        html += '<button class="btn btn-secondary" onclick="KirkianApp.goToDate(' + gregYear + ',' + gregMonth + ',' + gregDay + ')">Go to in Calendar</button>';
        html += '<button class="btn btn-secondary" onclick="KirkianApp.convertDate(' + gregYear + ',' + gregMonth + ',' + gregDay + ')">Convert This Date</button>';
        html += '</div>';
        html += '</div>';

        content.innerHTML = html;
        modal.classList.add('active');

        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handler);
            }
        });
    }

    function closeModal() {
        document.getElementById('date-modal').classList.remove('active');
    }

    function goToDate(gregYear, gregMonth, gregDay) {
        closeModal();
        var kDate = C.gregorianToKirkian(gregYear, gregMonth, gregDay);
        currentKYear = kDate.year;
        currentKMonth = kDate.month;
        window.location.hash = 'calendar';
        renderCalendar();
    }

    function convertDate(gregYear, gregMonth, gregDay) {
        window.location.hash = 'converter';
        setTimeout(function() {
            var gregInput = document.getElementById('converter-greg-input');
            if (gregInput) {
                gregInput.value = C.formatGregorianDate(gregYear, gregMonth, gregDay);
                gregInput.dispatchEvent(new Event('input'));
            }
        }, 100);
    }

    function setupSearch() {
        var searchInput = document.getElementById('global-search');
        var searchResults = document.getElementById('search-results');

        if (!searchInput) return;

        searchInput.addEventListener('input', function() {
            var query = this.value.trim();
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }
            performSearch(query);
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var query = this.value.trim();
                if (query) performSearch(query);
            }
        });

        var exampleButtons = document.querySelectorAll('.example-search');
        exampleButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var query = this.getAttribute('data-query');
                if (searchInput) {
                    searchInput.value = query;
                    performSearch(query);
                }
            });
        });
    }

    function performSearch(query) {
        var results = [];
        var resultsEl = document.getElementById('search-results');

        var gregDate = C.parseGregorianDate(query);
        if (gregDate) {
            var kDate = C.gregorianToKirkian(gregDate.year, gregDate.month, gregDate.day);
            results.push({
                type: 'date',
                title: C.formatGregorianDate(gregDate.year, gregDate.month, gregDate.day),
                subtitle: C.formatKirkianDate(kDate.year, kDate.month, kDate.day),
                gregYear: gregDate.year,
                gregMonth: gregDate.month,
                gregDay: gregDate.day
            });
        }

        var kDate2 = C.parseKirkianDate(query);
        if (kDate2) {
            var gregDate2 = C.kirkianToGregorian(kDate2.year, kDate2.month, kDate2.day);
            results.push({
                type: 'kirkian-date',
                title: C.formatKirkianDate(kDate2.year, kDate2.month, kDate2.day),
                subtitle: C.formatGregorianDate(gregDate2.year, gregDate2.month, gregDate2.day),
                gregYear: gregDate2.year,
                gregMonth: gregDate2.month,
                gregDay: gregDate2.day
            });
        }

        var events = E.searchEvents(query);
        events.forEach(function(ev) {
            var gregDate3 = C.kirkianToGregorian(0, ev.gregorianMonth - 1, ev.gregorianDay);
            results.push({
                type: 'event',
                title: (ev.emoji || '') + ' ' + ev.name,
                subtitle: ev.description,
                gregYear: 0,
                gregMonth: ev.gregorianMonth,
                gregDay: ev.gregorianDay,
                isEventSearch: true
            });
        });

        var html = '';
        if (results.length === 0) {
            html = '<div class="search-empty">No results found for "' + query + '"</div>';
        } else {
            html = '<div class="search-results-list">';
            results.forEach(function(r, i) {
                var icon = r.type === 'event' ? '\uD83D\uDCC5' : '\uD83D\uDCC6';
                html += '<div class="search-result-item" data-index="' + i + '">';
                html += '  <span class="result-icon">' + icon + '</span>';
                html += '  <div class="result-info">';
                html += '    <span class="result-title">' + r.title + '</span>';
                html += '    <span class="result-subtitle">' + r.subtitle + '</span>';
                html += '  </div>';
                html += '</div>';
            });
            html += '</div>';
        }

        resultsEl.innerHTML = html;

        var items = resultsEl.querySelectorAll('.search-result-item');
        items.forEach(function(item, idx) {
            item.addEventListener('click', function() {
                var r = results[idx];
                if (r.isEventSearch) {
                    var kEv = C.gregorianToKirkian(0, r.gregMonth, r.gregDay);
                    currentKYear = 0;
                    currentKMonth = kEv.month;
                } else {
                    currentKYear = C.gregorianToKirkian(r.gregYear, r.gregMonth, r.gregDay).year;
                    currentKMonth = C.gregorianToKirkian(r.gregYear, r.gregMonth, r.gregDay).month;
                }
                window.location.hash = 'calendar';
                renderCalendar();
            });
        });
    }

    function setupConverter() {
        var gregInput = document.getElementById('converter-greg-input');
        var gregResult = document.getElementById('converter-greg-result');

        if (gregInput) {
            gregInput.addEventListener('input', function() {
                var val = this.value.trim();
                if (!val) {
                    gregResult.textContent = '';
                    return;
                }
                var date = C.parseGregorianDate(val);
                if (date) {
                    var kDate = C.gregorianToKirkian(date.year, date.month, date.day);
                    gregResult.textContent = C.formatKirkianDate(kDate.year, kDate.month, kDate.day);
                    gregResult.classList.remove('error');
                } else {
                    gregResult.textContent = 'Invalid date format';
                    gregResult.classList.add('error');
                }
            });
        }

        var kYearInput = document.getElementById('converter-k-year');
        var kMonthInput = document.getElementById('converter-k-month');
        var kDayInput = document.getElementById('converter-k-day');
        var kirkResult = document.getElementById('converter-kirk-result');

        function updateKirkianConversion() {
            var y = parseInt(kYearInput.value, 10);
            var m = parseInt(kMonthInput.value, 10) - 1;
            var d = parseInt(kDayInput.value, 10);

            if (!isNaN(m) && m >= 0 && m <= 9 && !isNaN(y)) {
                var maxDay = C.getDaysInKirkianMonth(y, m);
                kDayInput.max = maxDay;
                if (!isNaN(d) && d > maxDay) {
                    d = maxDay;
                    kDayInput.value = maxDay;
                }
            }

            if (isNaN(y) || isNaN(m) || isNaN(d) || m < 0 || m > 9 ||
                d < 1 || d > C.getDaysInKirkianMonth(y, m)) {
                kirkResult.textContent = '';
                return;
            }

            var gregDate = C.kirkianToGregorian(y, m, d);
            kirkResult.textContent = C.formatGregorianDate(gregDate.year, gregDate.month, gregDate.day);
            kirkResult.classList.remove('error');
        }

        if (kYearInput) kYearInput.addEventListener('input', updateKirkianConversion);
        if (kMonthInput) kMonthInput.addEventListener('change', updateKirkianConversion);
        if (kDayInput) kDayInput.addEventListener('input', updateKirkianConversion);
    }

    function initConverter() {
        var todayG = C.getTodayGregorian();
        var todayK = C.getTodayKirkian();

        var gregInput = document.getElementById('converter-greg-input');
        if (gregInput && !gregInput.value) {
            gregInput.value = C.formatGregorianDate(todayG.year, todayG.month, todayG.day);
            gregInput.dispatchEvent(new Event('input'));
        }

        var kYearInput = document.getElementById('converter-k-year');
        var kMonthInput = document.getElementById('converter-k-month');
        var kDayInput = document.getElementById('converter-k-day');
        if (kYearInput && !kYearInput.value) {
            kYearInput.value = todayK.year;
            kMonthInput.value = todayK.month + 1;
            kDayInput.value = todayK.day;
            kMonthInput.dispatchEvent(new Event('change'));
        }
    }

    return {
        init: init,
        renderCalendar: renderCalendar,
        goToDate: goToDate,
        convertDate: convertDate,
        closeModal: closeModal
    };
})();

document.addEventListener('DOMContentLoaded', KirkianApp.init);
