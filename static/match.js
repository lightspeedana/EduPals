const gridContainer = document.querySelector(".grid-container");
const timer = document.querySelector(".timer");
const timerInterval = setInterval(updateTimer, 1000);
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let maxTime = 100;
timeLeft = maxTime;

document.querySelector(".score").textContent = score;

function updateTimer() {
  timer.textContent = timeLeft;
  timeLeft--; // Decrement time by 1 second

  if (timeLeft === 0) {
    // Stop the timer interval
    clearInterval(timerInterval);
    alert("Time's up! Game over.");

    // Reset board and stop rendering cards
    resetBoard();
    lockBoard = true;
    return;
  }
}

updateTimer();

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    console.log(card);
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <a class="front-text">
        ${card.desc}
        </a>
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  score++;
  document.querySelector(".score").textContent = score;
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  timeLeft = maxTime;
  $(".score").textContent = score;
  gridContainer.innerHTML = "";
  generateCards();
}