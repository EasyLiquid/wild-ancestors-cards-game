function $(id) {
	return document.getElementById(id)
}

let you = {}
let enemy = {}

function drawCards(player, field) {
	for (let card of player[field]) {
		let imgCard = document.createElement('div')
		let name = document.createElement('div')
		let attack = document.createElement('div')
		let health = document.createElement('div')
		let cost = document.createElement('div')
		let defender = document.createElement('div')
		
		imgCard.id = card.id
		imgCard.class = 'cards'
		imgCard.style = 'width: 60px; height: 91px; border: solid 1px; margin-left: 30px; float: left;'
		
		if (player == you) {
			imgCard.draggable = true
			imgCard.addEventListener('dragstart', (event) => dragStart(event))
		}
		
		if (player == enemy) {
			imgCard.addEventListener('dragover', (event) => dragOver(event))
			imgCard.addEventListener('drop', (event) => dragDrop(event))
		}
		
		name.innerHTML = card.name
		attack.innerHTML = card.attack
		health.innerHTML = card.health
		cost.innerHTML = card.cost
		defender.innerHTML = card.defender ? 'def' : ''
		name.style = 'text-align: center; position: relative; top: 32px;'
		attack.style = 'width: 5px; height: 5px; position: relative; top: 50px; left: 5px;'
		health.style = 'width: 5px; height: 5px; position: relative; top: 44px; left: 42px;'
		cost.style = 'width: 5px; height: 5px; position: relative; bottom: 25px; left: 42px'
		defender.style = 'width: 5px; height: 5px; position: relative; bottom: 30px; left: 5px'
		attack.title = 'Атака'
		health.title = 'Здоровье'
		cost.title = 'Стоимость'
		if (card.defender) defender.title = 'Карта-защитник'
		
		imgCard.appendChild(name)
		imgCard.appendChild(attack)
		imgCard.appendChild(health)
		imgCard.appendChild(cost)
		imgCard.appendChild(defender)
		
		if (player.position == 1) $(`${field}1`).appendChild(imgCard)
		if (player.position == 2) $(`${field}2`).appendChild(imgCard)
	}
}

const socket = new WebSocket('ws://localhost:3000')

socket.onopen = (event) => {
	socket.send(JSON.stringify({nameEvent: 'new player'}))
}

socket.onmessage = (event) => {
	let data = JSON.parse(event.data)
	let table = data.table
	you = table.players.find((player) => player.id == data.id)
	enemy = table.players.find((player) => player.id != data.id)
	
	if (table.message == 'new player') {
		if (you.position == 1) {
			$('hero1').style = 'position: absolute; top: 79%; left: 83%;'
			$('hero2').style = 'position: absolute; top: 3%; left: 10%;'
			$('deck1').style = 'position: absolute; top: 79%; left: 90%;'
			$('deck2').style = 'position: absolute; top: 3%; left: 3%;'
			$('hand1').style = 'width: 710px; top: 79%; left: 10%;'
			$('hand2').style = 'width: 710px; top: 3%; left: 17%;'
			$('played1').style = 'width: 916px; top: 50%; left: 3%;'
			$('played2').style = 'width: 916px; top: 27%; left: 3%;'
			$('discard1').style = 'position: absolute; top: 79%; left: 3%;'
			$('discard2').style = 'position: absolute; top: 3%; left: 90%;'
			
			$('played1').addEventListener('dragover', (event) => dragOver(event))
			$('played1').addEventListener('drop', (event) => dragDrop(event))
			$('hero2').addEventListener('dragover', (event) => dragOver(event))
			$('hero2').addEventListener('drop', (event) => dragDrop(event))
		}
		
		if (you.position == 2) {
			$('hero2').style = 'position: absolute; top: 79%; left: 83%;'
			$('hero1').style = 'position: absolute; top: 3%; left: 10%;'
			$('deck2').style = 'position: absolute; top: 79%; left: 90%;'
			$('deck1').style = 'position: absolute; top: 3%; left: 3%;'
			$('hand2').style = 'width: 710px; top: 79%; left: 10%;'
			$('hand1').style = 'width: 710px; top: 3%; left: 17%;'
			$('played2').style = 'width: 916px; top: 50%; left: 3%;'
			$('played1').style = 'width: 916px; top: 27%; left: 3%;'
			$('discard2').style = 'position: absolute; top: 79%; left: 3%;'
			$('discard1').style = 'position: absolute; top: 3%; left: 90%;'
			
			$('played2').addEventListener('dragover', (event) => dragOver(event))
			$('played2').addEventListener('drop', (event) => dragDrop(event))
			$('hero1').addEventListener('dragover', (event) => dragOver(event))
			$('hero1').addEventListener('drop', (event) => dragDrop(event))
		}
	}
	
	$('hand1').innerHTML = ''
	$('hand2').innerHTML = ''
	$('played1').innerHTML = ''
	$('played2').innerHTML = ''
	
	if (you) {
		drawCards(you, 'hand')
		drawCards(you, 'played')
		
		if (you.position == 1) {
			$('name_hero1').innerHTML = you.hero.name
			$('attack_hero1').innerHTML = you.hero.attack
			$('health_hero1').innerHTML = you.hero.health
			$('count_deck1').innerHTML = you.deck.length
			$('count_discard1').innerHTML = you.discard.length
		}
		
		if (you.position == 2) {
			$('name_hero2').innerHTML = you.hero.name
			$('attack_hero2').innerHTML = you.hero.attack
			$('health_hero2').innerHTML = you.hero.health
			$('count_deck2').innerHTML = you.deck.length
			$('count_discard2').innerHTML = you.discard.length
		}
		
		$('mana1').innerHTML = you.hero.currentEnergy
		$('mana2').innerHTML = you.hero.limitEnergy
		
		if (enemy) {
			drawCards(enemy, 'played')
			
			if (enemy.position == 1) {
				$('name_hero1').innerHTML = enemy.hero.name
				$('attack_hero1').innerHTML = enemy.hero.attack
				$('health_hero1').innerHTML = enemy.hero.health
				$('count_deck1').innerHTML = enemy.deck.length
				$('count_discard1').innerHTML = enemy.discard.length
			}
			
			if (enemy.position == 2) {
				$('name_hero2').innerHTML = enemy.hero.name
				$('attack_hero2').innerHTML = enemy.hero.attack
				$('health_hero2').innerHTML = enemy.hero.health
				$('count_deck2').innerHTML = enemy.deck.length
				$('count_discard2').innerHTML = enemy.discard.length
			}
		}
	}
	
	if ((table.step % 2 == 1 && you.position == 1) || (table.step % 2 == 0 && you.position == 2)) {
		$('message').innerHTML = 'Ваш ход!'
	} else {
		$('message').innerHTML = 'Ход противника!'
	}
	
	if (you.message != '') {
		alert(you.message)
		you.message = ''
	}
}

socket.onerror = (error) => {
	alert('Ошибка подключения к серверу!')
}

function toAttack(cardID1, cardID2) {
	socket.send(JSON.stringify({
		nameEvent: 'attack',
		tableID: you.tableID,
		cardID1: cardID1,
		cardID2: cardID2,
		hero: cardID2 == 'hero1' || cardID2 == 'hero2' ? true : false
	}))
}

function toPlayed(cardID) {
	socket.send(JSON.stringify({
		nameEvent: 'play card',
		tableID: you.tableID,
		cardID: cardID
	}))
}

function toNextStep() {
	socket.send(JSON.stringify({
		nameEvent: 'next step',
		tableID: you.tableID
	}))
}

function dragStart(event) {
	event.dataTransfer.setData('text', event.target.getAttribute('id'))
}

function dragOver(event) {
	event.preventDefault()
}

function dragDrop(event) {
	let id1 = event.dataTransfer.getData('text')
	let id2 = event.target.getAttribute('id')
	if (id2 != 'played1' && id2 != 'played2') toAttack(id1, id2)
	if (id2 == 'played1' || id2 == 'played2') toPlayed(id1)
	event.stopImmediatePropagation()
}