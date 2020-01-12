const [{ Server: h1 }, x] = [require('http'), require('express')];
const socketIO = require('socket.io');

//-----
const mg = require('mongoose');

mg.Promise = global.Promise;
const conn = mg.createConnection('mongodb+srv://user:user@cluster0-lwvqu.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
});

const MessageSchema = new mg.Schema({
  room: {
    type: 'String'
  },
  name: {
    type: 'String'
  },
  message: {
    type: 'String'
  },
}, {"collection": "messages"});
const Message = conn.model('Message', MessageSchema);

//----

let s;
const PORT = 1234;
const { log } = console;
const hu = { 'Content-Type': 'text/html; charset=utf-8' };
const app = x();
app
  .use(x.static('./frontend/build/'))
  // здесь отсчёт идёт от той папки, где запускается yarn start
  // если бы мы писали node . в этой папке (где index.js)
  // то надо было бы брать путь '../frontend/build

  .use(({ res: r }) => r.status(404).end('Пока нет!'))
  .use((e, r, rs, n) => rs.status(500).end(`Ошибка: ${e}`))
  /* .set('view engine', 'pug') */
  .set('x-powered-by', false);
module.exports = s = h1(app)
  .listen(process.env.PORT || PORT, () => log(process.pid));

const ws = socketIO(s);
const cb = (d) => log(d);


ws.on('connection', (wsock) => {

  console.log(wsock);
  log('Новый пользователь!');
  wsock.emit('serv', 'Добро пожаловать!', cb);




  wsock.on('disconnect', () => log('Пользователь отвалился!'));
});

ws.on('connect', async (wsock) => {
  wsock.on('getMessages', async () => {
    const recentMessages = await Message.find();
    wsock.emit('messages', recentMessages);
  });

  wsock.on('typing', async (name) => {
    wsock.broadcast.emit('typing', name);
  });

  wsock.on('messages', async ({name, message}) => {
    console.log(name, message);
    const nm = new Message({ name, message });
    await nm.save();
    wsock.emit('messages', [nm]);
    wsock.broadcast.emit('messages', [nm]);
  });
});
