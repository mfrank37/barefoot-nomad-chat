const serverURL = 'http://localhost:3000/api/v1';
window.TOKEN; // for testing
window.UserID;
window.CREDENTIALS = {};
window.ACTIVE_CHATTER = {};
window.socket;

/* Login */
const login = async (e) => {
    e.preventDefault();
    CREDENTIALS.email = e.target.email.value,
    CREDENTIALS.password = e.target.password.value;
    const RESPONSE = await fetch(serverURL + '/user/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(CREDENTIALS)
    }).then( RES => RES.json());
    UserID = RESPONSE.profile.id;
    TOKEN = RESPONSE.data;
    console.log('Logged in as :', {TOKEN, UserID});
    getChatList(TOKEN);
    e.target.remove();
    window.socket = io.connect('http://localhost:3000', {
        query :{
            token: await TOKEN,
            userID : window.UserID
        }
    });
}

const getChatList = async (TOKEN) => {
    const RESPONSE = await fetch(serverURL + '/chat/chatlist/me', {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + TOKEN
        }
    }).then( RES => RES.json());
    listUsers(RESPONSE);
};

const pinUser = async (e) => {
    const getItem = (item) => {
        return item.hasAttribute('data-id') ? item : getItem(item.parentElement)
    }
    let chatItem = getItem(e.target);
    ACTIVE_CHATTER.name = chatItem.querySelector('.name').innerHTML.trim();
    ACTIVE_CHATTER.id = chatItem.getAttribute('data-id');
    try {
        document.querySelector('#active-chatter').removeAttribute('id');
    } catch (error) {
        //
    }
    console.log(ACTIVE_CHATTER);
    chatItem.id = 'active-chatter';
    document.querySelector('.chat-active > .chat-item .name')
    .innerHTML = ACTIVE_CHATTER.name;
    let messagesDisplay = document.querySelector('.messages');
    while(messagesDisplay.hasChildNodes()){
        messagesDisplay.firstChild.remove();
    }
    const RESPONSE = await fetch(serverURL+'/chat/'+ ACTIVE_CHATTER.id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + TOKEN
        }
    }).then(RES => RES.json());
    displayMessages(RESPONSE);
}

const displayMessages = ({chats}) => {
    chats.reverse();
    let messages = document.querySelector('.chat-active .messages');
    chats.forEach(CHAT => {
        let chatItem = document.createElement('div');
        if(CHAT.sender === UserID) {
            chatItem.classList.add('sent');
        } else {
            chatItem.classList.add('received');
        }
        chatItem.innerHTML = CHAT.message;
        messages.appendChild(chatItem);
    });
}

const listUsers = (LIST) => {
    let listView = document.querySelector('.chat-list');
    LIST.forEach( async (USER) => {
        let { lastMessage } = await fetch(serverURL+'/chat/last/'+USER.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+TOKEN
            }
        }).then(RES => RES.json());
        console.log(lastMessage);
        let chat = document.createElement('div');
        chat.classList.add('chat-item');
        chat.setAttribute('data-id', USER.id);
        chat.addEventListener('click', pinUser);
        chat.innerHTML = `
            <div class="avatar">
            </div>
            <div class="recent-message">
            <div class="name">
            ${USER.first_name + ' ' + USER.last_name}
            </div>
            ${ lastMessage.sender == UserID ? '<span class="you">You: </span>' : '' }<span class="message"><i>${lastMessage.message}</i></span>
            </div>`;
        listView.appendChild(chat);
    });
}

const loginForm = document.querySelector('form.login');
loginForm.addEventListener('submit', login);

// /* Send messages from User with his ID */
socket.on('chat-message', data => {
    console.log(data);
});
socket.on('new-connection' , msg => {
            console.log(msg);
        });


socket.on('disconnected', msg => {
    console.log(msg);
});


const sendMessage = async (evt) => {
    evt.preventDefault();
    let message = txtArea.value;
    if(!message) return;
    let chatTo = document.querySelector('#active-chatter').getAttribute('data-id');
    console.log('sending to ', chatTo);
    let RESPONSE = await fetch(serverURL+'/chat', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer '+TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_message: message,
            to: chatTo
        })
    }).then(RES => RES.json());
    txtArea.value = '';
    txtArea.focus();
    // socket.emit('chat-private', sendIt(message, TOKEN));
    let sentMsg = document.createElement('div');
    sentMsg.classList.add('sent');
    sentMsg.innerHTML = await RESPONSE.message;
    document.querySelector('.messages').appendChild(sentMsg);
}

const txtArea = document.querySelector('textarea');
const form = document.querySelector('form.send');
form.addEventListener('submit', sendMessage);
