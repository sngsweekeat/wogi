$(document).ready(function () {

    $.sidebarMenu($('.sgds-side-navigation'));
    var datepicker = bulmaCalendar.attach('#datepickerDemoTrigger', {
        startDate: new Date('02/11/2018'),
        dateFormat: 'DD/MM/YYYY',
        showHeader: false,
        showFooter: false
    });

    var trigger = document.querySelector('#datepicker-trigger');

    if (trigger) {
        trigger.addEventListener('click', function (e) {
            datepicker[0].show();
            console.log('cal')
        });
    }
})