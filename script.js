const inputBusca = document.getElementById('input-busca');
const listaSugestoes = document.getElementById('lista-sugestoes');
const btnBuscar = document.getElementById('btn-buscar');
const btnAleatorio = document.getElementById('btn-aleatorio');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');
const btnShiny = document.getElementById('btn-shiny');
const btnSom = document.getElementById('btn-som');
const btnFavoritar = document.getElementById('btn-favoritar');
const favoritosSecao = document.getElementById('favoritos-secao');
const listaFavoritos = document.getElementById('lista-favoritos');
const pokeFoto = document.getElementById('poke-foto');
const statusMsg = document.getElementById('mensagem-status');
const cardPokemon = document.getElementById('card-pokemon');

const TOTAL_POKEMON = 1025;
const STORAGE_KEY = 'pokedex_favoritos';

let catalogoPokemon = [];
let sugestoesAtuais = [];
let indiceSugestaoSelecionada = -1;
let idEspecieAtual = null;
let pokemonAtual = null;
let spriteNormalAtual = '';
let spriteShinyAtual = '';
let exibindoShiny = false;
let audioAtual = null;
let favoritos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const mapaStats = {
  'hp': 'HP',
  'attack': 'Ataque',
  'defense': 'Defesa',
  'special-attack': 'Ataque Especial',
  'special-defense': 'Defesa Especial',
  'speed': 'Velocidade'
};

function salvarFavoritos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
}

function renderizarFavoritos() {
  listaFavoritos.innerHTML = '';

  if (favoritos.length === 0) {
    favoritosSecao.classList.add('oculto');
    return;
  }

  favoritos.forEach(fav => {
    const item = document.createElement('div');
    item.className = 'fav-item';
    item.innerHTML = `
      <img src="${fav.imagem}" alt="${fav.nome}">
      <span>${fav.nome.replace(/-/g, ' ')}</span>
    `;
    item.addEventListener('click', () => {
      inputBusca.value = '';
      buscarPokemon(fav.nome);
    });
    listaFavoritos.appendChild(item);
  });

  favoritosSecao.classList.remove('oculto');
}

function atualizarBotaoFavorito() {
  if (!pokemonAtual) return;
  const jaFavoritado = favoritos.some(f => f.nome === pokemonAtual.name);
  btnFavoritar.classList.toggle('favoritado', jaFavoritado);
  btnFavoritar.textContent = jaFavoritado ? '★ Favorito' : '☆ Favoritar';
}

btnFavoritar.addEventListener('click', () => {
  if (!pokemonAtual) return;
  const indice = favoritos.findIndex(f => f.nome === pokemonAtual.name);

  if (indice >= 0) {
    favoritos.splice(indice, 1);
  } else {
    favoritos.push({
      id: pokemonAtual.id,
      nome: pokemonAtual.name,
      imagem: pokemonAtual.sprites.front_default || spriteNormalAtual
    });
  }

  salvarFavoritos();
  atualizarBotaoFavorito();
  renderizarFavoritos();
});

renderizarFavoritos();

async function carregarCatalogo() {
  try {
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`);
    const dados = await resposta.json();
    catalogoPokemon = dados.results.map((poke, index) => ({
      id: String(index + 1),
      nome: poke.name
    }));
  } catch (erro) {
    console.error(erro);
  }
}

carregarCatalogo();

function atualizarSelecaoSugestao() {
  const itens = listaSugestoes.querySelectorAll('li');
  itens.forEach((item, index) => {
    const ativo = index === indiceSugestaoSelecionada;
    item.classList.toggle('selecionado', ativo);
    if (ativo) {
      item.scrollIntoView({ block: 'nearest' });
    }
  });
}

inputBusca.addEventListener('input', () => {
  const termo = inputBusca.value.trim().toLowerCase();
  listaSugestoes.innerHTML = '';
  sugestoesAtuais = [];
  indiceSugestaoSelecionada = -1;

  if (!termo || catalogoPokemon.length === 0) {
    listaSugestoes.classList.add('oculto');
    return;
  }

  sugestoesAtuais = catalogoPokemon
    .filter(p => p.nome.includes(termo) || p.id.startsWith(termo))
    .slice(0, 8);

  if (sugestoesAtuais.length === 0) {
    listaSugestoes.classList.add('oculto');
    return;
  }

  sugestoesAtuais.forEach((poke, index) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png" alt="${poke.nome}">
      <span>${poke.nome}</span>
      <span class="sugestao-id">#${poke.id.padStart(4, '0')}</span>
    `;
    item.addEventListener('mouseenter', () => {
      indiceSugestaoSelecionada = index;
      atualizarSelecaoSugestao();
    });
    item.addEventListener('click', () => {
      inputBusca.value = poke.nome;
      listaSugestoes.classList.add('oculto');
      buscarPokemon(poke.id);
    });
    listaSugestoes.appendChild(item);
  });

  listaSugestoes.classList.remove('oculto');
});

inputBusca.addEventListener('keydown', (e) => {
  const listaVisivel = !listaSugestoes.classList.contains('oculto') && sugestoesAtuais.length > 0;

  if (e.key === 'ArrowDown' && listaVisivel) {
    e.preventDefault();
    indiceSugestaoSelecionada = (indiceSugestaoSelecionada + 1) % sugestoesAtuais.length;
    atualizarSelecaoSugestao();
  } else if (e.key === 'ArrowUp' && listaVisivel) {
    e.preventDefault();
    indiceSugestaoSelecionada = (indiceSugestaoSelecionada - 1 + sugestoesAtuais.length) % sugestoesAtuais.length;
    atualizarSelecaoSugestao();
  } else if (e.key === 'Escape') {
    listaSugestoes.classList.add('oculto');
    indiceSugestaoSelecionada = -1;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (listaVisivel && indiceSugestaoSelecionada >= 0) {
      const escolhido = sugestoesAtuais[indiceSugestaoSelecionada];
      inputBusca.value = escolhido.nome;
      listaSugestoes.classList.add('oculto');
      indiceSugestaoSelecionada = -1;
      buscarPokemon(escolhido.id);
    } else {
      btnBuscar.click();
    }
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.busca-wrapper')) {
    listaSugestoes.classList.add('oculto');
    indiceSugestaoSelecionada = -1;
  }
});

btnBuscar.addEventListener('click', () => {
  const termo = inputBusca.value.trim().toLowerCase();
  listaSugestoes.classList.add('oculto');
  indiceSugestaoSelecionada = -1;
  if (termo) buscarPokemon(termo);
});

btnAleatorio.addEventListener('click', () => {
  const idAleatorio = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  inputBusca.value = '';
  listaSugestoes.classList.add('oculto');
  indiceSugestaoSelecionada = -1;
  buscarPokemon(idAleatorio);
});

btnAnterior.addEventListener('click', () => {
  if (idEspecieAtual && idEspecieAtual > 1) {
    inputBusca.value = '';
    buscarPokemon(idEspecieAtual - 1);
  }
});

btnProximo.addEventListener('click', () => {
  if (idEspecieAtual && idEspecieAtual < TOTAL_POKEMON) {
    inputBusca.value = '';
    buscarPokemon(idEspecieAtual + 1);
  }
});

btnShiny.addEventListener('click', () => {
  if (!spriteShinyAtual) return;
  exibindoShiny = !exibindoShiny;
  pokeFoto.src = exibindoShiny ? spriteShinyAtual : spriteNormalAtual;
  btnShiny.classList.toggle('ativo', exibindoShiny);
});

btnSom.addEventListener('click', () => {
  if (!audioAtual) return;
  audioAtual.currentTime = 0;
  btnSom.classList.add('tocando');
  audioAtual.play().catch(() => btnSom.classList.remove('tocando'));
  audioAtual.onended = () => btnSom.classList.remove('tocando');
});

async function buscarPokemon(identificador) {
  statusMsg.textContent = 'Carregando...';
  cardPokemon.classList.add('oculto');

  if (audioAtual) {
    audioAtual.pause();
    btnSom.classList.remove('tocando');
  }

  try {
    const respostaPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${identificador}`);
    if (!respostaPoke.ok) throw new Error('Pokémon não encontrado.');
    const dadosPoke = await respostaPoke.json();

    const respostaEspecie = await fetch(dadosPoke.species.url);
    const dadosEspecie = await respostaEspecie.json();

    const respostaEvolucao = await fetch(dadosEspecie.evolution_chain.url);
    const dadosEvolucao = await respostaEvolucao.json();

    const listaEvolucoes = extrairEvolucoes(dadosEvolucao.chain);

    renderizarPokemon(dadosPoke, listaEvolucoes, dadosEspecie);
    statusMsg.textContent = '';
  } catch (erro) {
    statusMsg.textContent = erro.message;
  }
}

function extrairEvolucoes(noAtual) {
  let evolucoes = [];

  const urlPartes = noAtual.species.url.split('/').filter(Boolean);
  const id = urlPartes[urlPartes.length - 1];

  evolucoes.push({
    nome: noAtual.species.name,
    id: id,
    imagem: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  });

  if (noAtual.evolves_to.length > 0) {
    noAtual.evolves_to.forEach(proximaEvo => {
      evolucoes = evolucoes.concat(extrairEvolucoes(proximaEvo));
    });
  }

  return evolucoes;
}

function formatarNomeVariacao(nomeVariacao, nomeEspecie) {
  if (nomeVariacao === nomeEspecie) return 'Padrão';
  const sufixo = nomeVariacao.replace(`${nomeEspecie}-`, '');
  return sufixo.replace(/-/g, ' ');
}

function obterDescricaoPokedex(especie) {
  if (!especie.flavor_text_entries || especie.flavor_text_entries.length === 0) {
    return 'Descrição não disponível para este Pokémon.';
  }

  const entradaPt = especie.flavor_text_entries.find(e => e.language.name === 'pt' || e.language.name === 'pt-BR');
  const entradaEn = [...especie.flavor_text_entries].reverse().find(e => e.language.name === 'en');
  const escolhida = entradaPt || entradaEn || especie.flavor_text_entries[0];

  return escolhida.flavor_text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

function obterCorStat(valor) {
  if (valor < 60) return '#ff5959';
  if (valor < 90) return '#ffdd57';
  if (valor < 120) return '#48c774';
  return '#3273dc';
}

function renderizarPokemon(pokemon, evolucoes, especie) {
  pokemonAtual = pokemon;
  idEspecieAtual = especie.id;
  btnAnterior.disabled = idEspecieAtual <= 1;
  btnProximo.disabled = idEspecieAtual >= TOTAL_POKEMON;

  const containerVariacoes = document.getElementById('poke-variacoes');
  containerVariacoes.innerHTML = '';

  if (especie.varieties && especie.varieties.length > 1) {
    especie.varieties.forEach(v => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-variacao';
      if (v.pokemon.name === pokemon.name) btn.classList.add('ativa');
      btn.textContent = formatarNomeVariacao(v.pokemon.name, especie.name);
      btn.addEventListener('click', () => {
        if (v.pokemon.name !== pokemon.name) {
          buscarPokemon(v.pokemon.name);
        }
      });
      containerVariacoes.appendChild(btn);
    });
    containerVariacoes.classList.remove('oculto');
  } else {
    containerVariacoes.classList.add('oculto');
  }

  document.getElementById('poke-nome').textContent = pokemon.name.replace(/-/g, ' ').toUpperCase();
  document.getElementById('poke-id').textContent = `#${String(especie.id).padStart(4, '0')}`;

  spriteNormalAtual = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  spriteShinyAtual = pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny;
  exibindoShiny = false;

  pokeFoto.src = spriteNormalAtual;
  btnShiny.classList.remove('ativo');
  btnShiny.classList.toggle('oculto', !spriteShinyAtual);

  const urlSom = pokemon.cries && (pokemon.cries.latest || pokemon.cries.legacy);
  if (urlSom) {
    audioAtual = new Audio(urlSom);
    audioAtual.volume = 0.4;
    btnSom.classList.remove('oculto');
  } else {
    audioAtual = null;
    btnSom.classList.add('oculto');
  }

  atualizarBotaoFavorito();

  const containerTipos = document.getElementById('poke-tipos');
  containerTipos.innerHTML = pokemon.types
    .map(t => `<span class="tipo-${t.type.name}">${t.type.name}</span>`)
    .join('');

  document.getElementById('poke-descricao').textContent = obterDescricaoPokedex(especie);

  document.getElementById('poke-altura').textContent = pokemon.height * 10;
  document.getElementById('poke-peso').textContent = (pokemon.weight / 10).toFixed(1);

  const listaHabilidades = document.getElementById('poke-habilidades');
  listaHabilidades.innerHTML = pokemon.abilities
    .map(a => `<li>${a.ability.name.replace(/-/g, ' ')}${a.is_hidden ? ' (Oculta)' : ''}</li>`)
    .join('');

  const containerStats = document.getElementById('poke-stats');
  const valorMaximo = 255;

  containerStats.innerHTML = pokemon.stats
    .map(s => {
      const nome = mapaStats[s.stat.name] || s.stat.name;
      const valor = s.base_stat;
      const porcentagem = Math.min((valor / valorMaximo) * 100, 100).toFixed(1);
      const cor = obterCorStat(valor);

      return `
        <div class="stat-linha">
          <span class="stat-nome">${nome}</span>
          <span class="stat-valor">${valor}</span>
          <div class="barra-fundo">
            <div class="barra-preenchimento" style="width: ${porcentagem}%; background-color: ${cor};"></div>
          </div>
        </div>
      `;
    })
    .join('');

  const containerEvolucoes = document.getElementById('poke-evolucoes');
  containerEvolucoes.innerHTML = evolucoes
    .map(evo => `
      <div class="evo-item" onclick="buscarPokemon(${evo.id})">
        <img src="${evo.imagem}" alt="${evo.nome}" width="72" height="72">
        <p>${evo.nome}</p>
      </div>
    `)
    .join('');

  cardPokemon.classList.remove('oculto');
}