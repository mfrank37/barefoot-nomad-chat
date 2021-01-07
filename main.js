let serverURL = 'http://localhost:3000/api/v1';
window.TOKEN; // for testing
window.UserID;
window.CREDENTIALS = {};
window.ACTIVE_CHATTER = {};
/* Login */
const login = async (e) => {
    e.preventDefault();
    CREDENTIALS.email = e.target.email.value,
    CREDENTIALS.password = e.target.password.value;
    let POST = new XMLHttpRequest();
    POST.open('POST', serverURL + '/user/login', true);
    POST.setRequestHeader('Content-Type', 'application/json');
    POST.onreadystatechange = () => {
        if(POST.status == 200) {
            console.log(POST.responseText);
            // POST.responseText.to
            RES = JSON.parse(POST.responseText);
            console.log(RES);
            UserID = RES.profile.id;
            TOKEN = RES.data;
            console.log(TOKEN, UserID);
            e.target.remove();
            UserID = '0ce36391-2c08-3074-bddb-a4ea8bbcbbc5';
            getMessages(TOKEN, UserID);
            
            const socket = io.connect('http://localhost:3000', {
                query :{
                     token: window.TOKEN,
                    userID : window.UserID
                }
            });
        }
    };
    await POST.send(JSON.stringify(CREDENTIALS));
}

const getMessages = async (TOKEN, userID) => {
    let GET = new XMLHttpRequest();
    GET.open('GET', serverURL + '/chat/loadUsers/');
    GET.setRequestHeader('Authorization', 'Bearer '+TOKEN);
    GET.onreadystatechange = () => {
        let RES = JSON.parse(GET.responseText);
        listUsers(RES);
    };
    await GET.send();
}

const pinUser = (e) => {
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
    
}

const listUsers = (LIST) => {
    let listView = document.querySelector('.chat-list');
    LIST.forEach((USER) => {
        let chat = document.createElement('div');
        chat.classList.add('chat-item');
        chat.setAttribute('data-id', USER.id);
        chat.addEventListener('click', pinUser);
        chat.innerHTML = `
            <div class="avatar" data-id='${USER.id}'>
            </div>
            <div class="recent-message">
                <div class="name">
                    ${USER.first_name + ' ' + USER.last_name}
                </div>
                <span class="you">You:</span> <span class="message"><i>last sms</i></span>
            </div>`;
        listView.appendChild(chat);
    });
}

const loginForm = document.querySelector('form.login');
loginForm.addEventListener('submit', login);

// /* Send messages from User with his ID */
// socket.on('chat-message', data => {
    //     console.log(data);
    // });
    // socket.on('new-connection' , msg => {
        //     console.log(msg);
        // });


// socket.on('disconnected', msg => {
//     console.log(msg);
// });

// const txtArea = document.querySelector('textarea');

// const sendMessage = (evt) => {
//     evt.preventDefault();
//     let message = txtArea.value;
//     txtArea.value = '';
//     txtArea.focus();
//     if(!message) return;
//     socket.emit('chat-private', sendIt(message, TOKEN));
//     let sentMsg = document.createElement('div');
//     sentMsg.classList.add('sent');
//     sentMsg.innerHTML = message;
//     document.querySelector('.messages').appendChild(sentMsg);
// }

// const sendIt = (message) => {
//     let chat_from = 'mfrank37';
//     let chat_to = document.querySelector('#active-chatter .name').innerHTML;
//     return {
//         token:TOKEN,
//         chat_from: TOKEN ? chat_from : 'visitor',
//         chat_to: TOKEN ? chat_to :'BAREFOOT SUPPORT',
//         chat_message: message,
//     }
// }

// const form = document.querySelector('form.send');
// form.addEventListener('submit', sendMessage);
