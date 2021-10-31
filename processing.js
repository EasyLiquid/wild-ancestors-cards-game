// импорт игровых классов
let classes = require('./classes')
let Table = classes.Table
let Player = classes.Player
let Hero = classes.Hero
let Card = classes.Card

// литерал подключений
let connections = {}

// литерал игровых столов
let tables = {}

// литерал игроков
let players = {}

// общее количество игроков
let countPlayers = 0

// параметры инициализации
let shell = {
	countCards: 25,
	minATK: 1,
	maxATK: 10,
	minHLT: 1,
	maxHLT: 10,
	defender: 0.5,
	heroATK: 0,
	heroHLT: 30
}

// инициализация и распределение игроков
function init(socket, name) {
	
	// добавление подключения в литерал
	connections[socket.id] = socket
	
	// если столы отсутствуют или нечётное количество игроков
	if (tables == {} || countPlayers % 2 == 0) {
		
		// инициализация нового стола
		let newTable = new Table()
		
		// добавление стола в литерал
		tables[newTable.id] = newTable
	}
	
	// если столы присутствуют
	if (tables != {}) {
		
		// перебор столов
		for (let key in tables) {
			
			// если игроков у стола меньше 2-х
			if (tables[key].players.length < 2) {
				
				// инициализация нового игрока
				let player = new Player(name, socket.id, tables[key].id)
				
				// определение позиции игрока
				if (tables[key].players.length == 0) player.position = 1
				if (tables[key].players.length == 1) player.position = 2
				
				// инициализация карт
				for (let i = 0; i < shell.countCards; i++) {
					let card = new Card(
						
						// имя
						`card${i}`,
						
						// атака
						Math.round(Math.random() * (shell.maxATK - shell.minATK) + shell.minATK),
						
						// защита
						Math.round(Math.random() * (shell.maxHLT - shell.minHLT) + shell.minHLT),
						
						// карта-защитник
						Math.random() < shell.defender ? true : false
					)
					
					// стоимость
					card.cost = Math.round((card.attack + card.health) / 2)
					
					// добавление карты в массив игрока
					player.deck.push(card)
				}
				
				// инициализация героя
				let hero = new Hero('hero', shell.heroATK, shell.heroHLT)
				player.hero = hero
				
				// добавление в руку первых пяти карт методом стека
				for (let i = 0; i < 5; i++) {
					player.hand.unshift(player.deck.shift())
				}
				
				// добавление игрока в массив игрового стола
				tables[key].players.push(player)
				
				// связывание литералов "tables" и "players"
				players[socket.id] = player.tableID
				
				// обновление счётчика игроков
				countPlayers++
				
				// сообщение для клиента
				tables[key].message = 'new player'
				
				// прерывание цикла
				break
			}
		}
	}
}

// обработка действий
function action(socket, data) {
	
	// игровой стол
	let table = tables[data.tableID]
	
	// игрок1
	let player1 = table.players.find((player) => player.id == socket.id)
	
	// проверка очереди
	if ((table.step % 2 == 1 && player1.position == 1) || (table.step % 2 == 0 && player1.position == 2)) {
		
		// проверка имени события
		switch(data.nameEvent) {
			
			// следующий ход
			case 'next step':
				
				// вызов метода следующего хода
				table.nextStep(player1.id)
				
				// прерывание поиска
				break
				
			// разыгрывание карты
			case 'play card':
				
				// вызов метода разыгрывания карты
				table.toPlayed(player1.id, data.cardID)
				
				// прерывание поиска
				break
				
			// атака
			case 'attack':
				
				// игрок2
				let player2 = table.players.find((player) => player.id != socket.id)
				
				// вызов метода проверки на наличие карт-защитников
				table.checkDefender(player1.id, player2.id, data.cardID1, data.cardID2, data.hero)
				
				// прерывание поиска
				break
		}
	}
}

// экспорт
module.exports = {connections, tables, players, init, action}