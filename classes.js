// игровой стол
class Table {
	constructor() {
		this.id = Math.random()
		this.players = []
		this.step = 1
		this.message = ''
	}
	
	// разыгрывание карты
	toPlayed(playerID, cardID) {
		
		// если параметры присутствуют
		if (playerID && cardID) {
			
			// игрок
			let player = this.players.find((player) => player.id == playerID)
			
			// индекс карты
			let index = player.hand.findIndex((card) => card.id == cardID)
			
			// карта
			let card = player.hand[index]
			
			// если карта присутствует
			if (card) {
				
				// если маны достаточно
				if (player.hero.currentEnergy >= card.cost) {
					
					// перенос карты из руки на поле
					player.played.push(player.hand.splice(index, 1)[0])
					
					// вычитание маны
					player.hero.currentEnergy -= card.cost
					
					// лог
					console.log(`Игрок ${playerID} разыграл карту ${cardID}`)
					
				} else {
					
					// сообщение для игрока
					player.message = 'Недостаточно маны!'
				}
			}
		}
	}
	
	// сброс карты
	toDiscard(playerID, cardID) {
		
		// если параметры присутствуют
		if (playerID && cardID) {
			
			// игрок
			let player = this.players.find((player) => player.id == playerID)
			
			// индекс карты
			let index = player.played.findIndex((card) => card.id == cardID)
			
			// если присутствует игрок и индекс карты не -1
			if (player && ~index) {
				
				// перенос карты с поля в сброшенные
				player.discard.push(player.played.splice(index, 1)[0])
				
				// лог
				console.log(`Карта ${cardID} сброшена игроком ${playerID}`)
			}
		}
	}
	
	// следующий ход
	nextStep(playerID) {
		if (playerID && this.players.length == 2) {
			let player = this.players.find((player) => player.id == playerID)
			
			if (player) {
				this.step++
				player.hero.limitEnergy++
				player.hero.currentEnergy = player.hero.limitEnergy
				
				// добавление карты в руку методом стека
				if (player.deck.length > 0) player.hand.unshift(player.deck.shift())
				
				// снятие блокировки атаки с разыгранных карт
				player.played.map((card) => card.allowAttack = true)
				
				// лог
				console.log(`Игрок ${playerID} передал ход`)
			}
		}
	}
	
	// проверка на наличие карт-защитников
	checkDefender(playerID1, playerID2, cardID1, cardID2, hero2) {
		
		// если параметры присутствуют
		if (playerID1 && playerID2 && cardID1 && cardID2) {
			
			// игрок1
			let player1 = this.players.find((player) => player.id == playerID1)
			
			// игрок2
			let player2 = this.players.find((player) => player.id == playerID2)
			
			// атакующая карта
			let attackCard = player1.played.find((card) => card.id == cardID1)
			
			// защищающаяся карта2
			let defenseCard = player2.played.find((card) => card.id == cardID2)
			
			// если атака на героя
			if (hero2) defenseCard = player2.hero
			
			// если игроки и карты присутствуют
			if (player1 && player2 && attackCard && defenseCard) {
				
				// если атака разрешена
				if (attackCard.allowAttack) {
				
					// лог
					console.log(`Карта ${cardID1} игрока ${playerID1} атакует карту ${cardID2} игрока ${playerID2}`)
					
					// перебор карт игрока2
					for (let card of player2.played) {
						
						// если есть карта-защитник и текущая карта — не защитник
						if (card.defender && !defenseCard.defender) {
							
							// сообщение для игрока
							player1.message = 'Сперва атакуйте карту-защитника!'
							
							// лог
							console.log('Атака не разрешена!')
							
							// прерывание функции
							return
						}
					}
					
					// лог
					console.log('Атака разрешена!')
					
					// блокировка повторной атаки
					attackCard.allowAttack = false
					
					// вызов метода нанесения урона
					this.damageCard(player1, player2, attackCard, defenseCard)
					
				} else {
					
					// сообщение для игрока
					player1.message = 'Нельзя атаковать только что разыгранной картой или более 1-го раза в ход!'
				}
			}
		}
	}
	
	// нанесение урона
	damageCard(player1, player2, attackCard, defenseCard) {
		
		// нанесение урона защищающейся карте
		defenseCard.health -= attackCard.attack
		
		// нанесение урона атакующей карте
		attackCard.health -= defenseCard.attack
		
		// логи
		console.log(`Карта ${attackCard.id} нанесла урон карте ${defenseCard.id}`)
		console.log(`Карта ${defenseCard.id} нанесла урон карте ${attackCard.id}`)
		
		// сообщения для игрока
		player1.message += 
			`${attackCard.name} нанес(ла) ${attackCard.attack} урона ${defenseCard.name}` +
			`\n${defenseCard.name} нанес(ла) ${defenseCard.attack} урона ${attackCard.name}`
		
		// если здоровье защищающейся карты <= 0
		if (defenseCard.health <= 0) {
			
			// сброс карты
			this.toDiscard(player2.id, defenseCard.id)
			
			// сообщение для игрока
			player1.message += `\n${defenseCard.name} уничтожен(а)`
		}
		
		// если здоровье атакующей карты <= 0
		if (attackCard.health <= 0) {
			
			// сброс карты
			this.toDiscard(player1.id, attackCard.id)
			
			// сообщение для игрока
			player1.message += `\n${attackCard.name} уничтожен(а)`
		}
		
		// копирование сообщения для другого игрока
		player2.message = player1.message
		
		// если здоровье героя <= 0
		if (player2.hero.health <= 0 && player1.hero.health > 0) {
			
			// сообщения для игроков
			player1.message += `\nВЫ ПОБЕДИЛИ!`
			player2.message += `\nВЫ ПРОИГРАЛИ!`
			
			// очистка массивов руки
			player1.hand = []
			player2.hand = []
			
			// очистка массивов разыгранных карт
			player1.played = []
			player2.played = []
		}
	}
}

// игрок
class Player {
	constructor(name, playerID, tableID) {
		this.id = playerID
		this.tableID = tableID
		this.name = name
		this.position = 0
		this.hero = {}
		this.deck = []
		this.hand = []
		this.played = []
		this.discard = []
		this.message = ''
	}
}

// герой
class Hero {
	constructor(name, attack, health) {
		this.id = Math.random()
		this.name = name
		this.attack = attack
		this.health = health
		this.currentEnergy = 5
		this.limitEnergy = 5
	}
}

// карта
class Card {
	constructor(name, attack, health, defender) {
		this.id = Math.random()
		this.name = name
		this.attack = attack
		this.health = health
		this.defender = defender
		this.cost = 0
		this.allowAttack = false
	}
}

// экспорт
module.exports = {Table, Player, Hero, Card}