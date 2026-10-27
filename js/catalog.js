// Каталог фильмов: List (список карточек) и Detail (модальное окно).
// Данные берём из data/films.json через fetch, как на уроке.

const DATA_URL = 'data/films.json';

const filmGrid = document.getElementById('film-grid');
const searchInput = document.getElementById('search');
const countEl = document.getElementById('count');
const detailSection = document.getElementById('detail-section');
const detailCard = document.getElementById('detail-card');
const closeBtn = document.getElementById('close-btn');

let filmsData = [];

/* ---------- загрузка JSON ---------- */

async function loadFilms() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        filmsData = await response.json();
    } catch (error) {
        console.error('Ошибка JSON', error);

        // Если страницу открыли двойным щелчком (file://), fetch не работает.
        // Тогда берём запасную копию данных из data/films-data.js.
        if (window.FILMS_FALLBACK) {
            filmsData = window.FILMS_FALLBACK;
        } else {
            filmGrid.innerHTML = '<p class="cat-error">Не удалось загрузить данные. Откройте сайт через Live Server.</p>';
            return;
        }
    }
    renderFilmsList(filmsData);
}

/* ---------- List ---------- */

function renderFilmsList(films) {
    filmGrid.innerHTML = '';
    countEl.textContent = `Найдено: ${films.length}`;

    if (films.length === 0) {
        filmGrid.innerHTML = '<p class="cat-error">Ничего не нашлось. Попробуйте другое слово.</p>';
        return;
    }

    films.forEach(film => {
        const card = document.createElement('div');
        card.className = 'cat-card';
        card.tabIndex = 0;
        card.innerHTML = `
        <div class="cat-pic">
            <img src="${film.image}" alt="Обложка: ${film.name}" loading="lazy">
            <span class="cat-badge">${film.wins}</span>
        </div>
        <div class="cat-info">
            <h3 class="cat-title">${film.name}</h3>
            <p class="cat-sub">${film.year} · ${film.specs['Режиссёр']}</p>
            <p class="cat-rating">IMDb ${film.rating.toFixed(1)}</p>
        </div>
        `;
        card.addEventListener('click', () => showFilmDetail(film.id));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') showFilmDetail(film.id);
        });
        filmGrid.appendChild(card);
    });
}

/* поиск по названию, оригинальному названию и режиссёру */
searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const result = filmsData.filter(film =>
        film.name.toLowerCase().includes(q) ||
        film.original.toLowerCase().includes(q) ||
        film.specs['Режиссёр'].toLowerCase().includes(q)
    );
    renderFilmsList(result);
});

/* ---------- Detail ---------- */

function showFilmDetail(film_id) {
    const film = filmsData.find(f => f.id === film_id);
    if (!film) return;

    const specsList = Object.entries(film.specs)
        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
        .join('');

    const awardsList = film.awards
        .map(a => `<li><strong>${a.category}</strong><span>${a.winner}</span></li>`)
        .join('');

    const castList = film.cast
        .map(p => `<li><strong>${p.name}</strong> <span class="role">${p.role}</span></li>`)
        .join('');

    const trailerLink = film.trailer
        ? `<a class="btn ghost" href="${film.trailer}" target="_blank" rel="noopener">Трейлер на YouTube</a>`
        : '';

    detailCard.innerHTML = `
    <div class="detail-layout">
        <img src="${film.image}" alt="${film.name}" class="detail-img">
        <div class="detail-body">
            <p class="label">${film.year} · ${film.wins} из ${film.nominations} номинаций</p>
            <h2 id="detail-title">${film.name}</h2>
            <p class="detail-orig">${film.original}</p>
            <p class="detail-desc">${film.description}</p>

            <div class="detail-specs">
                <strong>Основное</strong>
                <ul>${specsList}</ul>
            </div>

            <div class="detail-rates">
                <div><span>IMDb</span><b>${film.ratings.imdb}</b></div>
                <div><span>Кинопоиск</span><b>${film.ratings.kinopoisk}</b></div>
                <div><span>Rotten Tomatoes</span><b>${film.ratings.rottenTomatoes}</b></div>
            </div>

            <div class="detail-specs">
                <strong>В ролях</strong>
                <ul>${castList}</ul>
            </div>

            <details class="detail-awards">
                <summary>Награды (${film.awards.length})</summary>
                <ul>${awardsList}</ul>
            </details>

            <div class="detail-actions">
                <a class="btn" href="${film.page}">Страница фильма</a>
                ${trailerLink}
            </div>
        </div>
    </div>
    `;

    detailSection.classList.remove('hidden'); // модалка
    document.body.classList.add('modal-open');
    detailSection.querySelector('.modal-content').scrollTop = 0;
}

function closeDetail() {
    detailSection.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

closeBtn.addEventListener('click', closeDetail);
detailSection.addEventListener('click', (e) => {
    if (e.target === detailSection) closeDetail();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
});

document.addEventListener('DOMContentLoaded', loadFilms);
