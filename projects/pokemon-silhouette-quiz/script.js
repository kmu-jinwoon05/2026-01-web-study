const NORMAL_GAME_LENGTH = 30;
const RANKING_GAME_LENGTH = 100;
const POKEMON_API_URL = "/api/pokemon";
const COMMENTS_API_URL = "/api/messages";
const RANKINGS_API_URL = "/api/rankings";

const MODES = {
  normal: {
    id: "normal",
    label: "일반 게임",
    length: NORMAL_GAME_LENGTH,
  },
  ranking: {
    id: "ranking",
    label: "랭킹 게임",
    length: RANKING_GAME_LENGTH,
  },
};

const ui = {
  startPanel: document.getElementById("startPanel"),
  gamePanel: document.getElementById("gamePanel"),
  normalModeButton: document.getElementById("normalModeButton"),
  rankingModeButton: document.getElementById("rankingModeButton"),
  rankingEntryForm: document.getElementById("rankingEntryForm"),
  rankingNicknameInput: document.getElementById("rankingNicknameInput"),
  rankingStartButton: document.getElementById("rankingStartButton"),
  startFeedbackMessage: document.getElementById("startFeedbackMessage"),
  rankingList: document.getElementById("rankingList"),
  rankingCountText: document.getElementById("rankingCountText"),
  refreshRankingsButton: document.getElementById("refreshRankingsButton"),
  progressText: document.getElementById("progressText"),
  scoreText: document.getElementById("scoreText"),
  modeText: document.getElementById("modeText"),
  modeHintText: document.getElementById("modeHintText"),
  progressBar: document.getElementById("progressBar"),
  pokemonImage: document.getElementById("pokemonImage"),
  questionLabel: document.getElementById("questionLabel"),
  answerForm: document.getElementById("answerForm"),
  answerInput: document.getElementById("answerInput"),
  submitButton: document.getElementById("submitButton"),
  feedbackMessage: document.getElementById("feedbackMessage"),
  nextButton: document.getElementById("nextButton"),
  restartButton: document.getElementById("restartButton"),
  answerReveal: document.getElementById("answerReveal"),
  commentForm: document.getElementById("commentForm"),
  nicknameInput: document.getElementById("nicknameInput"),
  commentInput: document.getElementById("commentInput"),
  commentSubmitButton: document.getElementById("commentSubmitButton"),
  commentFeedbackMessage: document.getElementById("commentFeedbackMessage"),
  commentList: document.getElementById("commentList"),
  commentCountText: document.getElementById("commentCountText"),
  refreshCommentsButton: document.getElementById("refreshCommentsButton"),
};

let pokemonPool = [];
let questions = [];
let currentIndex = 0;
let score = 0;
let isAnswered = false;
let currentMode = null;
let rankingNickname = "";

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

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function getImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getAcceptedAnswers(pokemon) {
  return [pokemon.ko, pokemon.en, ...pokemon.aliases].map(normalizeAnswer);
}

function setFeedback(message, tone) {
  ui.feedbackMessage.textContent = message;
  ui.feedbackMessage.className = `feedback ${tone}`;
}

function setStartFeedback(message, tone) {
  ui.startFeedbackMessage.textContent = message;
  ui.startFeedbackMessage.className = `feedback ${tone}`;
}

function setCommentFeedback(message, tone) {
  ui.commentFeedbackMessage.textContent = message;
  ui.commentFeedbackMessage.className = `feedback ${tone}`;
}

function setQuizLoadingState(isLoading) {
  ui.answerInput.disabled = isLoading;
  ui.submitButton.disabled = isLoading;
  ui.nextButton.disabled = isLoading;
  ui.restartButton.disabled = isLoading;
}

function setCommentLoadingState(isLoading) {
  ui.nicknameInput.disabled = isLoading;
  ui.commentInput.disabled = isLoading;
  ui.commentSubmitButton.disabled = isLoading;
  ui.refreshCommentsButton.disabled = isLoading;
}

function setRankingLoadingState(isLoading) {
  ui.normalModeButton.disabled = isLoading;
  ui.rankingModeButton.disabled = isLoading;
  ui.rankingNicknameInput.disabled = isLoading;
  ui.rankingStartButton.disabled = isLoading;
  ui.refreshRankingsButton.disabled = isLoading;
}

function getGameLength() {
  return currentMode ? currentMode.length : NORMAL_GAME_LENGTH;
}

function showStartPanel() {
  ui.startPanel.classList.remove("is-hidden");
  ui.gamePanel.classList.add("is-hidden");
}

function showGamePanel() {
  ui.startPanel.classList.add("is-hidden");
  ui.gamePanel.classList.remove("is-hidden");
}

function updateHeader() {
  ui.progressText.textContent = `${currentIndex + 1} / ${getGameLength()}`;
  ui.scoreText.textContent = `${score}점`;
  ui.modeText.textContent = currentMode.label;
  ui.progressBar.style.width = `${((currentIndex + 1) / getGameLength()) * 100}%`;
  ui.questionLabel.textContent = `문제 ${currentIndex + 1}`;
}

function renderQuestion() {
  const currentPokemon = questions[currentIndex];

  isAnswered = false;
  ui.answerForm.reset();
  ui.answerInput.disabled = false;
  ui.submitButton.disabled = false;
  ui.submitButton.textContent = "정답 확인";
  ui.nextButton.classList.add("is-hidden");
  ui.restartButton.classList.add("is-hidden");
  ui.answerReveal.textContent = "???";
  ui.modeHintText.textContent = currentMode.id === "ranking"
    ? `${rankingNickname} 님의 랭킹 게임입니다. 띄어쓰기 없이 입력해도 판정됩니다.`
    : "띄어쓰기 없이 입력해도 판정됩니다.";
  setFeedback("이름을 입력하고 정답 확인을 눌러 주세요.", "neutral");
  updateHeader();

  ui.pokemonImage.src = getImageUrl(currentPokemon.id);
  ui.pokemonImage.alt = `문제 ${currentIndex + 1} 포켓몬 실루엣`;
  ui.pokemonImage.classList.add("is-silhouette");

  requestAnimationFrame(() => {
    ui.answerInput.focus();
  });
}

async function finishGame() {
  ui.answerInput.disabled = true;
  ui.submitButton.disabled = true;
  ui.nextButton.classList.add("is-hidden");
  ui.restartButton.classList.remove("is-hidden");
  ui.restartButton.textContent = "처음으로";
  ui.questionLabel.textContent = "게임 종료";
  ui.progressText.textContent = `${getGameLength()} / ${getGameLength()}`;
  ui.progressBar.style.width = "100%";

  const praise =
    score >= Math.floor(getGameLength() * 0.9) ? "정말 대단합니다." :
    score >= Math.floor(getGameLength() * 0.7) ? "아주 잘하고 있습니다." :
    score >= Math.floor(getGameLength() * 0.4) ? "꽤 많이 맞혔습니다." :
    "다시 도전하면 더 잘할 수 있습니다.";

  if (currentMode.id === "ranking") {
    try {
      await saveRankingScore();
      await loadRankings();
      setFeedback(`랭킹 게임 종료. ${rankingNickname} 님의 점수 ${score} / ${getGameLength()}점을 저장했습니다. ${praise}`, "correct");
    } catch (error) {
      console.error(error);
      setFeedback(`랭킹 점수 저장에 실패했습니다.\n${error.message}`, "wrong");
    }
    return;
  }

  setFeedback(`최종 점수는 ${score} / ${getGameLength()}점입니다. ${praise}`, "neutral");
}

function revealAnswer(isCorrect, submittedAnswer) {
  const currentPokemon = questions[currentIndex];

  isAnswered = true;
  ui.answerInput.disabled = true;
  ui.submitButton.disabled = true;
  ui.pokemonImage.classList.remove("is-silhouette");
  ui.answerReveal.textContent = `${currentPokemon.ko} (${currentPokemon.en})`;

  if (isCorrect) {
    score += 1;
    ui.scoreText.textContent = `${score}점`;
    setFeedback(`정답입니다. 입력한 "${submittedAnswer}"는 맞았습니다.`, "correct");
  } else {
    setFeedback(`오답입니다. 정답은 ${currentPokemon.ko} (${currentPokemon.en})입니다.`, "wrong");
  }

  if (currentIndex === getGameLength() - 1) {
    finishGame();
    return;
  }

  ui.nextButton.classList.remove("is-hidden");
}

function sanitizePokemonRow(row) {
  return {
    id: Number(row.pokemon_id),
    ko: row.name_ko,
    en: row.name_en,
    aliases: Array.isArray(row.aliases) ? row.aliases : [],
  };
}

async function readJsonError(response, fallbackMessage) {
  const error = await response.json().catch(() => null);
  const details = error?.details ? `\n${error.details}` : "";
  return error?.message ? `${error.message}${details}` : fallbackMessage;
}

async function loadPokemonPool() {
  const response = await fetch(POKEMON_API_URL);

  if (!response.ok) {
    const message = await readJsonError(response, `API request failed with status ${response.status}`);
    throw new Error(message);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("API response is not an array");
  }

  pokemonPool = data.map(sanitizePokemonRow).filter((pokemon) => {
    return pokemon.id && pokemon.ko && pokemon.en;
  });
}

function prepareQuestions() {
  if (pokemonPool.length < getGameLength()) {
    throw new Error(`${currentMode.label}에는 최소 ${getGameLength()}마리의 포켓몬 데이터가 필요합니다.`);
  }

  questions = shuffle(pokemonPool).slice(0, getGameLength());
  currentIndex = 0;
  score = 0;
}

async function startGame(modeId) {
  currentMode = MODES[modeId];
  showGamePanel();
  setQuizLoadingState(true);
  setFeedback("문제 데이터를 불러오는 중입니다.", "neutral");
  ui.answerReveal.textContent = "로딩 중...";
  ui.questionLabel.textContent = "준비 중";

  try {
    if (pokemonPool.length === 0) {
      await loadPokemonPool();
    }

    prepareQuestions();
    renderQuestion();
  } catch (error) {
    console.error(error);
    setFeedback(`문제 데이터를 불러오지 못했습니다.\n${error.message}`, "wrong");
    ui.answerReveal.textContent = "데이터 오류";
    ui.questionLabel.textContent = "불러오기 실패";
    ui.restartButton.classList.remove("is-hidden");
    ui.restartButton.textContent = "처음으로";
  } finally {
    setQuizLoadingState(false);
  }
}

function resetToStartScreen() {
  currentMode = null;
  rankingNickname = "";
  questions = [];
  currentIndex = 0;
  score = 0;
  isAnswered = false;
  ui.rankingEntryForm.classList.add("is-hidden");
  ui.rankingEntryForm.reset();
  showStartPanel();
  setStartFeedback("원하는 모드를 선택해 게임을 시작하세요.", "neutral");
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "방금 전";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderRankings(rankings) {
  ui.rankingCountText.textContent = `${rankings.length}명`;

  if (rankings.length === 0) {
    ui.rankingList.innerHTML = '<li class="ranking-empty">아직 저장된 랭킹이 없습니다.</li>';
    return;
  }

  ui.rankingList.innerHTML = rankings.map((ranking, index) => {
    return `
      <li class="ranking-item">
        <div class="ranking-left">
          <span class="ranking-rank">#${index + 1}</span>
          <span class="ranking-name">${escapeHtml(ranking.nickname)}</span>
        </div>
        <div class="ranking-right">
          <span class="ranking-meta">${ranking.score}점 / 100문제 · ${formatDate(ranking.created_at)}</span>
        </div>
      </li>
    `;
  }).join("");
}

async function loadRankings() {
  setRankingLoadingState(true);
  ui.rankingList.innerHTML = '<li class="ranking-empty">랭킹을 불러오는 중입니다.</li>';

  try {
    const response = await fetch(RANKINGS_API_URL);

    if (!response.ok) {
      const message = await readJsonError(response, `Rankings request failed with status ${response.status}`);
      throw new Error(message);
    }

    const rankings = await response.json();

    if (!Array.isArray(rankings)) {
      throw new Error("Rankings response is not an array");
    }

    renderRankings(rankings);
    setStartFeedback("원하는 모드를 선택해 게임을 시작하세요.", "neutral");
  } catch (error) {
    console.error(error);
    ui.rankingCountText.textContent = "0명";
    ui.rankingList.innerHTML = '<li class="ranking-empty">랭킹을 불러오지 못했습니다.</li>';
    setStartFeedback(`랭킹을 불러오지 못했습니다.\n${error.message}`, "wrong");
  } finally {
    setRankingLoadingState(false);
  }
}

async function saveRankingScore() {
  const response = await fetch(RANKINGS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nickname: rankingNickname,
      score,
      total_questions: getGameLength(),
    }),
  });

  if (!response.ok) {
    const message = await readJsonError(response, "Failed to save ranking");
    throw new Error(message);
  }

  await response.json().catch(() => null);
}

function renderComments(comments) {
  ui.commentCountText.textContent = `${comments.length}개`;

  if (comments.length === 0) {
    ui.commentList.innerHTML = '<li class="comment-empty">아직 저장된 댓글이 없습니다.</li>';
    return;
  }

  ui.commentList.innerHTML = comments.map((comment) => {
    const nickname = escapeHtml(comment.nickname || "익명");
    const message = escapeHtml(comment.message || "");
    const createdAt = formatDate(comment.created_at);

    return `
      <li class="comment-item">
        <div class="comment-item-header">
          <p class="comment-author">${nickname}</p>
          <p class="comment-date">${createdAt}</p>
        </div>
        <p class="comment-body">${message}</p>
      </li>
    `;
  }).join("");
}

async function loadComments() {
  setCommentLoadingState(true);
  ui.commentList.innerHTML = '<li class="comment-empty">댓글을 불러오는 중입니다.</li>';

  try {
    const response = await fetch(COMMENTS_API_URL);

    if (!response.ok) {
      const message = await readJsonError(response, `Comments request failed with status ${response.status}`);
      throw new Error(message);
    }

    const comments = await response.json();

    if (!Array.isArray(comments)) {
      throw new Error("Comments response is not an array");
    }

    renderComments(comments);
    setCommentFeedback("댓글 목록을 불러왔습니다.", "neutral");
  } catch (error) {
    console.error(error);
    ui.commentCountText.textContent = "0개";
    ui.commentList.innerHTML = '<li class="comment-empty">댓글을 불러오지 못했습니다.</li>';
    setCommentFeedback(`댓글 목록을 불러오지 못했습니다.\n${error.message}`, "wrong");
  } finally {
    setCommentLoadingState(false);
  }
}

async function submitComment(event) {
  event.preventDefault();

  const nickname = ui.nicknameInput.value.trim();
  const message = ui.commentInput.value.trim();

  if (!nickname || !message) {
    setCommentFeedback("닉네임과 댓글을 모두 입력해 주세요.", "wrong");
    return;
  }

  setCommentLoadingState(true);
  setCommentFeedback("댓글을 저장하는 중입니다.", "neutral");

  try {
    const response = await fetch(COMMENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname,
        message,
      }),
    });

    if (!response.ok) {
      const messageText = await readJsonError(response, "Failed to save comment");
      throw new Error(messageText);
    }

    await response.json().catch(() => null);
    ui.commentForm.reset();
    setCommentFeedback("댓글이 저장되었습니다. 페이지를 닫았다가 다시 열어도 남아 있는지 확인해 보세요.", "correct");
    await loadComments();
  } catch (error) {
    console.error(error);
    setCommentFeedback(`댓글 저장에 실패했습니다.\n${error.message}`, "wrong");
  } finally {
    setCommentLoadingState(false);
  }
}

ui.answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isAnswered || questions.length === 0) {
    return;
  }

  const currentPokemon = questions[currentIndex];
  const submittedAnswer = ui.answerInput.value.trim();
  const normalizedInput = normalizeAnswer(submittedAnswer);

  if (!normalizedInput) {
    setFeedback("이름을 먼저 입력해 주세요.", "wrong");
    return;
  }

  const isCorrect = getAcceptedAnswers(currentPokemon).includes(normalizedInput);
  revealAnswer(isCorrect, submittedAnswer);
});

ui.nextButton.addEventListener("click", () => {
  currentIndex += 1;
  renderQuestion();
});

ui.restartButton.addEventListener("click", () => {
  resetToStartScreen();
});

ui.normalModeButton.addEventListener("click", () => {
  rankingNickname = "";
  ui.rankingEntryForm.classList.add("is-hidden");
  setStartFeedback("일반 게임을 시작합니다.", "neutral");
  startGame("normal");
});

ui.rankingModeButton.addEventListener("click", () => {
  ui.rankingEntryForm.classList.remove("is-hidden");
  ui.rankingNicknameInput.focus();
  setStartFeedback("랭킹 게임에 사용할 닉네임을 입력해 주세요.", "neutral");
});

ui.rankingEntryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nickname = ui.rankingNicknameInput.value.trim();

  if (!nickname) {
    setStartFeedback("랭킹 닉네임을 입력해 주세요.", "wrong");
    return;
  }

  rankingNickname = nickname;
  setStartFeedback(`${rankingNickname} 님의 랭킹 게임을 시작합니다.`, "neutral");
  startGame("ranking");
});

ui.refreshRankingsButton.addEventListener("click", loadRankings);
ui.commentForm.addEventListener("submit", submitComment);
ui.refreshCommentsButton.addEventListener("click", loadComments);

resetToStartScreen();
loadRankings();
loadComments();
