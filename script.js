const body = document.body;

// Make all elements using DOM
body.innerHTML = `<div class="container-fuild bg-info p-3">
      <div class="container header-container">
        <h1 class="text-white">Pokemon List</h1>
        <button class="btn btn-primary text-uppercase" id="getPokemons">Get Pokemons</button>
        <form class="form-inline">
          <div class="form-group">
            <input
              type="text"
              name="search"
              id="search"
              class="form-control"
              placeholder="Search by name or ID"
            />
          </div>
          <button class="btn btn-primary ml-2 text-uppercase" id="searchBtn">search</button>
        </form>
      </div>
    </div>
    <div class="container-fluid mt-3 d-flex justify-content-center p-3" id="buttons">
      <nav>
        <ul
          class="pagination justify-content-center btn-container-top mb-0"
          id="pages"
        >        
         </ul>
      </nav>
    </div>
    <div class="container-fluid mt-3">
      <div class="data-container"></div>
    </div>
    <div class="container-fluid mt-3 d-flex justify-content-center p-3" id="buttons">
      <nav>
        <ul
          class="pagination justify-content-center btn-container-bottom mb-0"
          id="pages"
        >        
         </ul>
      </nav>
    </div>`;

// get elements from the DOM
const btnGetPokemons = document.querySelector('#getPokemons'); // starts the fetching of pokemons
const btnSearch = document.querySelector('#searchBtn');
const searchInput = document.querySelector('#search');
const dataContainer = document.querySelector('.data-container'); // is the container where pokemons are displayed
const pageBtnContainerTop = document.querySelector('.btn-container-top'); // top pagination
const pageBtnContainerBottom = document.querySelector('.btn-container-bottom'); // bottom pagination
let index = 0; // main controlling index for pagination
let itemsPerPage = 50; // number of items per page as per test parameter it is 50
let pages = []; // array which will contain all the page nos.
let singlePokemon = false;

// rendering the pokemon in the data container
function renderPokemon(data) {
  let abilitiesOfPokemon = data.abilities
    .map((el) => {
      return el.ability.name;
    })
    .join(', ');
  let movesOfPokemon = data.moves
    .map((el) => {
      return el.move.name;
    })
    .join(', ');
  let weight = data.weight;
  let name = data.name;
  let pokemonImageURL = data.sprites.other['official-artwork'].front_default;
  if (!pokemonImageURL) {
    pokemonImageURL = data.sprites.other.home.front_default;
  }
  if (!pokemonImageURL) {
    pokemonImageURL = `https://via.placeholder.com/336/fff?text='No Image Found'`;
  }
  const cardInnerHTML = `<div class="card card-width ${
    singlePokemon === true ? 'card-single' : ''
  }">
             <img
               class="pokemon-img ${singlePokemon === true ? 'img-single' : ''}"
               src="${pokemonImageURL}"
               alt="pokemon picture"
             />
             <div class="card-body">
               <h5 class="card-title text-uppercase">${name}</h5>
               <h6>Abilities:</h6>
               <p><small>${abilitiesOfPokemon}</small></p>
               <h6>Moves:</h6>
               <p>
                 <small>${movesOfPokemon}</small>
               </p>
               <h6 class="d-inline">Weight:</h6>
               <p class="d-inline">${weight}</p>
             </div>
           </div>`;
  dataContainer.insertAdjacentHTML('beforeend', cardInnerHTML);
}

// calculating the pagination - no of pages
function noOfPages(dt) {
  let total = dt.count;
  const numberOfPages = Math.ceil(total / itemsPerPage);
  let pageArray = Array.from({ length: numberOfPages }, (_, index) => {
    return index + 1;
  });
  renderPageBtns(pageBtnContainerTop, pageArray, index);
  renderPageBtns(pageBtnContainerBottom, pageArray, index);
}

// rendering the pagination
function renderPageBtns(container, arr, activeIndex) {
  let displayBtns = arr.map((_, index) => {
    return `<li class="page-item ${
      index === activeIndex ? ' active' : ''
    }" id="page${index}">
               <button class="page-link page-btns" data-id="${index}">${
      index + 1
    }</button>
            </li>`;
  });

  displayBtns.unshift(`<li class="page-item ${
    activeIndex === 0 ? 'disabled' : ''
  }">
            <button class="page-link prev " id="prev">Previous</button>
          </li>`);
  displayBtns.push(`<li class="page-item ${
    activeIndex === arr.length - 1 ? 'disabled' : ''
  }">
            <button class="page-link next" id="next">Next</button>
          </li>`);

  container.innerHTML = displayBtns.join('');
}

// fetch for getting the pokemons
async function getPokemons() {
  const url = `https://pokeapi.co/api/v2/pokemon/?offset=${
    index * itemsPerPage
  }&limit=${itemsPerPage}/`;
  singlePokemon = false;
  pageBtnContainerTop.style.display = 'flex';
  pageBtnContainerBottom.style.display = 'flex';
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Something went wrong: ${response.status} ${response.statusText}`
      ); // throwing a meaningfull error
    const data = await response.json(); // the data has only name and further the url of each pokemon
    noOfPages(data); // send total count for pagination
    dataContainer.innerHTML = ''; // clear the data container

    // iterating through the data to get detailed info for each pokemon
    for (let i = 0; i < data.results.length; i++) {
      const pokemonResponse = await fetch(data.results[i].url);
      if (!pokemonResponse.ok)
        throw new Error(
          `Something went wrong: ${pokemonResponse.status} ${pokemonResponse.statusText}`
        ); // throwing a meaningfull error
      const pokemonData = await pokemonResponse.json();
      renderPokemon(pokemonData); // rendering each pokemon
    }
  } catch (error) {
    console.error(error);
    dataContainer.innerHTML = `<h1>${error}</h1>`; // error handling
  }
}

// getting one pokemon
async function getPokemon(nameOrID) {
  const url = `https://pokeapi.co/api/v2/pokemon/${nameOrID}/`;
  singlePokemon = true;
  pageBtnContainerTop.style.display = 'none';
  pageBtnContainerBottom.style.display = 'none';
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        `Something went wrong: ${response.status} ${response.statusText}`
      ); // throwing a meaningfull error
    const data = await response.json();

    dataContainer.innerHTML = ''; // clear the data container
    renderPokemon(data); // rendering each pokemon
  } catch (error) {
    console.error(error);
    dataContainer.innerHTML = `<h1>${error}</h1>`; // error handling
  }
}

// listening to search and then executing fetch
btnSearch.addEventListener('click', (e) => {
  e.preventDefault();
  getPokemon(searchInput.value.toLowerCase()); // fetch single pokemon
  searchInput.value = ''; // reset the search input
  btnSearch.blur(); // remove focus from search btn
});

// page navigation top by listening to button clicks
pageBtnContainerTop.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-container-top')) {
    return;
  }
  if (e.target.classList.contains('page-btns')) {
    index = parseInt(e.target.dataset.id);
  }
  if (e.target.classList.contains('prev')) {
    index--;
  }
  if (e.target.classList.contains('next')) {
    index++;
  }
  getPokemons();
});

// page navigation bottom by listening to button clicks
pageBtnContainerBottom.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-container-bottom')) {
    return;
  }
  if (e.target.classList.contains('page-btns')) {
    index = parseInt(e.target.dataset.id);
  }
  if (e.target.classList.contains('prev')) {
    index--;
  }
  if (e.target.classList.contains('next')) {
    index++;
  }
  getPokemons();
});

// Initialization function
function init() {
  index = 0; // reset index to zero
  getPokemons(); // fetch pokemons
  btnGetPokemons.blur(); // remove focus from get pokemons btn
}

// listening to get pokemons button and initialize the fetch
btnGetPokemons.addEventListener('click', init);
