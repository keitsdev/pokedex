const inputBusca = document.getElementById('input-busca');
const listaSugestoes = document.getElementById('lista-sugestoes');
const btnBuscar = document.getElementById('btn-buscar');
const btnAleatorio = document.getElementById('btn-aleatorio');
const statusMsg = document.getElementById('mensagem-status');
const cardPokemon = document.getElementById('card-pokemon');

let catalogoPokemon = [];

const mapaStats = {
  'hp': 'HP',
  'attack': 'Ataque',
  'defense': 'Defesa',
  'special-attack': 'Ataque Especial',
  'special-defense': 'Defesa Especial',
  'speed': 'Velocidade'
};

async function carregarCatalogo() {
  try {
    const resposta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
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

inputBusca.addEventListener('input', () => {
  const termo = inputBusca.value.trim().toLowerCase();
  listaSugestoes.innerHTML = '';

  if (!termo || catalogoPokemon.length === 0) {
    listaSugestoes.classList.add('oculto');
    return;
  }

  const filtrados = catalogoPokemon
    .filter(p => p.nome.includes(termo) || p.id.startsWith(termo))
    .slice(0, 8);

  if (filtrados.length === 0) {
    listaSugestoes.classList.add('oculto');
    return;
  }

  filtrados.forEach(poke => {
    const item = document.createElement('li');
    item.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png" alt="${poke.nome}">
      <span>${poke.nome}</span>
      <span class="sugestao-id">#${poke.id.padStart(4, '0')}</span>
    `;
    item.addEventListener('click', () => {
      inputBusca.value = poke.nome;
      listaSugestoes.classList.add('oculto');
      buscarPokemon(poke.id);
    });
    listaSugestoes.appendChild(item);
  });

  listaSugestoes.classList.remove('oculto');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.busca-wrapper')) {
    listaSugestoes.classList.add('oculto');
  }
});

btnBuscar.addEventListener('click', () => {
  const termo = inputBusca.value.trim().toLowerCase();
  listaSugestoes.classList.add('oculto');
  if (termo) buscarPokemon(termo);
});

inputBusca.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnBuscar.click();
});

btnAleatorio.addEventListener('click', () => {
  const idAleatorio = Math.floor(Math.random() * 1025) + 1;
  inputBusca.value = '';
  listaSugestoes.classList.add('oculto');
  buscarPokemon(idAleatorio);
});

async function buscarPokemon(identificador) {
  statusMsg.textContent = 'Carregando...';
  cardPokemon.classList.add('oculto');

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

function obterCorStat(valor) {
  if (valor < 60) return '#ff5959';
  if (valor < 90) return '#ffdd57';
  if (valor < 120) return '#48c774';
  return '#3273dc';
}

function renderizarPokemon(pokemon, evolucoes, especie) {
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

  const foto = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  document.getElementById('poke-foto').src = foto;

  const containerTipos = document.getElementById('poke-tipos');
  containerTipos.innerHTML = pokemon.types
    .map(t => `<span>${t.type.name}</span>`)
    .join('');

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