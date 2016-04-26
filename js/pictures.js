'use strict';

requirejs.config({
  baseUrl: 'js',
  urlArgs: 'bust=' + (new Date()).getTime()
});

define([
  'gallery',
  'models/photo',
  'models/photos',
  'views/photo',

  'filter-form',
  'logo-background',
  'upload-form',
  'resize-picture',
  'resize-form'
], function(Gallery, PhotoModel, PhotosCollection, PhotoView) {
  var filters = document.querySelector('.filters');

  /**
   * Контейнер для фотографий
   * @type {Element}
   */
  var photosContainer = document.querySelector('.pictures');

  /**
   * @const
   * @type {number}
   */
  var REQUEST_FAILURE_TIMEOUT = 10000;

  /**
   * @const
   * @type {number}
   */
  var PAGE_SIZE = 12;

  /**
   * @const
   * @type {string}
   */
  var REG_EXP = /^#filters\/(\S+)$/;
  var currentPage = 0;

  var photosCollection = new PhotosCollection();
  var initiallyLoaded = [];
  var renderedViews = [];

  /**
   * Объект типа фотогалерея
   * @type {Gallery}
   */
  var gallery = new Gallery();

  var filterForm = document.forms['filters-set'];
  var filterPopular = filterForm['filter-popular'];
  var filterNew = filterForm['filter-new'];
  var filterDiscussed = filterForm['filter-discussed'];

  filters.classList.add('hidden');

  /**
   * Берет из хэша адресной строки значение фильтра и устанавливает его
   */
  function parseURL() {
    var stringFromHash = location.hash;
    var filterName = stringFromHash.match(REG_EXP);
    if (filterName) {
      setActiveFilter(filterName[1] || 'popular');
    }
    lotSpace();
  }

  /**
   * Устанавливает подсветку фильтра
   */
  function restoreFiltersCheckingMark() {
    var filterName = location.hash.match(REG_EXP) || 'popular';
    if (filterName[1]) {
      switch (filterName[1]) {
        case 'new':
          filterNew.checked = true;
          break;
        case 'discussed':
          filterDiscussed.checked = true;
          break;
        case 'popular':
        default:
          filterPopular.checked = true;
          break;
      }
    }
  }

  /**
   * Выводит фотографии постранично
   * @param  {number} pageNumber
   * @param  {boolean} replace
   */
  function renderPhotos(pageNumber, replace) {
    replace = typeof replace !== 'undefined' ? replace : true;
    pageNumber = pageNumber || 0;

    if (replace) {
      while (renderedViews.length) {
        var viewToRemove = renderedViews.shift();

        photosContainer.removeChild(viewToRemove.el);
        photosContainer.classList.remove('pictures-failure');
        viewToRemove.off('galleryclick');
        viewToRemove.remove();
      }
    }

    var photosFragment = document.createDocumentFragment();

    var photosFrom = pageNumber * PAGE_SIZE;
    var photosTo = photosFrom + PAGE_SIZE;

    var photosTemplate = document.getElementById('picture-template');

    photosCollection.slice(photosFrom, photosTo).forEach(function(model) {
      var view = new PhotoView({
        model: model,
        el: photosTemplate.content.children[0].cloneNode(true)
      });
      view.render();
      photosFragment.appendChild(view.el);
      renderedViews.push(view);
      view.on('galleryclick', function() {
        gallery.setPhotos(photosCollection);
        gallery.showPhoto(view.model);
      });
    });
    photosContainer.appendChild(photosFragment);
  }

  /**
   * Добавляет класс ошибки, если ошибка загрузки фотографии
   */
  function showLoadFailure() {
    photosContainer.classList.add('pictures-failure');
  }

  /**
   * Сравнение по дате фотографии
   */
  function comparePhotosByDate(aPhoto, bPhoto) {
    return Date.parse(bPhoto.date) - Date.parse(aPhoto.date);
  }

  /**
   * Сравнение по количеству коментариев
   */
  function comparePhotosByDiscuss(aPhoto, bPhoto) {
    return bPhoto.comments - aPhoto.comments;
  }

  /**
   * Сравнение по количеству лайков
   */
  function comparePhotosByPopularity(aPhoto, bPhoto) {
    return bPhoto.likes - aPhoto.likes;
  }

  /**
   * Фильтрация фотографий
   * @param  {string} filterValue
   * @return {Array}
   */
  function filterPhotos(filterValue) {
    var filteredPhotos = initiallyLoaded.slice(0);
    switch (filterValue) {
      case 'discussed':
        filteredPhotos = filteredPhotos.sort(comparePhotosByDiscuss);
        break;

      case 'new':
        filteredPhotos = filteredPhotos.sort(comparePhotosByDate);
        break;

      case 'popular':
      default:
        filteredPhotos = filteredPhotos.sort(comparePhotosByPopularity);
        break;

    }
    photosCollection.reset(filteredPhotos);
    return filteredPhotos;
  }

  /**
   * Устанавливает фильтр фотографий
   * @param {string} filterValue
   */
  function setActiveFilter(filterValue) {
    filterPhotos(filterValue);
    currentPage = 0;
    renderPhotos(currentPage++, true);
    lotSpace();
  }

  /**
   * Обработчик события клика по фильтру
   */
  function initFilters() {
    filters.addEventListener('click', function(evt) {
      var clickedFilter = evt.target;
      location.hash = 'filters/' + clickedFilter.value;
      clickedFilter.checked = true;
    });
  }

  /**
   * Проверка доступности следующей страницы для отрисовки
   * @return {boolean}
   */
  function isNextPageAvailable() {
    return currentPage < Math.ceil(photosCollection.length / PAGE_SIZE);
  }

  /**
   * Проверка нахождения внизу страницы.
   * @return {boolean}
   */
  function isAtTheBottom() {
    var GAP = 100;
    return photosContainer.getBoundingClientRect().bottom - GAP <= window.innerHeight;
  }

  /**
   * Испускает на объекте window событие loadneeded если скролл находится внизу
   * страницы и существует возможность показать еще одну страницу.
   */
  function checkNextPage() {
    if (isAtTheBottom() && isNextPageAvailable()) {
      window.dispatchEvent(new CustomEvent('loadneeded'));
    }
  }

  /**
   * Создает два обработчика событий: на прокручивание окна, который в оптимизированном
   * режиме (раз в 100 миллисекунд скролла) проверяет можно ли отрисовать следующую страницу;
   * и обработчик события loadneeded, который вызывает функцию отрисовки следующей страницы.
   */
  function initScroll() {
    var someTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(someTimeout);
      someTimeout = setTimeout(checkNextPage, 100);
    });

    window.addEventListener('loadneeded', function() {
      renderPhotos(currentPage++, false);
    });
  }

  /**
   * Проверяет есть ли еще место до конца страницы и вызывает отрисовку страницы
   */
  function lotSpace() {
    if (photosContainer.getBoundingClientRect().bottom < window.innerHeight) {
      renderPhotos(currentPage++, false);
    }
  }

  photosCollection.fetch({timeout: REQUEST_FAILURE_TIMEOUT}).success(function(loaded, state, jqXHR) {
    initiallyLoaded = jqXHR.responseJSON;

    window.addEventListener('hashchange', function() {
      parseURL();
    });

    initFilters();
    initScroll();
    parseURL();
    lotSpace();

  }).fail(function() {
    showLoadFailure();
  });

  filters.classList.remove('hidden');
  restoreFiltersCheckingMark();

});
