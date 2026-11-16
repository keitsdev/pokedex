const inputBusca = document.getElementById('input-busca');
const listaSugestoes = document.getElementById('lista-sugestoes');
const btnBuscar = document.getElementById('btn-buscar');
const btnAleatorio = document.getElementById('btn-aleatorio');
const btnAnterior = document.getElementById('btn-anterior');
const btnProximo = document.getElementById('btn-proximo');
const btnShiny = document.getElementById('btn-shiny');
const btnSom = document.getElementById('btn-som');
const btnFavoritar = document.getElementById('btn-favoritar');
const pokedex = document.getElementById('pokedex');
const btnAbrir = document.getElementById('btn-abrir');
const btnFechar = document.getElementById('btn-fechar');
const deviceOpen = document.getElementById('device-open');
const abaPokemon = document.getElementById('aba-pokemon');
const abaFiltros = document.getElementById('aba-filtros');
const abaFavoritos = document.getElementById('aba-favoritos');
const abaComparacao = document.getElementById('aba-comparacao');
const viewPokemon = document.getElementById('view-pokemon');
const viewFiltros = document.getElementById('view-filtros');
const viewFavoritos = document.getElementById('view-favoritos');
const viewComparacao = document.getElementById('view-comparacao');
const contadorFavoritos = document.getElementById('contador-favoritos');
const favoritosVazio = document.getElementById('favoritos-vazio');
const formComparacao = document.getElementById('form-comparacao');
const inputComparacaoA = document.getElementById('comparar-pokemon-a');
const inputComparacaoB = document.getElementById('comparar-pokemon-b');
const btnComparar = document.getElementById('btn-comparar');
const resultadoComparacao = document.getElementById('resultado-comparacao');
const mensagemComparacao = document.getElementById('mensagem-comparacao');
const comparacaoVazia = document.getElementById('comparacao-vazia');
const btnTema = document.getElementById('btn-tema');
const iconeTema = document.getElementById('icone-tema');
const rotuloTema = document.getElementById('rotulo-tema');
const filtroOrdenacao = document.getElementById('filtro-ordenacao');
const filtroTipo = document.getElementById('filtro-tipo');
const listaFiltrada = document.getElementById('lista-filtrada');
const statusFiltro = document.getElementById('status-filtro');
const botaoMaisPokemon = document.getElementById('botao-mais-pokemon');
const estadoInicial = document.getElementById('estado-inicial');
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
let resultadosFiltro = [];
let limiteFiltro = 0;
let solicitacaoFiltro = 0;
const cacheTipos = new Map();
const tamanhoPaginaFiltro = 48;
const preferenciasCor = window.matchMedia('(prefers-color-scheme: dark)');
let temaManual = localStorage.getItem('pokedex_tema');
if (temaManual !== 'escuro' && temaManual !== 'claro') temaManual = null;
let temaEscuro = temaManual ? temaManual === 'escuro' : preferenciasCor.matches;

const mapaStats = {
  'hp': 'HP',
  'attack': 'Ataque',
  'defense': 'Defesa',
  'special-attack': 'Ataque Especial',
  'special-defense': 'Defesa Especial',
  'speed': 'Velocidade'
};

const mapaTipos = {
  normal: { nome: 'Normal', simbolo: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="3"/>' },
  fighting: { nome: 'Lutador', simbolo: '<path d="M7 11V7a2 2 0 0 1 4 0v3-5a2 2 0 0 1 4 0v5-3a2 2 0 0 1 4 0v7c0 4-3 7-7 7h-1c-2 0-3-1-4-3l-3-4a2 2 0 0 1 3-3l2 2"/>' },
  flying: { nome: 'Voador', simbolo: '<path d="M3 18c7-1 10-7 18-13-1 9-6 15-15 15l4-5-7 3Z"/><path d="M5 20c4-5 7-7 12-10" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  poison: { nome: 'Venenoso', simbolo: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="8" r="2"/><circle cx="13" cy="16" r="5"/><circle cx="5" cy="16" r="1"/>' },
  ground: { nome: 'Terrestre', simbolo: '<path d="M3 18 9 8l3 5 3-8 6 13H3Z"/><path d="M8 18h8" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  rock: { nome: 'Pedra', simbolo: '<path d="m4 18 2-9 5-5 6 2 3 8-5 6-7 1-4-3Z"/><path d="m6 9 6 2 5-5M12 11l-1 9" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  bug: { nome: 'Inseto', simbolo: '<ellipse cx="12" cy="13" rx="5" ry="7"/><path d="M12 6v14M7 10 4 8m11 2 4-2M7 15l-3 2m11-2 3 2M9 5l-2-2m6 2 2-2" fill="none" stroke="currentColor" stroke-width="1.7"/>' },
  ghost: { nome: 'Fantasma', simbolo: '<path d="M5 20V11a7 7 0 0 1 14 0v9l-3-2-2 2-2-2-3 2-2-2-2 2Z"/><circle cx="9" cy="11" r="1" fill="#735797"/><circle cx="15" cy="11" r="1" fill="#735797"/>' },
  steel: { nome: 'Aço', simbolo: '<path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z"/><path d="M12 3v18M3 8l18 8M21 8 3 16" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  fire: { nome: 'Fogo', simbolo: '<path d="M13 2c1 5-4 6-2 10 1-2 3-3 4-5 4 4 6 8 3 13-3 4-11 3-13-1-3-6 2-10 5-13 0 4 1 5 2 6 2-3 2-6 1-10Z"/>' },
  water: { nome: 'Água', simbolo: '<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z"/><path d="M9 16a3 3 0 0 0 3 3" fill="none" stroke="#6390f0" stroke-width="1.8"/>' },
  grass: { nome: 'Grama', simbolo: '<path d="M20 4C9 4 4 8 4 14c0 3 2 5 5 5 6 0 10-6 11-15Z"/><path d="M4 21c4-6 7-8 12-12" fill="none" stroke="currentColor" stroke-width="1.7"/>' },
  electric: { nome: 'Elétrico', simbolo: '<path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z"/>' },
  psychic: { nome: 'Psíquico', simbolo: '<path d="m12 2 2.6 6.1L21 11l-6.4 2.9L12 20l-2.6-6.1L3 11l6.4-2.9L12 2Z"/><circle cx="12" cy="11" r="2"/>' },
  ice: { nome: 'Gelo', simbolo: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2M4 10l3-1V6m10 12v-3l3-1M4 14l3 1v3m10-12v3l3 1" fill="none" stroke="currentColor" stroke-width="2"/>' },
  dragon: { nome: 'Dragão', simbolo: '<path d="M3 7 9 9l3-5 3 5 6-2-2 8-4 2-3 5-3-5-4-2-2-8Z"/><circle cx="10" cy="12" r="1" fill="#6390f0"/><circle cx="15" cy="12" r="1" fill="#6390f0"/>' },
  dark: { nome: 'Sombrio', simbolo: '<path d="M20 12a8 8 0 1 1-8-8c-1 5 2 8 8 8Z"/><circle cx="15" cy="14" r="1"/>' },
  fairy: { nome: 'Fada', simbolo: '<path d="M12 12C9 5 4 4 4 8c0 3 3 4 8 4Zm0 0c3-7 8-8 8-4 0 3-3 4-8 4Zm0 0c-3 7-8 8-8 4 0-3 3-4 8-4Zm0 0c3 7 8 8 8 4 0-3-3-4-8-4Z"/><path d="M12 10v8m0 0-2 3m2-3 2 3" fill="none" stroke="currentColor" stroke-width="1.5"/>' }
};

function salvarFavoritos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
}

function renderizarFavoritos() {
  listaFavoritos.innerHTML = '';
  contadorFavoritos.textContent = favoritos.length;
  favoritosVazio.classList.toggle('oculto', favoritos.length > 0);

  favoritos.forEach(fav => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'fav-item';
    item.setAttribute('aria-label', `Consultar ${fav.nome.replace(/-/g, ' ')}, número ${fav.id}`);
    const imagem = document.createElement('img');
    imagem.src = fav.imagem || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${fav.id}.png`;
    imagem.alt = '';
    imagem.loading = 'lazy';
    const nome = document.createElement('span');
    nome.textContent = fav.nome.replace(/-/g, ' ');
    const numero = document.createElement('small');
    numero.textContent = `#${String(fav.id).padStart(4, '0')}`;
    item.append(imagem, nome, numero);
    item.addEventListener('click', () => {
      inputBusca.value = '';
      mostrarTela('pokemon');
      buscarPokemon(fav.nome);
    });
    listaFavoritos.appendChild(item);
  });
}

function mostrarTela(tela) {
  const telaAtiva = {
    pokemon: viewPokemon,
    filtros: viewFiltros,
    favoritos: viewFavoritos,
    comparacao: viewComparacao
  };
  const abas = {
    pokemon: abaPokemon,
    filtros: abaFiltros,
    favoritos: abaFavoritos,
    comparacao: abaComparacao
  };

  Object.entries(telaAtiva).forEach(([nome, elemento]) => {
    const ativa = nome === tela;
    elemento.hidden = !ativa;
    elemento.classList.toggle('oculto', !ativa);
    abas[nome].classList.toggle('ativa', ativa);
    abas[nome].setAttribute('aria-selected', String(ativa));
  });
}

function abrirPokedex() {
  pokedex.dataset.state = 'open';
  btnAbrir.setAttribute('aria-expanded', 'true');
  btnAbrir.hidden = true;
  deviceOpen.hidden = false;
  window.setTimeout(() => inputBusca.focus(), 180);
}

function fecharPokedex() {
  pokedex.dataset.state = 'closed';
  btnAbrir.setAttribute('aria-expanded', 'false');
  deviceOpen.hidden = true;
  btnAbrir.hidden = false;
  btnAbrir.focus();
}

btnAbrir.addEventListener('click', abrirPokedex);
btnFechar.addEventListener('click', fecharPokedex);
abaPokemon.addEventListener('click', () => mostrarTela('pokemon'));
abaFiltros.addEventListener('click', () => {
  mostrarTela('filtros');
  atualizarCatalogoFiltrado();
});
abaFavoritos.addEventListener('click', () => mostrarTela('favoritos'));
abaComparacao.addEventListener('click', () => mostrarTela('comparacao'));
formComparacao.addEventListener('submit', compararPokemon);
btnTema.addEventListener('click', () => {
  temaEscuro = !temaEscuro;
  temaManual = temaEscuro ? 'escuro' : 'claro';
  localStorage.setItem('pokedex_tema', temaManual);
  aplicarTema();
});
filtroOrdenacao.addEventListener('change', atualizarCatalogoFiltrado);
filtroTipo.addEventListener('change', atualizarCatalogoFiltrado);
botaoMaisPokemon.addEventListener('click', renderizarMaisPokemon);

function aplicarTema() {
  deviceOpen.dataset.theme = temaEscuro ? 'dark' : 'light';
  btnTema.setAttribute('aria-pressed', String(temaEscuro));
  iconeTema.textContent = temaEscuro ? '☀' : '☾';
  rotuloTema.textContent = temaEscuro ? 'Tema claro' : 'Tema escuro';
}

aplicarTema();
preferenciasCor.addEventListener('change', evento => {
  if (!temaManual) {
    temaEscuro = evento.matches;
    aplicarTema();
  }
});

function preencherTiposFiltro() {
  Object.entries(mapaTipos)
    .sort((a, b) => a[1].nome.localeCompare(b[1].nome, 'pt-BR'))
    .forEach(([tipo, dados]) => {
      const opcao = document.createElement('option');
      opcao.value = tipo;
      opcao.textContent = dados.nome;
      filtroTipo.appendChild(opcao);
    });
}

preencherTiposFiltro();

async function atualizarCatalogoFiltrado() {
  const solicitacaoAtual = ++solicitacaoFiltro;
  listaFiltrada.innerHTML = '';
  botaoMaisPokemon.classList.add('oculto');
  limiteFiltro = 0;
  statusFiltro.textContent = 'Carregando catálogo…';
  if (!catalogoPokemon.length) {
    statusFiltro.textContent = 'O catálogo ainda está carregando. Tente novamente em instantes.';
    return;
  }

  try {
    const tipo = filtroTipo.value;
    resultadosFiltro = catalogoPokemon.slice();
    if (tipo !== 'todos') {
      if (!cacheTipos.has(tipo)) {
        const resposta = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
        if (!resposta.ok) throw new Error('Não foi possível carregar este tipo. Tente novamente.');
        const dados = await resposta.json();
        cacheTipos.set(tipo, new Set(dados.pokemon.map(item => item.pokemon.name)));
      }
      if (solicitacaoAtual !== solicitacaoFiltro) return;
      const nomesDoTipo = cacheTipos.get(tipo);
      resultadosFiltro = resultadosFiltro.filter(pokemon => nomesDoTipo.has(pokemon.nome));
    }

    if (solicitacaoAtual !== solicitacaoFiltro) return;

    if (filtroOrdenacao.value === 'numero-desc') {
      resultadosFiltro.sort((a, b) => Number(b.id) - Number(a.id));
    } else if (filtroOrdenacao.value === 'nome-asc') {
      resultadosFiltro.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    } else {
      resultadosFiltro.sort((a, b) => Number(a.id) - Number(b.id));
    }

    statusFiltro.textContent = `${resultadosFiltro.length} Pokémon encontrados`;
    renderizarMaisPokemon();
  } catch (erro) {
    if (solicitacaoAtual === solicitacaoFiltro) statusFiltro.textContent = erro.message;
  }
}

function renderizarMaisPokemon() {
  const inicio = limiteFiltro;
  const lote = resultadosFiltro.slice(inicio, inicio + tamanhoPaginaFiltro);
  const fragmento = document.createDocumentFragment();
  lote.forEach(pokemon => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'pokemon-filtro-item';
    item.setAttribute('aria-label', `Consultar ${pokemon.nome}, número ${pokemon.id}`);
    const imagem = document.createElement('img');
    imagem.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    imagem.alt = '';
    imagem.loading = 'lazy';
    const nome = document.createElement('span');
    nome.textContent = pokemon.nome.replace(/-/g, ' ');
    const numero = document.createElement('small');
    numero.textContent = `#${String(pokemon.id).padStart(4, '0')}`;
    item.append(imagem, nome, numero);
    item.addEventListener('click', () => {
      inputBusca.value = pokemon.nome;
      buscarPokemon(pokemon.id);
    });
    fragmento.appendChild(item);
  });
  listaFiltrada.appendChild(fragmento);
  limiteFiltro += lote.length;
  botaoMaisPokemon.classList.toggle('oculto', limiteFiltro >= resultadosFiltro.length);
}

function criarIconeTipo(tipo) {
  const dados = mapaTipos[tipo];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = dados ? dados.simbolo : '<circle cx="12" cy="12" r="7"/>';
  return svg;
}

function criarBadgeTipo(tipo) {
  const dados = mapaTipos[tipo] || { nome: tipo.replace(/-/g, ' '), simbolo: '<circle cx="12" cy="12" r="7"/>' };
  const badge = document.createElement('span');
  badge.className = `tipo-badge tipo-${tipo}`;
  const icone = document.createElement('span');
  icone.className = 'tipo-icone';
  icone.appendChild(criarIconeTipo(tipo));
  const nome = document.createElement('span');
  nome.className = 'tipo-nome';
  nome.textContent = dados.nome;
  badge.append(icone, nome);
  return badge;
}

async function compararPokemon(evento) {
  evento.preventDefault();
  const identificadorA = inputComparacaoA.value.trim().toLowerCase().replace(/^#/, '');
  const identificadorB = inputComparacaoB.value.trim().toLowerCase().replace(/^#/, '');
  if (!identificadorA || !identificadorB) return;

  btnComparar.disabled = true;
  mensagemComparacao.textContent = 'Buscando dados dos dois Pokémon…';
  comparacaoVazia.classList.add('oculto');
  resultadoComparacao.classList.add('oculto');

  try {
    const [pokemonA, pokemonB] = await Promise.all([
      carregarPokemonComparacao(identificadorA),
      carregarPokemonComparacao(identificadorB)
    ]);
    renderizarComparacao(pokemonA, pokemonB);
    mensagemComparacao.textContent = '';
    resultadoComparacao.classList.remove('oculto');
  } catch (erro) {
    mensagemComparacao.textContent = erro.message;
    comparacaoVazia.classList.remove('oculto');
  } finally {
    btnComparar.disabled = false;
  }
}

async function carregarPokemonComparacao(identificador) {
  const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(identificador)}`);
  if (!resposta.ok) throw new Error(`Não foi possível encontrar “${identificador}”. Confira o nome ou número.`);
  return resposta.json();
}

function obterImagemPokemon(pokemon) {
  return pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '';
}

function renderizarComparacao(pokemonA, pokemonB) {
  resultadoComparacao.innerHTML = '';
  const perfis = document.createElement('div');
  perfis.className = 'comparacao-perfis';
  [pokemonA, pokemonB].forEach((pokemon, indice) => {
    const perfil = document.createElement('article');
    perfil.className = `comparacao-perfil comparacao-perfil-${indice === 0 ? 'a' : 'b'}`;
    const arte = document.createElement('img');
    arte.src = obterImagemPokemon(pokemon);
    arte.alt = '';
    arte.loading = 'lazy';
    const identidade = document.createElement('div');
    identidade.className = 'comparacao-identidade';
    const nome = document.createElement('h3');
    nome.textContent = pokemon.name.replace(/-/g, ' ');
    const id = document.createElement('span');
    id.textContent = `#${String(pokemon.id).padStart(4, '0')}`;
    identidade.append(nome, id);
    const tipos = document.createElement('div');
    tipos.className = 'comparacao-tipos';
    pokemon.types.forEach(item => tipos.appendChild(criarBadgeTipo(item.type.name)));
    perfil.append(arte, identidade, tipos);
    perfis.appendChild(perfil);
  });
  resultadoComparacao.appendChild(perfis);

  const legenda = document.createElement('div');
  legenda.className = 'comparacao-legenda';
  legenda.innerHTML = '<span><i class="legenda-a"></i> Pokémon 1</span><span><i class="legenda-b"></i> Pokémon 2</span>';
  resultadoComparacao.appendChild(legenda);

  const valoresA = Object.fromEntries(pokemonA.stats.map(stat => [stat.stat.name, stat.base_stat]));
  const valoresB = Object.fromEntries(pokemonB.stats.map(stat => [stat.stat.name, stat.base_stat]));
  const estatisticas = document.createElement('div');
  estatisticas.className = 'comparacao-estatisticas';
  pokemonA.stats.forEach(stat => {
    const nome = mapaStats[stat.stat.name] || stat.stat.name;
    const valorA = valoresA[stat.stat.name] || 0;
    const valorB = valoresB[stat.stat.name] || 0;
    const linha = document.createElement('div');
    linha.className = 'comparacao-stat-linha';
    linha.appendChild(criarItemComparacao(nome, valorA, 'a', valorA > valorB));
    const rotulo = document.createElement('span');
    rotulo.className = 'comparacao-stat-nome';
    rotulo.textContent = nome;
    linha.append(rotulo, criarItemComparacao(nome, valorB, 'b', valorB > valorA));
    estatisticas.appendChild(linha);
  });
  resultadoComparacao.appendChild(estatisticas);
}

function criarItemComparacao(nome, valor, lado, vence) {
  const item = document.createElement('div');
  item.className = `comparacao-stat-item comparacao-stat-${lado}${vence ? ' lider' : ''}`;
  item.setAttribute('aria-label', `${nome}: ${valor}`);
  const valorElemento = document.createElement('span');
  valorElemento.className = 'comparacao-stat-valor';
  valorElemento.textContent = valor;
  const trilho = document.createElement('span');
  trilho.className = 'comparacao-stat-trilho';
  const barra = document.createElement('span');
  barra.className = 'comparacao-stat-barra';
  barra.style.width = `${Math.min(valor / 255 * 100, 100)}%`;
  trilho.appendChild(barra);
  item.append(valorElemento, trilho);
  return item;
}

function atualizarBotaoFavorito() {
  if (!pokemonAtual) return;
  const jaFavoritado = favoritos.some(f => f.nome === pokemonAtual.name);
  btnFavoritar.classList.toggle('favoritado', jaFavoritado);
  btnFavoritar.querySelector('.acao-icone').textContent = jaFavoritado ? '★' : '☆';
  btnFavoritar.querySelector('.acao-label').textContent = jaFavoritado ? 'Favorito' : 'Favoritar';
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
    if (!viewFiltros.hidden) atualizarCatalogoFiltrado();
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
  mostrarTela('pokemon');
  estadoInicial.classList.add('oculto');
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
  const estagios = [];
  const percorrer = (no, estagio, idPai = null) => {
    const partes = no.species.url.split('/').filter(Boolean);
    const id = Number(partes[partes.length - 1]);
    if (!estagios[estagio]) estagios[estagio] = [];
    estagios[estagio].push({
      nome: no.species.name,
      id,
      idPai,
      imagem: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    });
    no.evolves_to.forEach(proxima => percorrer(proxima, estagio + 1, id));
  };
  percorrer(noAtual, 0);
  return estagios;
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
      const simbolo = document.createElement('span');
      simbolo.className = 'variacao-simbolo';
      simbolo.textContent = '◈';
      const nome = document.createElement('span');
      nome.className = 'variacao-nome';
      nome.textContent = formatarNomeVariacao(v.pokemon.name, especie.name);
      btn.append(simbolo, nome);
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
  containerTipos.innerHTML = '';
  pokemon.types.forEach(tipo => containerTipos.appendChild(criarBadgeTipo(tipo.type.name)));

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
    .map((s, index) => {
      const nome = mapaStats[s.stat.name] || s.stat.name;
      const valor = s.base_stat;
      const porcentagem = Math.min((valor / valorMaximo) * 100, 100).toFixed(1);
      const cor = obterCorStat(valor);

      return `
        <div class="stat-cartao" style="--stat-cor:${cor}; --stat-progresso:${porcentagem}%;">
          <div class="stat-cartao-topo">
            <span class="stat-indice">${String(index + 1).padStart(2, '0')}</span>
            <span class="stat-nome">${nome}</span>
            <span class="stat-valor">${valor}</span>
          </div>
          <div class="stat-trilho"><span></span></div>
        </div>
      `;
    })
    .join('');

  const containerEvolucoes = document.getElementById('poke-evolucoes');
  renderizarCadeiaEvolutiva(containerEvolucoes, evolucoes);

  cardPokemon.classList.remove('oculto');
  estadoInicial.classList.add('oculto');
}

function criarCartaoEvolucao(evolucao, classe = '') {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = `evo-item ${classe}`.trim();
  item.setAttribute('aria-label', `Consultar ${evolucao.nome.replace(/-/g, ' ')}, número ${evolucao.id}`);
  const imagem = document.createElement('img');
  imagem.src = evolucao.imagem;
  imagem.alt = '';
  imagem.width = 64;
  imagem.height = 64;
  const nome = document.createElement('span');
  nome.textContent = evolucao.nome.replace(/-/g, ' ');
  const numero = document.createElement('small');
  numero.textContent = `#${String(evolucao.id).padStart(4, '0')}`;
  item.append(imagem, nome, numero);
  item.addEventListener('click', () => buscarPokemon(evolucao.id));
  return item;
}

function obterPosicoesOrbitais(quantidade, grade) {
  const perimetro = [];
  for (let coluna = 1; coluna <= grade; coluna += 1) perimetro.push([1, coluna]);
  for (let linha = 2; linha <= grade; linha += 1) perimetro.push([linha, grade]);
  for (let coluna = grade - 1; coluna >= 1; coluna -= 1) perimetro.push([grade, coluna]);
  for (let linha = grade - 1; linha > 1; linha -= 1) perimetro.push([linha, 1]);
  return Array.from({ length: quantidade }, (_, indice) => perimetro[Math.floor(indice * perimetro.length / quantidade)]);
}

function renderizarCadeiaEvolutiva(container, estagios) {
  container.innerHTML = '';
  const pokemons = estagios.flat();
  const ramificacoes = Math.max(...estagios.map(estagio => estagio.length)) >= 5;
  if (ramificacoes && pokemons.length > 1) {
    const grade = pokemons.length <= 9 ? 5 : pokemons.length <= 17 ? 7 : 9;
    const centro = Math.ceil(grade / 2);
    const orbita = document.createElement('div');
    orbita.className = 'evo-orbita';
    orbita.style.setProperty('--grade-orbita', grade);
    const principal = estagios[0][0];
    const cartaoPrincipal = criarCartaoEvolucao(principal, 'evo-centro');
    cartaoPrincipal.style.gridRow = centro;
    cartaoPrincipal.style.gridColumn = centro;
    orbita.appendChild(cartaoPrincipal);
    const demais = pokemons.filter(pokemon => pokemon.id !== principal.id);
    const posicoes = obterPosicoesOrbitais(demais.length, grade);
    demais.forEach((pokemon, indice) => {
      const cartao = criarCartaoEvolucao(pokemon, 'evo-radial');
      cartao.style.gridRow = posicoes[indice][0];
      cartao.style.gridColumn = posicoes[indice][1];
      orbita.appendChild(cartao);
    });
    container.appendChild(orbita);
    return;
  }

  estagios.forEach((estagio, indice) => {
    if (indice > 0) {
      const conector = document.createElement('span');
      conector.className = 'evo-conector';
      conector.setAttribute('aria-hidden', 'true');
      conector.textContent = '→';
      container.appendChild(conector);
    }
    const grupo = document.createElement('div');
    grupo.className = 'evo-grupo';
    estagio.forEach(evolucao => grupo.appendChild(criarCartaoEvolucao(evolucao)));
    container.appendChild(grupo);
  });
}
