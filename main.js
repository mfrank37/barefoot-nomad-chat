window.TOKEN; // for testing
window.UserID;
// TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiZWZhY2U0M2MtMmU0OS00NzNiLWJiZTItMzA1ZDFhNTE5MGYxIiwidXNlcm5hbWUiOiJtZnJhbmszNyIsImlhdCI6MTYwOTUxOTcwMCwiZXhwIjoxNjEwMTI0NTAwfQ.b_gRE91TZAaTSTSkwGp798_KOq9PP6kbe7FIePvGQ6A';
let serverURL = 'http://localhost:3000/api/v1';
window.CREDENTIALS = {};
const login = (e) => {
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
            TOKEN = JSON.parse(POST.responseText.data);
            UserID = JSON.parse(POST.responseText.profile.id);
            console.log(TOKEN, UserID);
            e.target.remove();
        }
    };

    POST.send(JSON.stringify(CREDENTIALS));
}

const loginForm = document.querySelector('form.login');
loginForm.addEventListener('submit', login);

// const socket = io('http://localhost:3000');

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

const sendMessage = (evt) => {
    evt.preventDefault();
    let message = txtArea.value;
    txtArea.value = '';
    txtArea.focus();
    if(!message) return;
    socket.emit('chat-private', sendIt(message, TOKEN));
    let sentMsg = document.createElement('div');
    sentMsg.classList.add('sent');
    sentMsg.innerHTML = message;
    document.querySelector('.messages').appendChild(sentMsg);
}

const sendIt = (message) => {
    let chat_from = 'mfrank37';
    let chat_to = document.querySelector('#active-chatter .name').innerHTML;
    return {
        token:TOKEN,
        chat_from: TOKEN ? chat_from : 'visitor',
        chat_to: TOKEN ? chat_to :'BAREFOOT SUPPORT',
        chat_message: message,
    }
}

const form = document.querySelector('form.send');
form.addEventListener('submit', sendMessage);
