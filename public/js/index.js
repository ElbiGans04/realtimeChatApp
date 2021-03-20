const menuToggle = document.querySelector('.menu-toggle input'),
      nav = document.querySelector('nav ul'),
      main = document.querySelector('.container main')
      tombolSend = document.getElementById('buttonSend'),
      input = document.getElementById('inputText'),
      information = document.getElementById('information'),
      userOnline = document.getElementById('userOnline'),
      to = document.getElementById('to')
      socket = io();


// Untuk Navbar
menuToggle.addEventListener('click' , function(e){
    nav.classList.toggle('slide')
});

// Event Tekan Tombol Kirim
tombolSend.addEventListener('click', sendMessage);
input.addEventListener('keypress', function(event){
    const code = event.keyCode;
    if(code === 13) sendMessage(event);
});

// Event saat pengguna mengetik
input.addEventListener('focus', function(event){
    socket.emit('focus');
});

input.addEventListener('blur', function(event){
    socket.emit('blur')
});


// // // Event Socket Io

// Event Saat Terhubung
let name;
socket.on('connect', function(){
    do {
        name = prompt('Please Insert Your Name!');
    } while (!name || name.length <= 0)
    
    if(name && name.length > 0) {
    
        socket.emit('new user', name)
        
        // Event Saat ada pesan baru
        socket.on('new message', createMessage);
        
        // Event Saat ada user baru
        socket.on('new user', function(name, timeout, show){
            showInformation(name, timeout, show)
            makeOption(show);
        });
        
        // Event Saat ada user lain mengetik
        socket.on('focus', showInformation);
        
        // Event Saat ada user lain sudah tidak mengetik
        socket.on('blur', showInformation);
        
        // Event Saat ada user lain yang keluar
        socket.on('disconnectt', function(name, timeout, show){
            showInformation(name, timeout, show);
            makeOption(show)
        });
    }
})






// Kumpulan Function
function sendMessage (event){
    // Nonaktifkan event default
    event.preventDefault();
    
    // Check Jika panjang nilai lebih dari 0
    if(input.value.length > 0) {
        // Kirim Event
        socket.emit('message', input.value, to.value);
        createMessage(`${name} : ${input.value}`)
    }
    
};


function createMessage (value){
    const li = document.createElement('li');
    li.textContent = `${value}`;

    main.children[0].appendChild(li);
    let height = Math.max( main.scrollHeight, main.offsetHeight, 
        main.clientHeight, main.scrollHeight, main.offsetHeight );
    main.scrollBy(0, height)
    input.value = '';
};


function showInformation(name, timeout, online) {
    if(name.length > 0 ) information.textContent = name;
    if(online)userOnline.textContent = `Pengguna Aktif : ${online}`

    if(timeout === true) {
        setTimeout(function(){
            information.textContent = ''
        }, 3000)
    }
};

function makeOption (show) {
    if(show.length > 0) {
        let user = show.split(' ,');
        to.innerHTML = '';
        user.forEach(function(e, i){
            if(i == 0) {
                let element = document.createElement('option');
                element.setAttribute('value', 'all');
                element.textContent = 'all';
                to.appendChild(element)
            } ;
    
            if(i != (user.length - 1)) {
                let element = document.createElement('option');
                element.setAttribute('value', e);
                element.textContent = `${e}`;
                to.appendChild(element)
            }
        })
    }
}