'use strict';
const WebSocket = require('ws'),
server = new WebSocket.Server({ port: 40510 }),
axios = require('axios'),
pool = require('generic-pool'),
express = require('express'),
app = express();
app.use(express.static(__dirname + '/public'));

/*
cookie associé à notre compte jvc indispensable pour avoir accès à l'api
IMPORTANT : ne fonctionne pas si le compte est ban
*/
const url = 'https://www.jeuxvideo.com/sso/ajax_suggest_pseudo.php?pseudo='
const coniunctio = ''

const factory = {
	create: () => {
		return axios.create({
			//baseURL:url,
			//timeout: 1000,
			headers: {'Cookie': 'coniunctio='+coniunctio}
		});
	},
	destroy: client => {
		client.delete();
	},
	/*validate: client => {
		return client.get('').then(response => {
			return response.status === 200;
		}).catch(error => {

		});
	}*/
};

const opts = {
	max: 50,
	min: 1
};

const api_pool = pool.createPool(factory, opts);

server.on('connection', (ws, req) => {
	ws.on('message', data => {
		const DATA = JSON.parse(data); //toutes les données envoyés par le clients
		const pseudos = DATA.pseudos; //les pseudos reçu par le clients
		const pseudos_pas_ban = [];	
		let pseudos_recu = []

		/*
		si on ne reçois qu'un seul pseudo on le met dans un tableau pour qu'il soit traité comme un tableau
		*/
		/*if (typeof(pseudos) === 'string'){
			pseudos_recu.push(pseudos);
		}
		else {
			pseudos_recu = pseudos; 
			console.log(pseudos);
		}
*/
		
		pseudos_recu = typeof(pseudos) === 'string' ? [pseudos] : pseudos;
		for (let i = 0; i < pseudos_recu.length; i++) {
			if (!pseudos_recu[i].match(/^[a-zA-Z0-9\-_\[\]]{3,15}$/)) {
				console.log("Pseudo " + pseudos_recu[i] + " is not valid and will not be sent to the API");
				//ws.send(JSON.stringify({err:"Pseudo " + pseudos_recu[i] + " is not valid and will not be sent to the API"}));
			}
			else {

			}
		}
		
		console.log('contenu reçu :');
		console.log(pseudos_recu) //liste des pseudos reçus
		
		let requestsCompleted = 0; //variable qui servira à compter le nombre de requête reçue
		//on boucle pour chaque pseudo, une requête par pseudo
		for (let i = 0; i < pseudos_recu.length; i++) {
			api_pool.acquire()
			.then(client => {
				//requête http de type get vers l'api pour récup les données
				client.get('https://www.jeuxvideo.com/sso/ajax_suggest_pseudo.php?pseudo='+pseudos_recu[i])
				.then(response => {
					//réponse de la requête
					const resp = response.data;
					console.log(resp);
					/*
					si resp.alias n'est pas vide, alors le pseudo n'est pas ban et 
					donc on le met dans le tableau des pseudos pas ban pour l'envoyer au client par la suite
					*/
					if ((resp.alias).length > 0) {
						for (let i = 0; i < (resp.alias).length; i++) {
							pseudos_pas_ban.push((resp.alias[i]).pseudo);
							console.log(resp.alias[i].pseudo);
						}			
					}
					requestsCompleted++;
					api_pool.release(client);
					//si toutes les requetes ont été reçues (complétées), alors on envoi les données au client
					if (requestsCompleted === pseudos_recu.length) {
						ws.send(JSON.stringify({resp:pseudos_pas_ban})); //la liste des pseudos non ban est envoyé
						console.log('contenu envoyé : ');
						console.log(pseudos_pas_ban);
					}
				})
				.catch(error => {
					console.log(error);
					api_pool.release(client);
				});
			});
		}
	});
});
app.listen(8080);