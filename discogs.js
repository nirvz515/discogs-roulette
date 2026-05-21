var style = document.createElement("style");

style.innerHTML = `
#dr-app{
  max-width:520px;
  margin:20px auto;
  padding:14px;
  background:#0b0b0b;
  color:#d7ffcf;
  font-family:"Courier New",monospace;
  border:3px solid #777;
  box-shadow:8px 8px 0 #222;
}

#dr-logo{
  width:100%;
  max-width:430px;
  display:block;
  margin:0 auto 14px;
}

.dr-screen{
  text-align:center;
  background:linear-gradient(#151515,#050505);
  padding:18px;
  border:2px inset #999;
  position:relative;
  overflow:hidden;
}

#dr-status{
  background:#001900;
  border:1px solid #39ff14;
  padding:8px;
  margin-bottom:14px;
  font-size:13px;
}

.dr-cover-wrap{
  width:260px;
  height:260px;
  margin:0 auto 15px;
  background:#222;
  border:4px solid #aaa;
  position:relative;
  overflow:hidden;
}

#dr-cover{
  width:100%;
  height:100%;
  object-fit:cover;
  display:none;
}

.dr-vhs{
  pointer-events:none;
  position:absolute;
  inset:0;
  background:repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,.08) 0px,
    rgba(255,255,255,.08) 1px,
    transparent 2px,
    transparent 5px
  );
  mix-blend-mode:screen;
  animation:vhs 0.18s infinite;
}

@keyframes vhs{
  0%{transform:translateY(0)}
  50%{transform:translateY(2px)}
  100%{transform:translateY(-1px)}
}

.rolling{
  animation:roulette .08s infinite;
}

@keyframes roulette{
  0%{filter:hue-rotate(0deg) contrast(1.4)}
  50%{filter:hue-rotate(120deg) contrast(1.8) blur(1px)}
  100%{filter:hue-rotate(260deg) contrast(1.2)}
}

#dr-artist{
  color:#fff;
  margin:10px 0 4px;
}

#dr-title{
  color:#ffcc00;
  font-size:18px;
  margin:0;
}

#dr-year{
  color:#aaa;
}

#dr-btn,#dr-reset{
  background:#c0c0c0;
  border:3px outset #fff;
  padding:10px 14px;
  margin:5px;
  cursor:pointer;
  font-family:"Courier New",monospace;
  font-weight:bold;
  color:#b7ff8c;

  text-shadow:
    -1px -1px 0 #000,
     1px -1px 0 #000,
    -1px  1px 0 #000,
     1px  1px 0 #000;
}

#dr-btn:active,#dr-reset:active{
  border:3px inset #fff;
}

#dr-youtube a{
  display:inline-block;
  margin-top:12px;
  background:#ff0000;
  color:#fff;
  padding:8px 12px;
  text-decoration:none;
  font-weight:bold;
}

#dr-history{
  text-align:left;
  max-height:150px;
  overflow:auto;
  background:#111;
  border:1px solid #444;
  padding:10px 10px 10px 25px;
}

#dr-history li{
  margin-bottom:6px;
}
`;

document.head.appendChild(style);

document.getElementById("sorteador-discogs").innerHTML = `
<div id="dr-app">
  <div class="dr-screen">

    <img
      src="https://raw.githubusercontent.com/nirvz515/discogs-roulette/refs/heads/main/logo.png?v=500"
      id="dr-logo"
      alt="DISCO ROULETTE 2000"
    >

    <div id="dr-status">
      pronto para sortear
    </div>

    <div class="dr-cover-wrap">
      <img id="dr-cover" src="">
      <div class="dr-vhs"></div>
    </div>

    <h3 id="dr-artist">---</h3>
    <p id="dr-title">---</p>
    <p id="dr-year">---</p>

    <button id="dr-btn">
      SORTEAR DISCO
    </button>

    <button id="dr-reset">
      ZERAR HISTÓRICO
    </button>

    <div id="dr-youtube"></div>

    <h4>Histórico</h4>

    <ul id="dr-history"></ul>

  </div>
</div>
`;

var USERNAME = "nirvz";

var discos = [];

var sorteados =
JSON.parse(localStorage.getItem("dr_sorteados") || "[]");

var historico =
JSON.parse(localStorage.getItem("dr_historico") || "[]");

function salvar(){
  localStorage.setItem(
    "dr_sorteados",
    JSON.stringify(sorteados)
  );

  localStorage.setItem(
    "dr_historico",
    JSON.stringify(historico)
  );
}

function atualizarHistorico(){

  var lista =
  document.getElementById("dr-history");

  lista.innerHTML = "";

  historico
  .slice()
  .reverse()
  .forEach(function(item){

    var li =
    document.createElement("li");

    li.textContent = item;

    lista.appendChild(li);

  });

}

async function carregarColecao(){

  var page = 1;

  var totalPages = 1;

  while(page <= totalPages){

    var url =
    "https://api.discogs.com/users/" +
    USERNAME +
    "/collection/folders/0/releases?page=" +
    page +
    "&per_page=100";

    var resposta = await fetch(url);

    var dados = await resposta.json();

    if(!dados.releases){
      throw new Error("Coleção privada.");
    }

    discos =
    discos.concat(dados.releases);

    totalPages =
    dados.pagination.pages;

    page++;

  }

}

function mostrarPreview(release){

  var info =
  release.basic_information;

  var artista =
  info.artists[0]
  ? info.artists[0].name
  : "---";

  document.getElementById(
    "dr-artist"
  ).textContent = artista;

  document.getElementById(
    "dr-title"
  ).textContent = info.title || "---";

  document.getElementById(
    "dr-year"
  ).textContent = info.year || "---";

  var img =
  document.getElementById("dr-cover");

  if(info.cover_image){

    img.src = info.cover_image;

    img.style.display = "block";

  }

}

function mostrarDisco(release){

  var info =
  release.basic_information;

  var artista =
  info.artists
  .map(function(a){

    return a.name.replace(" (2)", "");

  })
  .join(", ");

  var titulo = info.title;

  var ano =
  info.year || "Ano desconhecido";

  var capa =
  info.cover_image || "";

  document.getElementById(
    "dr-artist"
  ).textContent = artista;

  document.getElementById(
    "dr-title"
  ).textContent = titulo;

  document.getElementById(
    "dr-year"
  ).textContent = ano;

  var img =
  document.getElementById("dr-cover");

  img.src = capa;

  img.style.display = "block";

  var busca =
  encodeURIComponent(
    artista + " " + titulo + " vinyl"
  );

  document.getElementById(
    "dr-youtube"
  ).innerHTML =
    '<a target="_blank" href="https://www.youtube.com/results?search_query=' +
    busca +
    '">OUVIR NO YOUTUBE</a>';

  var texto =
  artista +
  " - " +
  titulo +
  " (" +
  ano +
  ")";

  if(historico.indexOf(texto) === -1){

    historico.push(texto);

  }

  if(sorteados.indexOf(release.id) === -1){

    sorteados.push(release.id);

  }

  salvar();

  atualizarHistorico();

  var restantes =
  discos.length - sorteados.length;

  document.getElementById(
    "dr-status"
  ).textContent =
    "faltam " +
    restantes +
    " discos";

}

async function sortearDisco(){

  var status =
  document.getElementById("dr-status");

  var cover =
  document.getElementById("dr-cover");

  status.textContent =
  "sorteando...";

  document.getElementById(
    "dr-btn"
  ).textContent =
  "SORTEAR NOVAMENTE";

  if(discos.length === 0){

    await carregarColecao();

  }

  var disponiveis =
  discos.filter(function(d){

    return sorteados.indexOf(d.id) === -1;

  });

  if(disponiveis.length === 0){

    sorteados = [];

    disponiveis = discos.slice();

  }

  cover.className = "rolling";

  var tempo = 0;

  var roleta = setInterval(function(){

    var temp =
    disponiveis[
      Math.floor(
        Math.random() *
        disponiveis.length
      )
    ];

    mostrarPreview(temp);

    tempo++;

    if(tempo > 18){

      clearInterval(roleta);

      cover.className = "";

      var escolhido =
      disponiveis[
        Math.floor(
          Math.random() *
          disponiveis.length
        )
      ];

      mostrarDisco(escolhido);

    }

  }, 90);

}

document.getElementById(
  "dr-btn"
).onclick = sortearDisco;

document.getElementById(
  "dr-reset"
).onclick = function(){

  sorteados = [];

  historico = [];

  salvar();

  atualizarHistorico();

  document.getElementById(
    "dr-status"
  ).textContent =
  "histórico zerado";

};

atualizarHistorico();
