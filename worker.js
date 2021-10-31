// зависимости
const path = require('path')

// импорт игровых переменных и функций
const processing = require('./processing')
const connections = processing.connections
const tables = processing.tables
const players = processing.players
const init = processing.init
const action = processing.action

// конфигурация http и ws
const http = require('http')
const WebSocket = require('ws')
const express = require('express')
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({server})
const PORT = process.env.PORT || 3000
app.set('port', PORT)

// middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/public', express.static(__dirname + '/public'))

// переменная имени игрока
let userName = ''

// маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})
app.post('/name', (req, res) => {
	userName = req.body.field_name
	res.sendFile(path.join(__dirname, 'game.html'))
})

// запуск сервера
server.listen(PORT, () => {
    console.log(`Запускаю воркер на порте ${PORT}`)
})

// подключение к серверу
wss.on('connection', (ws) => {
	
	// генерация id подключения
	ws.id = Math.random()
	
	// лог
	console.log(`Игрок с ID ${ws.id} подключился к серверу!`)
	
	// обработка сообщений
	ws.on('message', (data) => {
		
		// данные от клиента
		let object = JSON.parse(data)
		
		// инициализация игровых объектов
		if (object.nameEvent == 'new player') init(ws, userName)
		
		// обработка действий
		if (object.nameEvent != 'new player') action(ws, object)
		
		// ответ сервера
		if (players != {}) {
			
			// игровой стол
			let table = tables[players[ws.id]]
			
			// отправка данных игроку1
			ws.send(JSON.stringify({table: table, id: ws.id}))
			
			// очистка сообщений для игрока1
			table.players.find((player) => player.id == ws.id).message = ''
			
			// если игроков двое
			if (table.players.length == 2) {
				
				// игрок2
				let player2 = table.players.find((player) => player.id != ws.id)
				
				// подключение2
				let ws2 = connections[player2.id]
				
				// отправка данных игроку2
				ws2.send(JSON.stringify({table: table, id: ws2.id}))
				
				// очистка сообщений для игрока2
				table.players.find((player) => player.id != ws.id).message = ''
			}
			
			// очистка общих сообщений
			tables[players[ws.id]].message = ''
		}
	})
	
	// разрыв соединения
	ws.on('close', () => {
		
		// перебор столов
		for (let key in tables) {
			
			// перебор игроков
			for (let player of tables[key].players) {
				
				// если есть совпадение с текущим id
				if (player.id == ws.id) {
					
					// удаление стола
					delete tables[key]
					
					// удаление игрока
					delete players[ws.id]
					
					// лог
					console.log(`Игрок с ID ${ws.id} отключился от сервера!`)
					
					// прерывание функции
					return
				}
			}
		}
	})
})