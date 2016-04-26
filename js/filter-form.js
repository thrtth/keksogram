'use strict';

define(function() {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];

  var previewImage = filterForm.querySelector('.filter-image-preview');
  var prevButton = filterForm['filter-prev'];
  var selectedFilter = filterForm['upload-filter'];

  var filterNone = filterForm['upload-filter-none'];
  var filterChrome = filterForm['upload-filter-chrome'];
  var filterSepia = filterForm['upload-filter-sepia'];

  var filterMap;

  function restoreFiltersValue() {
    if (docCookies.hasItem('filter')) {
      switch (docCookies.getItem('filter')) {
        case 'chrome':
          filterChrome.checked = true;
          break;
        case 'sepia':
          filterSepia.checked = true;
          break;
        case 'none':
        default:
          filterNone.checked = true;
          break;
      }
    }
  }

  function setFilter() {
    if (!filterMap) {
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    previewImage.className = 'filter-image-preview' + ' ' + filterMap[selectedFilter.value];
  }

  restoreFiltersValue();

  for (var i = 0, l = selectedFilter.length; i < l; i++) {
    selectedFilter[i].onchange = function() {
      setFilter();
    };
  }

  prevButton.onclick = function(evt) {
    evt.preventDefault();

    filterForm.reset();
    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    uploadForm.classList.remove('invisible');
    filterForm.classList.add('invisible');

    if (filterSepia.checked) {
      docCookies.setItem('filter', filterSepia.value);
    } else if (filterChrome.checked) {
      docCookies.setItem('filter', filterChrome.value);
    } else {
      docCookies.setItem('filter', filterNone.value);
    }

    filterForm.submit();

  };

  setFilter();
});




