'use strict';
(()=>{
	const ws = new WebSocket('ws://192.168.xxx.xxx:40510'),
	inputPseudo = document.getElementById('inputPseudo'),
	textaera = document.getElementById('pseudos_list'),
	validBtn = document.getElementById('validBtn'),
	valid1Btn = document.getElementById('valid1Btn'),
	resultat = document.getElementById('resultat'),

	error_message = document.getElementById('error_message');


	let RESULT = [];

	// ws
	ws.onopen = () => console.log('connected');

	ws.onmessage = event => {
		const data = JSON.parse(event.data);
		if (data.resp) {
			RESULT = data.resp;
			while (resultat.firstChild) { 
				resultat.removeChild(resultat.firstChild); 
			}
			for (let i in RESULT){
				const pseudo = RESULT[i];
				const para = document.createElement("p");
				let textNode = '';
				para.setAttribute('id', RESULT[i]);
				para.setAttribute('class', 'result');
				para.style.color = 'white';
				para.style.backgroundColor = 'green';
				textNode = pseudo+' n\'est pas ban !';
				const node = document.createTextNode(textNode);
				para.appendChild(node);
				resultat.appendChild(para);
			}
		}
	}

	ws.onclose = () => console.log('disconnected');	

	validBtn.addEventListener('click', e => {
		const data_to_send = {};
		data_to_send['pseudo'] = inputPseudo.value;
		if (ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({pseudos:inputPseudo.value}));
		}
	});

	valid1Btn.addEventListener('click', e => {
		const PSEUDOS = (textaera.value).split('\n');
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({pseudos:PSEUDOS}));
		}
	});

})();
