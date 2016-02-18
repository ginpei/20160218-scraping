var client = require('cheerio-httpcli');

var url = 'http://www.translink.ca/en/Schedules-and-Maps/Alerts.aspx';
var selector = '#tab0 .alertInfo strong';
var rxToken = /setCookie\('(.+)', '(.+)', 10\);/;
var rxGoodStatus = /Operating normally\.?/;

client.fetch(url)
	.then(function(result) {
		var tokens = result.body.match(rxToken);
		client.headers['Cookie'] = tokens[1] + '=' + tokens[2];
		return client.fetch(url);
	})
	.then(function(result) {
		result.$(selector).each(function(i,el) {
			var title = el.firstChild.nodeValue.trim().slice(0,-1);
			var status = el.nextSibling.nodeValue.trim();
			if (rxGoodStatus.test(status)) {
				console.log('✔', title);
			}
			else {
				var detail = result.$(el).closest('.alertInfo').next().find('p').text().trim();
				console.log('✘', title, ': [', status, '] ', detail);
			}
		});
	})
	.catch(function(err) {
		console.error(err);
	})
	.finally(function() {
		console.log('done.');
	});
