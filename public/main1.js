'use strict';
(()=>{
	const ws = new WebSocket('ws://192.168.1.22:40510'),
	api_url = 'https://www.jeuxvideo.com/sso/ajax_suggest_pseudo.php?pseudo=',
	inputPseudo = document.getElementById('inputPseudo'),
	minInput = document.getElementById('min'),
	maxInput = document.getElementById('max'),
	textaera = document.getElementById('pseudos_list'),
	validBtn = document.getElementById('validBtn'),
	valid1Btn = document.getElementById('valid1Btn'),
	resultat = document.getElementById('resultat'),

	error_message = document.getElementById('error_message');

	//result = document.getElementById('result');

	let RESULT = [];

	// ws
	ws.onopen = () => console.log('connected');

	ws.onmessage = event => {
		const data = JSON.parse(event.data);
		if (data.FIN) {
			RESULT = data.FIN;
			while (resultat.firstChild) { 
    			resultat.removeChild(resultat.firstChild); 
			} 
			for (let i in RESULT){
				const pseudo = RESULT[i];
				const para = document.createElement("p");
				let textNode = '';
				para.setAttribute('id', RESULT[i]);
				para.setAttribute('class', 'result');
				textNode = pseudo ? 'Le pseudo '+i+' n\'est pas banni' : 'Le pseudo '+i+' est banni';
				const node = document.createTextNode(textNode);
				para.appendChild(node);
				resultat.appendChild(para);
			}
		}
	}

	ws.onclose = () => console.log('disconnected');	

	validBtn.addEventListener('click', e => {
		const min = minInput.value;
		const max = maxInput.value;
		const sample = inputPseudo.value;
		const PSEUDOS = [];
		for (let i = min; i <= max; i++) {
			console.log(i);
			PSEUDOS.push(sample+(i.toString()));
		}
		if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({pseudo:PSEUDOS}));
		}
	});

	valid1Btn.addEventListener('click', e => {
		const PSEUDOS = (textaera.value).split('\n');
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({pseudo:PSEUDOS}));
		}
	});

})();