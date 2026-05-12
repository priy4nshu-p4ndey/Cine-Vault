const API_KEY = 'f21390fd';
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

const mainGrid = document.getElementById('main-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const loader = document.getElementById('loader');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

let isFetching = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies('Batman');
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) fetchMovies(searchTerm);
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    modalBody.innerHTML = '';
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add('hidden');
        modalBody.innerHTML = '';
    }
});

async function fetchMovies(query) {
    if (isFetching) return;
    isFetching = true;
    
    mainGrid.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const res = await fetch(`${BASE_URL}&s=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.Response === "True") {
            renderGrid(data.Search);
        } else {
            mainGrid.innerHTML = `<h2 style="grid-column: 1/-1; text-align: center;">${data.Error}</h2>`;
        }
    } catch (err) {
        mainGrid.innerHTML = `<h2 style="grid-column: 1/-1; text-align: center;">Connection Error</h2>`;
    } finally {
        loader.classList.add('hidden');
        isFetching = false;
    }
}

function renderGrid(movies) {
    movies.forEach(movie => {
        if (movie.Poster === "N/A") return;

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.id = movie.imdbID;
        
        card.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title} poster">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <div class="meta-tags">
                    <span class="tag">${movie.Year}</span>
                    <span class="tag" style="text-transform: capitalize;">${movie.Type}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => fetchMovieDetails(movie.imdbID));
        mainGrid.appendChild(card);
    });
}

async function fetchMovieDetails(id) {
    modalBody.innerHTML = '<p style="text-align:center;">Loading details...</p>';
    modalOverlay.classList.remove('hidden');

    try {
        const res = await fetch(`${BASE_URL}&i=${id}&plot=full`);
        const movie = await res.json();

        if (movie.Response === "True") {
            renderModal(movie);
        } else {
            modalBody.innerHTML = '<p>Failed to load details.</p>';
        }
    } catch (err) {
        modalBody.innerHTML = '<p>Connection Error</p>';
    }
}

function renderModal(movie) {
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    modalBody.innerHTML = `
        <div class="modal-split">
            <img src="${posterSrc}" alt="${movie.Title}">
            <div class="modal-details">
                <h2>${movie.Title}</h2>
                <div class="modal-meta">
                    <span>⭐ ${movie.imdbRating}</span>
                    <span>${movie.Runtime}</span>
                    <span>${movie.Rated}</span>
                </div>
                <p class="modal-plot">${movie.Plot}</p>
                <div class="modal-info-row">
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Cast:</strong> ${movie.Actors}</p>
                    <p><strong>Released:</strong> ${movie.Released}</p>
                </div>
            </div>
        </div>
    `;
}