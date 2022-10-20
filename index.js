const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displayButton = document.querySelector('#display-btn')
const movies = []
// show 12 movies per page
const MOVIES_PER_PAGE = 12
let filteredMovies = []
let displayMode = 'list'


// fetch movies information
axios
  .get(INDEX_URL)
  .then((response) => {
    // for(const movie of response.data.results) {
    //   movies.push(movie)
    // }
    // spread operator
    movies.push(...response.data.results)
    /* show all movies */
    // renderMovieList(movies)
    /* show first page */
    renderMovieList(getMovieByPage(1))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))

// show movies
function renderMovieList(data) {
  let rawHTML = ''
  if(displayMode === 'card') {
    data.forEach((item) => {
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>`
    })
  } else if(displayMode === 'list') {
    data.forEach((item) => {
      rawHTML +=`
        <div class="col-12 mb-3 d-flex justify-content-between text-center border-top pt-2">
          <h5>${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>`
    })
  } 
  dataPanel.innerHTML = rawHTML
}

// show movie modal 
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

// add favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies',JSON.stringify(list))
}

// show selected page movie 
function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// count page
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for(let page = 1; page <= numberOfPages; page ++) {
    rawHTML += `
    <li class="page-item">
    <a class="page-link" href="#" data-page="${page}">${page}</a>
    </li>
    `
  }
  paginator.innerHTML = rawHTML
}

//movie button click
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if(event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// search bar
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // prevent default 
  event.preventDefault()
  // input value
  const keyword = searchInput.value.trim().toLowerCase()
  // save filtered movies

  // error : no value in input
  // if(!keyword.length) {
  //   return alert('請輸入有效字串!')
  // }

  // filtered movies by keyword
  // show all movies when keyword is ''
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)
  )
  // error handle: no movies that includes keyword
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword} 沒有符合條件的電影`)
  }
  // render 
  renderMovieList(getMovieByPage(1))
  // padinator after search
  renderPaginator(filteredMovies.length)
})

// paginator button click
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') {
    return
  }
  const page = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(page))
})

displayButton.addEventListener('click', function changeDisplayMode(event) {
  if(event.target.matches('.display-list')) {
    displayMode = 'list'
  } else if (event.target.matches('.display-card')) {
    displayMode = 'card'
  }
  renderMovieList(getMovieByPage(1))
  // renderPaginator(movies.length)
})