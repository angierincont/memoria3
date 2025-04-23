// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDaDkzSyvlpv6VQTMgVQiLIrbyr1FbtBYU",
    authDomain: "memoria-c4ba2.firebaseapp.com",
    projectId: "memoria-c4ba2",
    storageBucket: "memoria-c4ba2.firebasestorage.app",
    messagingSenderId: "417235816980",
    appId: "1:417235816980:web:0de36bd00e24214e920d01"
  };
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Prueba de conexión
  db.collection("usuarios").add({
    nombre: "kevin",
    edad: 25
  }).then((docRef) => {
    console.log("Documento agregado con ID:", docRef.id);
  }).catch((error) => {
    console.error("Error al agregar documento:", error);
  });
  

document.addEventListener("DOMContentLoaded", () => {
    const startGameBtn = document.getElementById("startGame");
    const gameBoard = document.getElementById("gameBoard");
    const timeDisplay = document.getElementById("time");
    const message = document.getElementById("message");
    const playerNameInput = document.getElementById("playerName");
    const rankingTable = document.getElementById("ranking");

    let flippedCards = [];
    let matches = 0;
    let startTime;
    let timer;

    const emojis = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍍", "🥝", "🍑"];
    const gameCards = [...emojis, ...emojis];

    startGameBtn.addEventListener("click", startGame);

    function startGame() {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert("Por favor, ingresa tu nombre.");
            return;
        }

        gameBoard.innerHTML = "";
        matches = 0;
        flippedCards = [];
        startTime = Date.now();
        message.textContent = "";
        timeDisplay.textContent = "0";

        // Mezclar cartas
        gameCards.sort(() => Math.random() - 0.5);

        // Crear cartas en el tablero
        gameCards.forEach((emoji, index) => {
            const card = document.createElement("div");
            card.classList.add("card", "hidden");
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.addEventListener("click", flipCard);
            gameBoard.appendChild(card);
        });

        // Iniciar temporizador
        timer = setInterval(() => {
            timeDisplay.textContent = Math.floor((Date.now() - startTime) / 1000);
        }, 1000);
    }

    function flipCard() {
        if (flippedCards.length < 2) {
            this.classList.remove("hidden");
            this.textContent = this.dataset.emoji;
            flippedCards.push(this);
        }

        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 500);
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            matches++;
            flippedCards = [];
            if (matches === emojis.length) {
                endGame();
            }
        } else {
            card1.classList.add("hidden");
            card1.textContent = "";
            card2.classList.add("hidden");
            card2.textContent = "";
            flippedCards = [];
        }
    }

    function endGame() {
        clearInterval(timer);
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        message.textContent = `¡Juego terminado en ${finalTime} segundos!`;

        saveScore(playerNameInput.value.trim(), finalTime);
    }

    function saveScore(name, time) {
        db.collection("puntuaciones").add({
            nombre: name,
            tiempo: time,
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            message.textContent += " Puntuación guardada.";
            loadRanking(); // Actualizar el ranking
        })
        .catch((error) => {
            message.textContent += " Error al guardar la puntuación.";
            console.error("Error:", error);
        });
    }

    function loadRanking() {
        db.collection("puntuaciones")
        .orderBy("tiempo", "asc") // Ordenar por menor tiempo
        .limit(5) // Mostrar solo los 5 mejores tiempos
        .get()
        .then((querySnapshot) => {
            rankingTable.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = `<tr>
                    <td>${data.nombre}</td>
                    <td>${data.tiempo}</td>
                    <td>${new Date(data.fecha.toDate()).toLocaleString()}</td>
                </tr>`;
                rankingTable.innerHTML += row;
            });
        })
        .catch((error) => {
            console.error("Error al cargar el ranking:", error);
        });
    }

    loadRanking(); // Cargar el ranking al iniciar
});
