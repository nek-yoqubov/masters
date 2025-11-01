// Последовательное появление изображений
function animateImages() {
    const items = document.querySelectorAll('.gallery img, .gallery .gallery-video');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('loaded');
        }, index * 100); // Задержка 100ms для каждого изображения
    });
}
// Вызываем анимацию при загрузке страницы
window.addEventListener('load', () => {
    animateImages();
    const galleryVideos = document.querySelectorAll('.gallery-video');
    galleryVideos.forEach(v => {
        v.addEventListener('loadedmetadata', () => {
            v.currentTime = 0;
            v.pause();
        });
    });
});
// Модальное окно и навигация
let currentImageIndex = 0;
let isZoomed = false;
const galleryItems = document.querySelectorAll('.gallery img, .gallery .gallery-item');
const modal = document.getElementById('modal');
const carouselTrack = document.getElementById('carousel-track');
const zoomLevel = 2;
const isTouchDevice = 'ontouchstart' in window;
const actionButtons = document.querySelectorAll('.action-btn');
const themeToggle = document.querySelector('.theme-toggle');
let touchStartX = 0;
let touchEndX = 0;
let lastTap = 0;
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const isVideoMode = item.tagName === 'DIV';
        currentImageIndex = index;
        buildCarousel(isVideoMode);
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Запрещаем скролл фона
        // Скрываем кнопки при открытии модального окна
        actionButtons.forEach(btn => btn.classList.add('hidden'));
        themeToggle.classList.add('hidden');
    });
});
function buildCarousel(isVideoMode) {
    carouselTrack.innerHTML = '';
    const slides = [];
    const items = Array.from(galleryItems).filter(it => (it.tagName === 'DIV') === isVideoMode);
    const localIndex = items.findIndex(it => it === galleryItems[currentImageIndex]);
    currentImageIndex = localIndex;
    items.forEach((galleryItem) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        let media;
        if (galleryItem.tagName === 'DIV') {
            media = document.createElement('video');
            media.src = galleryItem.dataset.src;
            media.controls = true;
            media.muted = true;
            media.loading = 'eager';
            media.addEventListener('volumechange', () => {
                media.muted = true;
            });
            media.addEventListener('ended', () => {
                changeImage(1);
            });
        } else {
            media = document.createElement('img');
            media.src = galleryItem.src;
            media.alt = galleryItem.alt;
            media.loading = 'eager';
        }
        slide.appendChild(media);
        slides.push(slide);
        // Обработка зума для ПК (двойной клик)
        if (media.tagName === 'IMG' && !isTouchDevice) {
            media.addEventListener('dblclick', (e) => {
                isZoomed = !isZoomed;
                if (isZoomed) {
                    const rect = media.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    media.style.transform = `scale(${zoomLevel})`;
                    media.style.cursor = 'zoom-out';
                    media.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
                } else {
                    media.style.transform = 'scale(1)';
                    media.style.cursor = 'zoom-in';
                    media.style.transformOrigin = 'center';
                }
            });
            media.addEventListener('mousemove', (e) => {
                if (isZoomed) {
                    const rect = media.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    media.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
                }
            });
        }
        // Обработка двойного касания для мобильных
        if (media.tagName === 'IMG' && isTouchDevice) {
            media.addEventListener('touchstart', (e) => {
                const now = new Date().getTime();
                const timeSinceLastTap = now - lastTap;
                lastTap = now;
                if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
                    // Двойное касание
                    isZoomed = !isZoomed;
                    if (isZoomed) {
                        const rect = media.getBoundingClientRect();
                        const touch = e.touches[0];
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        media.style.transform = `scale(${zoomLevel})`;
                        media.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
                    } else {
                        media.style.transform = 'scale(1)';
                        media.style.transformOrigin = 'center';
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
        playCurrentMedia();
    }, 0);
}
function changeImage(direction) {
    currentImageIndex += direction;
    carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
    carouselTrack.addEventListener('transitionend', () => {
        const itemsLength = carouselTrack.children.length - 2; // без клонов
        if (currentImageIndex === 0) {
            carouselTrack.style.transition = 'none';
            currentImageIndex = itemsLength;
            carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
            setTimeout(() => {
                carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            }, 0);
        } else if (currentImageIndex === itemsLength + 1) {
            carouselTrack.style.transition = 'none';
            currentImageIndex = 1;
            carouselTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
            setTimeout(() => {
                carouselTrack.style.transition = 'transform 0.5s ease-in-out';
            }, 0);
        }
        playCurrentMedia();
    }, {once: true});
}
function playCurrentMedia() {
    const slides = carouselTrack.children;
    Array.from(slides).forEach((slide, idx) => {
        const vid = slide.querySelector('video');
        if (vid) {
            if (idx === currentImageIndex) {
                vid.play();
            } else {
                vid.pause();
                vid.currentTime = 0;
            }
        }
    });
}
function pauseAllVideos() {
    document.querySelectorAll('.carousel-slide video').forEach(v => {
        v.pause();
    });
}
function closeModal() {
    modal.style.display = 'none';
    isZoomed = false;
    pauseAllVideos();
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