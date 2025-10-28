// Последовательное появление изображений
function animateImages() {
    const images = document.querySelectorAll('.gallery img');
    images.forEach((img, index) => {
        setTimeout(() => {
            img.classList.add('loaded');
        }, index * 100); // Задержка 100ms для каждого изображения
    });
}

// Вызываем анимацию при загрузке страницы
window.addEventListener('load', animateImages);

// Модальное окно и навигация
let currentImageIndex = 0;
let isZoomed = false;
const galleryImages = document.querySelectorAll('.gallery img');
const modal = document.getElementById('modal');
const carouselTrack = document.getElementById('carousel-track');
const zoomLevel = 2;
const isTouchDevice = 'ontouchstart' in window;
const actionButtons = document.querySelectorAll('.action-btn');
const themeToggle = document.querySelector('.theme-toggle');
let touchStartX = 0;
let touchEndX = 0;
let lastTap = 0;

galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => {
        currentImageIndex = index;
        buildCarousel();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Запрещаем скролл фона
        // Скрываем кнопки при открытии модального окна
        actionButtons.forEach(btn => btn.classList.add('hidden'));
        themeToggle.classList.add('hidden');
    });
});

function buildCarousel() {
    carouselTrack.innerHTML = '';
    const slides = [];
    galleryImages.forEach((galleryImg, index) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        const img = document.createElement('img');
        img.src = galleryImg.src;
        img.alt = galleryImg.alt;
        img.loading = 'eager';
        slide.appendChild(img);
        slides.push(slide);

        // Обработка зума для ПК (двойной клик)
        if (!isTouchDevice) {
            img.addEventListener('dblclick', (e) => {
                isZoomed = !isZoomed;
                if (isZoomed) {
                    const rect = img.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    img.style.transform = `scale(${zoomLevel})`;
                    img.style.cursor = 'zoom-out';
                    img.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
                } else {
                    img.style.transform = 'scale(1)';
                    img.style.cursor = 'zoom-in';
                    img.style.transformOrigin = 'center';
                }
            });

            img.addEventListener('mousemove', (e) => {
                if (isZoomed) {
                    const rect = img.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    img.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
                }
            });
        }

        // Обработка двойного касания для мобильных
        if (isTouchDevice) {
            img.addEventListener('touchstart', (e) => {
                const now = new Date().getTime();
                const timeSinceLastTap = now - lastTap;
                lastTap = now;

                if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
                    // Двойное касание
                    isZoomed = !isZoomed;
                    if (isZoomed) {
                        const rect = img.getBoundingClientRect();
                        const touch = e.touches[0];
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        img.style.transform = `scale(${zoomLevel})`;
                        img.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
                    } else {
                        img.style.transform = 'scale(1)';
                        img.style.transformOrigin = 'center';
                    }
                    e.preventDefault();
                }
            });
        }
    });

    // Для бесконечного цикла: добавляем последнюю слайду в начало и первую в конец
    carouselTrack.appendChild(slides[slides.length - 1].cloneNode(true));
    slides.forEach(slide => carouselTrack.appendChild(slide));
    carouselTrack.appendChild(slides[0].cloneNode(true));

    // Устанавливаем начальную позицию
    currentImageIndex += 1; // Сдвиг из-за добавленной слайды в начало
    carouselTrack.style.transition = 'none';
    carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
    setTimeout(() => {
        carouselTrack.style.transition = 'transform 0.5s ease-in-out';
    }, 0);
}

function changeImage(direction) {
    currentImageIndex += direction;
    carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;

    carouselTrack.addEventListener('transitionend', () => {
        if (currentImageIndex === 0) {
            carouselTrack.style.transition = 'none';
            currentImageIndex = galleryImages.length;
            carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
            setTimeout(() => {
                carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            }, 0);
        } else if (currentImageIndex === galleryImages.length + 1) {
            carouselTrack.style.transition = 'none';
            currentImageIndex = 1;
            carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
            setTimeout(() => {
                carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            }, 0);
        }
    }, {once: true});
}

function closeModal() {
    modal.style.display = 'none';
    isZoomed = false;
    document.body.style.overflow = ''; // Восстанавливаем скролл фона
    // Показываем кнопки при закрытии модального окна
    if (window.scrollY > 300) {
        actionButtons.forEach(btn => {
            if (btn.classList.contains('scroll-top')) {
                btn.classList.add('show');
                btn.classList.remove('hidden');
            }
        });
    }
    themeToggle.classList.remove('hidden');
    updateActionButtonsVisibility();
}

// Закрытие модального окна по клику вне изображения
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('close')) {
        closeModal();
    }
});

// Поддержка стрелок клавиатуры
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') {
            changeImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeImage(1);
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }
});

// Swipe для мобильных устройств
modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (window.visualViewport.scale <= 1) { // Свайп только при зуме 100%
        if (touchStartX - touchEndX > 50) {
            changeImage(1); // Swipe влево -> следующее
        } else if (touchEndX - touchStartX > 50) {
            changeImage(-1); // Swipe вправо -> предыдущее
        }
    }
});

// Более плавная и быстрая прокрутка наверх
function scrollToTop() {
    const scrollStep = -window.scrollY / (500 / 15); // Длительность ~0.5s
    const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
            window.scrollBy(0, scrollStep);
        } else {
            clearInterval(scrollInterval);
        }
    }, 15);
}

// Управление видимостью кнопок
function updateActionButtonsVisibility() {
    const contactsSection = document.getElementById('contacts');
    const rect = contactsSection.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

    actionButtons.forEach(btn => {
        if (isVisible && !btn.classList.contains('scroll-top')) {
            btn.classList.add('hidden');
        } else if (!isVisible && !btn.classList.contains('scroll-top')) {
            btn.classList.remove('hidden');
        }
    });
}

window.addEventListener('scroll', () => {
    if (modal.style.display !== 'flex') {
        if (window.scrollY > 300) {
            actionButtons.forEach(btn => {
                if (btn.classList.contains('scroll-top')) {
                    btn.classList.add('show');
                    btn.classList.remove('hidden');
                }
            });
        } else {
            actionButtons.forEach(btn => {
                if (btn.classList.contains('scroll-top')) {
                    btn.classList.remove('show');
                    btn.classList.add('hidden');
                }
            });
        }
        updateActionButtonsVisibility();
    }
});

// Переключатель темы
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.innerHTML = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}