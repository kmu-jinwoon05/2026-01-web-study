const GAME_LENGTH = 30;

const pokemonPool = [
  { id: 1, ko: "이상해씨", en: "Bulbasaur", aliases: ["fushigidane"] },
  { id: 4, ko: "파이리", en: "Charmander", aliases: ["hitokage"] },
  { id: 7, ko: "꼬부기", en: "Squirtle", aliases: ["zenigame"] },
  { id: 25, ko: "피카츄", en: "Pikachu", aliases: [] },
  { id: 39, ko: "푸린", en: "Jigglypuff", aliases: ["purin"] },
  { id: 52, ko: "나옹", en: "Meowth", aliases: [] },
  { id: 54, ko: "고라파덕", en: "Psyduck", aliases: ["koduck"] },
  { id: 58, ko: "가디", en: "Growlithe", aliases: ["gardie"] },
  { id: 63, ko: "캐이시", en: "Abra", aliases: ["casey"] },
  { id: 66, ko: "알통몬", en: "Machop", aliases: [] },
  { id: 74, ko: "꼬마돌", en: "Geodude", aliases: ["ishitsubute"] },
  { id: 81, ko: "코일", en: "Magnemite", aliases: ["coil"] },
  { id: 92, ko: "고오스", en: "Gastly", aliases: [] },
  { id: 95, ko: "롱스톤", en: "Onix", aliases: [] },
  { id: 104, ko: "탕구리", en: "Cubone", aliases: [] },
  { id: 115, ko: "캥카", en: "Kangaskhan", aliases: [] },
  { id: 122, ko: "마임맨", en: "Mr Mime", aliases: ["mrmime", "mr.mime"] },
  { id: 129, ko: "잉어킹", en: "Magikarp", aliases: [] },
  { id: 133, ko: "이브이", en: "Eevee", aliases: ["eievui"] },
  { id: 143, ko: "잠만보", en: "Snorlax", aliases: ["kabigon"] },
  { id: 147, ko: "미뇽", en: "Dratini", aliases: ["minyong"] },
  { id: 149, ko: "망나뇽", en: "Dragonite", aliases: ["mangnanyong"] },
  { id: 150, ko: "뮤츠", en: "Mewtwo", aliases: [] },
  { id: 152, ko: "치코리타", en: "Chikorita", aliases: [] },
  { id: 155, ko: "브케인", en: "Cyndaquil", aliases: ["bukein"] },
  { id: 158, ko: "리아코", en: "Totodile", aliases: [] },
  { id: 172, ko: "피츄", en: "Pichu", aliases: [] },
  { id: 175, ko: "토게피", en: "Togepi", aliases: [] },
  { id: 183, ko: "마릴", en: "Marill", aliases: [] },
  { id: 194, ko: "우파", en: "Wooper", aliases: [] },
  { id: 197, ko: "블래키", en: "Umbreon", aliases: ["blacky"] },
  { id: 200, ko: "무우마", en: "Misdreavus", aliases: [] },
  { id: 246, ko: "애버라스", en: "Larvitar", aliases: ["aeburaseu"] },
  { id: 252, ko: "나무지기", en: "Treecko", aliases: [] },
  { id: 255, ko: "아차모", en: "Torchic", aliases: [] },
  { id: 258, ko: "물짱이", en: "Mudkip", aliases: [] },
  { id: 280, ko: "랄토스", en: "Ralts", aliases: [] },
  { id: 282, ko: "가디안", en: "Gardevoir", aliases: [] },
  { id: 302, ko: "깜까미", en: "Sableye", aliases: [] },
  { id: 359, ko: "앱솔", en: "Absol", aliases: [] },
  { id: 371, ko: "아공이", en: "Bagon", aliases: [] },
  { id: 376, ko: "메타그로스", en: "Metagross", aliases: [] },
  { id: 387, ko: "모부기", en: "Turtwig", aliases: [] },
  { id: 390, ko: "불꽃숭이", en: "Chimchar", aliases: [] },
  { id: 393, ko: "팽도리", en: "Piplup", aliases: [] },
  { id: 448, ko: "루카리오", en: "Lucario", aliases: [] },
  { id: 470, ko: "리피아", en: "Leafeon", aliases: [] },
  { id: 471, ko: "글레이시아", en: "Glaceon", aliases: [] },
  { id: 700, ko: "님피아", en: "Sylveon", aliases: ["ninfia"] },
  { id: 778, ko: "따라큐", en: "Mimikyu", aliases: [] },
];

const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("scoreText");
const progressBar = document.getElementById("progressBar");
const pokemonImage = document.getElementById("pokemonImage");
const questionLabel = document.getElementById("questionLabel");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const submitButton = document.getElementById("submitButton");
const feedbackMessage = document.getElementById("feedbackMessage");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");
const answerReveal = document.getElementById("answerReveal");

let questions = [];
let currentIndex = 0;
let score = 0;
let isAnswered = false;

function shuffle(array) {
  const copied = [...array];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]];
  }

  return copied;
}

function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/['".\-\s]/g, "");
}

function getImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getAcceptedAnswers(pokemon) {
  return [pokemon.ko, pokemon.en, ...pokemon.aliases].map(normalizeAnswer);
}

function setFeedback(message, tone) {
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback ${tone}`;
}

function updateHeader() {
  progressText.textContent = `${currentIndex + 1} / ${GAME_LENGTH}`;
  scoreText.textContent = `${score}점`;
  progressBar.style.width = `${((currentIndex + 1) / GAME_LENGTH) * 100}%`;
  questionLabel.textContent = `문제 ${currentIndex + 1}`;
}

function renderQuestion() {
  const currentPokemon = questions[currentIndex];

  isAnswered = false;
  answerForm.reset();
  answerInput.disabled = false;
  submitButton.disabled = false;
  submitButton.textContent = "정답 확인";
  nextButton.classList.add("is-hidden");
  restartButton.classList.add("is-hidden");
  answerReveal.textContent = "???";
  setFeedback("이름을 입력하고 정답 확인을 눌러 주세요.", "neutral");
  updateHeader();

  pokemonImage.src = getImageUrl(currentPokemon.id);
  pokemonImage.alt = `문제 ${currentIndex + 1} 포켓몬 실루엣`;
  pokemonImage.classList.add("is-silhouette");

  requestAnimationFrame(() => {
    answerInput.focus();
  });
}

function finishGame() {
  answerInput.disabled = true;
  submitButton.disabled = true;
  nextButton.classList.add("is-hidden");
  restartButton.classList.remove("is-hidden");
  questionLabel.textContent = "게임 종료";
  progressText.textContent = `${GAME_LENGTH} / ${GAME_LENGTH}`;
  progressBar.style.width = "100%";

  const praise =
    score >= 27 ? "거의 포켓몬 도감 수준입니다." :
    score >= 20 ? "꽤 많이 알고 있습니다." :
    score >= 12 ? "감으로도 절반 가까이 맞혔습니다." :
    "다시 하면 더 잘 맞힐 수 있습니다.";

  setFeedback(`최종 점수는 ${score} / ${GAME_LENGTH}점입니다. ${praise}`, "neutral");
}

function revealAnswer(isCorrect, submittedAnswer) {
  const currentPokemon = questions[currentIndex];

  isAnswered = true;
  answerInput.disabled = true;
  submitButton.disabled = true;
  pokemonImage.classList.remove("is-silhouette");
  answerReveal.textContent = `${currentPokemon.ko} (${currentPokemon.en})`;

  if (isCorrect) {
    score += 1;
    scoreText.textContent = `${score}점`;
    setFeedback(`정답입니다. 입력한 "${submittedAnswer}"는 맞았습니다.`, "correct");
  } else {
    setFeedback(`오답입니다. 정답은 ${currentPokemon.ko} (${currentPokemon.en})입니다.`, "wrong");
  }

  if (currentIndex === GAME_LENGTH - 1) {
    finishGame();
    restartButton.classList.remove("is-hidden");
    return;
  }

  nextButton.classList.remove("is-hidden");
}

function startGame() {
  questions = shuffle(pokemonPool).slice(0, GAME_LENGTH);
  currentIndex = 0;
  score = 0;
  renderQuestion();
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isAnswered) {
    return;
  }

  const currentPokemon = questions[currentIndex];
  const submittedAnswer = answerInput.value.trim();
  const normalizedInput = normalizeAnswer(submittedAnswer);

  if (!normalizedInput) {
    setFeedback("이름을 먼저 입력해 주세요.", "wrong");
    return;
  }

  const isCorrect = getAcceptedAnswers(currentPokemon).includes(normalizedInput);
  revealAnswer(isCorrect, submittedAnswer);
});

nextButton.addEventListener("click", () => {
  currentIndex += 1;
  renderQuestion();
});

restartButton.addEventListener("click", () => {
  startGame();
});

startGame();
