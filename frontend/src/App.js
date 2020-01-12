import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import moment from 'moment';

const App = () => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUserName] = useState('');
  const [typingName, setTypingName] = useState('');
  const [room, setRoom] = useState('room1');
  // для аутентификации
  // const [authStatus, setAuthStatus] = useState(false);
  // const [user, setUser] = useState(
  //     {
  //                 login: '',
  //                 password: ''
  //     });

  const socket = useRef();
  const typstyle = useRef();

  typstyle.current = { display: 'none', position: 'fixed', left: 0, bottom: '72px', zIndex: 222};

  const onSubmit = e => {
    e.preventDefault();

    const message = text.trim();
    if (!message) {
      return;
    }

    const name = username.trim();
    if (!username) {
      alert('Введите имя!');
      return;
    }

    console.log(name, message);


    socket.current.emit('messages', {name, message});
    setText('');
    document.querySelector('form').scrollIntoView(false);
  };


  // для аутентификации
  // const onLoginFormSubmit = e => {
  //   e.preventDefault();
  // };

  // const onInput = (e) => {
  //   e.preventDefault();
  //
  //   setUser({
  //     ...user,
  //     [e.target.name]: e.target.value
  //   });
  // };

  useEffect(() => {
    socket.current = io(window.location.host, { transports: ['websocket']});

    socket.current.on('messages', messages => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });

      setMessages(prevMessage => prevMessage.concat(messages));
      document.querySelector('form').scrollIntoView(false);
    });

    socket.current.on('typing', (name) => {
      setTypingName(name);
      document.querySelector('#typ').style.display = 'inline';
      setTimeout(() => {document.querySelector('#typ').style.display = 'none';}, 100)
    });

  }, []);

  useEffect(() => {
    const listener = () => {


      const messageId = messages.length ? messages[messages.length - 1].id : null;

      socket.current.emit('getMessages', messageId);
    };

    socket.current.on('connect', listener);

    return () => socket.current.removeListener('connect', listener);
  }, [messages]);


  // if (!authStatus) {
    return (
        <div>
          <form onSubmit={onSubmit}>
            {messages.map(({ id, name, message, createdAt }) => (
                <div className="message" key={id}>
                  <div>
                    <span className='username'>{name}: </span>
                    {message}
                    <span className="timestamp">{moment(createdAt).format('hh:mm')}</span>
                  </div>
                </div>
            ))}
            <span id="typ" style={typstyle.current}>{typingName ? typingName : 'Кто-то'} печатает...</span>
            <input className="input-chat" onKeyDown={() => socket.current.emit('typing', username)} value={text} placeholder="Напечатайте и Enter"  onChange={e => setText(e.target.value)} />
          </form>
          <div className="input-name" >
            <label htmlFor="name">Ваше имя: </label>
            <input id="name" type="text" onChange={(e)=>setUserName(e.target.value)} placeholder="Введите имя"/>
          </div>
          {/*<ul className="rooms">*/}
          {/*  <li>*/}
          {/*    <input id="room1" name="room" value="room1" type="radio" checked onChange={e=>setRoom(e.target.id)}/>*/}
          {/*    <label htmlFor="room1">Room#1</label>*/}
          {/*  </li>*/}
          {/*  <li>*/}
          {/*    <input id="room2" name="room" value="room2" type="radio" onChange={e=>setRoom(e.target.id)}/>*/}
          {/*    <label htmlFor="room2">Room#2</label>*/}
          {/*  </li>*/}
          {/*  <li>*/}
          {/*    <input id="room3" name="room" value="room3" type="radio" onChange={e=>setRoom(e.target.id)}/>*/}
          {/*    <label htmlFor="room3">Room#3</label>*/}
          {/*  </li>*/}
          {/*</ul>*/}
        </div>
    )
  // } else {
    // return (<form className="login" onSubmit={onLoginFormSubmit}>
    //   <h2>Войдите, чтобы открыть чат</h2>
    //   <label htmlFor="name">Логин</label>
    //   <input onInput={onInput} type="text" name="login" id="name" value={user.login}/>
    //   <label htmlFor="password">Пароль</label>
    //   <input onInput={onInput} type="text" id="password" name="password" value={user.password}/>
    //   <button>Открыть чат</button>
    // </form>)
  // }

};

export default App;
