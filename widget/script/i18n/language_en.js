var I18N = {
	'home': 'HOME',
	'cart': 'CART',
	'my': 'MY',
	'newOrder': 'Product',
	'fastOrder': 'Fast Order',
	'dealer': 'Dealer',
	'overdue': 'Overdue',
	'overage': 'Overage',
	'reconciliation': 'Reconciliation',
	'attendence': 'Attendance',
	'information': 'Information',
	'question': 'Question',
	'notice':  'Notice',
	'news':  'News',
	'announcement':  'Announce',
	'policy':  'Policy',
	'new':  'New',
	'recommend':  'Recommend',
	'upcoming':  'Upcoming'
};

initLabel();

function initLabel(){
	var labels = $api.domAll('.i18n_label');
	for(var i = labels.length-1; i >= 0; i--){
		$api.html(labels[i], I18N[$api.attr(labels[i], 'id')] || '');
	}
}