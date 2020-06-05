
let UIController = (() => {
    let selectedCountry = 'india';

    let HTMLStrings = {
        countries: '#countries',
        countryDiv: '.country-div',
        containerConfirm: '#container-confirmed',
        containerRecovered: '#container-recover',
        containerDeath: '#container-death',
        selectDayRange: '.select-day-range',
        confirmedCount: '#confirmed-count',
        activeCount: '#active-count',
        recoveredCount: '#recovered-count',
        deathCount: '#death-count',
        confirmedCard: '#confirmed-card',
        rangeConfirmedCount: '#range-confirmed-count',
        confirmedChart: '#confirmed-case-chart',
        confirmSelectDayRange: '#confirm-select-day-range',
        confirmedLabel: '.label-total-confirmed',
        activeCard: '#active-card',
        rangeActiveCount: '#range-active-count',
        activeChart: '#active-case-chart',
        activeSelectDayRange: '#active-select-day-range',
        recoveredCard: '#recovered-card',
        rangeRecoveredCount: '#range-recovered-count',
        recoveredChart: '#recovered-case-chart',
        recoveredSelectDayRange: '#recovered-select-day-range',
        recoveredLabel: '.label-total-recovered',
        deathCard: '#death-card',
        rangeDeathCount: '#range-death-count',
        deathChart: '#death-case-chart',
        deathSelectDayRange: '#death-select-day-range',
        deathLabel: '.label-total-deaths',

    };

    let setTotalCasesForStatus = (data) => {
        let confirmed = 0;
        let active = 0;
        let recovered = 0;
        let deaths = 0;

        for (let province of data) {
            confirmed += province['Confirmed'];
            active += province['Active'];
            recovered += province['Recovered'];
            deaths += province['Deaths'];
        }
        document.querySelector(HTMLStrings.confirmedCount).innerText = UIController.numberFormat(confirmed);
        document.querySelector(HTMLStrings.activeCount).innerText = UIController.numberFormat(active);
        document.querySelector(HTMLStrings.recoveredCount).innerText = UIController.numberFormat(recovered);
        document.querySelector(HTMLStrings.deathCount).innerText = UIController.numberFormat(deaths);
    }

    let setCasesForStatus = (count, status) => {
        if (status === 'active')
            document.querySelector(HTMLStrings.rangeActiveCount).innerText = UIController.numberFormat(count);

        if (status === 'confirmed')
            document.querySelector(HTMLStrings.rangeConfirmedCount).innerText = UIController.numberFormat(count);

        if (status === 'recovered')
            document.querySelector(HTMLStrings.rangeRecoveredCount).innerText = UIController.numberFormat(count);

        if (status === 'deaths')
            document.querySelector(HTMLStrings.rangeDeathCount).innerText = UIController.numberFormat(count);
    }

    let getChartColors = (status, type) => {
        if (type === 'background') {
            if (status === 'confirmed') {
                return ['rgba(255, 99, 132, 0.2)']
            }
            if (status === 'recovered') {
                return ['rgba(91, 184, 52, 0.2)']
            }
            if (status === 'deaths') {
                return ['rgba(118, 128, 144, 0.2)']
            }
        }
        if (type === 'border') {
            if (status === 'confirmed') {
                return ['rgba(255, 99, 132, 1)']
            }
            if (status === 'recovered') {
                return ['rgba(91, 184, 52, 1)']
            }
            if (status === 'deaths') {
                return ['rgba(118, 128, 144, 1)']
            }
        }
    }

    let setChartForStatus = (data, status = 'confirmed') => {

        let labels = [];
        let chartData = [];
        let months = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];

        for (let i = 0; i < data.length; i = i + 5) {
            let d = new Date(data[i]['Date']);
            labels.push(d.getDate() + " " + months[d.getMonth()]);
            chartData.push(data[i]['Cases']);
        }
        labels.push(new Date().getDate() + " " + months[new Date().getMonth()]);
        chartData.push(data[data.length - 1]['Cases']);

        let chartName = HTMLStrings.confirmedChart;
        if (status === 'active') {
            chartName = HTMLStrings.activeChart;
        }

        if (status === 'recovered') {
            chartName = HTMLStrings.recoveredChart;
        }

        if (status === 'deaths') {
            chartName = HTMLStrings.deathChart;
        }

        let ctx = document.querySelector(chartName);
        let statusChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: status+ ' Cases',
                    data: chartData,
                    backgroundColor: getChartColors(status, 'background'),
                    borderColor: getChartColors(status, 'border'),
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false,
                            stepSize: 10000,
                        }
                    }]
                }
            }
        });
    }

    let getCountryFlag = (country) => {
        switch (country) {
            case 'india':
                return 'IN';
            case 'australia':
                return 'AU';
            case 'united-states':
                return 'US';
            case 'united-kingdom':
                return 'GB';
            case 'france':
                return 'FR';
            case 'canada':
                return 'CA';
            case 'spain':
                return 'ES';
            case 'italy':
                return 'IT';
            default:
                return 'IN';
        }
    }

    return {
        numberFormat(number) {
            return Intl.NumberFormat('en-US').format(number);
        },

        setCountry(country) {
            selectedCountry = country;
            document.querySelector(HTMLStrings.countryDiv).innerHTML
                = '<img src="https://www.countryflags.io/' + getCountryFlag(country) + '/flat/32.png"> <span class="country-name">' + country + '</span>'
        },

        getHTMLStrings() {
            return HTMLStrings;
        },

        getSummaryCount() {
            let yesterday = moment().subtract(1, 'days').format().split('T')[0];
            let today = moment().format().split('T')[0];
            axios.get('https://api.covid19api.com/country/' + selectedCountry + '?from=' + yesterday + 'T00:00:00Z&to=' + today + 'T00:00:00Z')
                .then( response => {
                let res = response['data'];
                setTotalCasesForStatus(res);
            });
        },

        getCasesForStatus(status = 'confirmed', delta = 30) {

            let fromDate = moment().subtract(delta, 'days').format().split('T')[0];
            let toDate = moment().format().split('T')[0];

            axios.get('https://api.covid19api.com/total/country/' + selectedCountry + '/status/' + status
                + '?from=' + fromDate + 'T00:00:00Z&to=' + toDate + 'T00:00:00Z').then( response => {
                let res = response['data'];
                setCasesForStatus(res[res.length - 1]['Cases'] - res[0]['Cases'], status);
                setChartForStatus(res, status);

                if (status === 'confirmed') {
                    document.querySelector(HTMLStrings.confirmedLabel).innerText = "Total Confirmed in last " + delta
                        + " days";
                }

                if (status === 'recovered') {
                    document.querySelector(HTMLStrings.confirmedLabel).innerText = "Total Recovered in last " + delta
                        + " days";
                }

                if (status === 'deaths') {
                    document.querySelector(HTMLStrings.confirmedLabel).innerText = "Total Deaths in last " + delta
                        + " days";
                }
            });
        }
    }
})();

((UIController) => {

    let HTMLStrings = UIController.getHTMLStrings();
    let setupEventListeners = () => {
        document.querySelector(HTMLStrings.confirmSelectDayRange).addEventListener('change', (event) => {
            UIController.getCasesForStatus('confirmed', event.target.value);
        });

        document.querySelector(HTMLStrings.recoveredSelectDayRange).addEventListener('change', (event) => {
            UIController.getCasesForStatus('recovered', event.target.value);
        });

        document.querySelector(HTMLStrings.deathSelectDayRange).addEventListener('change', (event) => {
            UIController.getCasesForStatus('deaths', event.target.value);
        });

        document.querySelector(HTMLStrings.countries).addEventListener('change', (event) => {
            UIController.setCountry(event.target.value);
            UIController.getSummaryCount();
            document.querySelector(HTMLStrings.confirmedCard).dispatchEvent(new Event('click'));
        });

        document.querySelector(HTMLStrings.deathCard).addEventListener('click', () => {
            UIController.getCasesForStatus('deaths');
            document.querySelector(HTMLStrings.containerConfirm).classList.remove('show')
            document.querySelector(HTMLStrings.containerRecovered).classList.remove('show')
        });

        document.querySelector(HTMLStrings.confirmedCard).addEventListener('click', () => {
            UIController.getCasesForStatus('confirmed');
            document.querySelector(HTMLStrings.containerDeath).classList.remove('show')
            document.querySelector(HTMLStrings.containerRecovered).classList.remove('show')
        });

        document.querySelector(HTMLStrings.recoveredCard).addEventListener('click', () => {
            UIController.getCasesForStatus('recovered');
            document.querySelector(HTMLStrings.containerConfirm).classList.remove('show')
            document.querySelector(HTMLStrings.containerDeath).classList.remove('show')
        });
    };

    let init = () => {
        console.log('Initializing...');
        setupEventListeners();
        UIController.getSummaryCount();
        UIController.getCasesForStatus('confirmed');
    }
    init();

})(UIController);
