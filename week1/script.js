const searchForm = document.getElementById("searchForm");
const pokemonIdInput = document.getElementById("pokemonId");
const resultCard = document.getElementById("resultCard");
const pokemonImage = document.getElementById("pokemonImage");
const pokemonNumber = document.getElementById("pokemonNumber");
const pokemonName = document.getElementById("pokemonName");
const pokemonTypes = document.getElementById("pokemonTypes");
const statusMessage = document.getElementById("statusMessage");

const typeNames = {
  normal: "노말",
  fire: "불꽃",
  water: "물",
  electric: "전기",
  grass: "풀",
  ice: "얼음",
  fighting: "격투",
  poison: "독",
  ground: "땅",
  flying: "비행",
  psychic: "에스퍼",
  bug: "벌레",
  rock: "바위",
  ghost: "고스트",
  dragon: "드래곤",
  dark: "악",
  steel: "강철",
  fairy: "페어리",
};

const typeColors = {
  normal: "#9ca3af",
  fire: "#f97316",
  water: "#3b82f6",
  electric: "#facc15",
  grass: "#22c55e",
  ice: "#38bdf8",
  fighting: "#b91c1c",
  poison: "#9333ea",
  ground: "#b45309",
  flying: "#6366f1",
  psychic: "#ec4899",
  bug: "#65a30d",
  rock: "#78716c",
  ghost: "#6d28d9",
  dragon: "#4f46e5",
  dark: "#374151",
  steel: "#64748b",
  fairy: "#f472b6",
};

function formatPokemonNumber(id) {
  return `No. ${String(id).padStart(4, "0")}`;
}

function getKoreanPokemonName(speciesNames, fallbackName) {
  const koreanName = speciesNames.find((entry) => entry.language.name === "ko");
  return koreanName ? koreanName.name : fallbackName;
}

function renderTypes(types) {
  pokemonTypes.innerHTML = "";

  types
    .sort((a, b) => a.slot - b.slot)
    .forEach((typeInfo) => {
      const typeKey = typeInfo.type.name;
      const badge = document.createElement("span");
      badge.className = "type-badge";
      badge.textContent = typeNames[typeKey] ?? typeKey;
      badge.style.backgroundColor = typeColors[typeKey] ?? "#475569";
      pokemonTypes.appendChild(badge);
    });
}

async function fetchPokemonById(id) {
  const [pokemonResponse, speciesResponse] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  if (!pokemonResponse.ok || !speciesResponse.ok) {
    throw new Error("포켓몬을 찾을 수 없습니다.");
  }

  const [pokemonData, speciesData] = await Promise.all([
    pokemonResponse.json(),
    speciesResponse.json(),
  ]);

  return {
    id: pokemonData.id,
    name: getKoreanPokemonName(speciesData.names, pokemonData.name),
    types: pokemonData.types,
    image:
      pokemonData.sprites.other["official-artwork"].front_default ??
      pokemonData.sprites.front_default,
  };
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = Number(pokemonIdInput.value);

  if (!Number.isInteger(id) || id < 1 || id > 1025) {
    resultCard.classList.add("is-hidden");
    statusMessage.textContent = "1부터 1025 사이의 도감 번호를 입력해 주세요.";
    return;
  }

  statusMessage.textContent = "포켓몬 정보를 불러오는 중입니다...";
  resultCard.classList.add("is-hidden");

  try {
    const pokemon = await fetchPokemonById(id);

    pokemonImage.src = pokemon.image ?? "";
    pokemonImage.alt = pokemon.image ? `${pokemon.name} 이미지` : "이미지 없음";
    pokemonNumber.textContent = formatPokemonNumber(pokemon.id);
    pokemonName.textContent = pokemon.name;
    renderTypes(pokemon.types);

    resultCard.classList.remove("is-hidden");
    statusMessage.textContent = "검색이 완료되었습니다.";
  } catch (error) {
    resultCard.classList.add("is-hidden");
    statusMessage.textContent = error.message;
  }
});
