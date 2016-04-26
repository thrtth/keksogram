'use strict';

define([
  'resize-picture'
], function(Resizer) {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];
  var filterForm = document.forms['upload-filter'];
  var prevButton = resizeForm['resize-prev'];
  var offsetLeft = resizeForm['resize-x'];
  var offsetTop = resizeForm['resize-y'];
  var sizeValue = resizeForm['resize-size'];

  /**
  * Обработчик события создания фото в форме кадрирования
  */
  window.addEventListener('imagecreated', function() {
    var imageConstraint = Resizer.instance.getConstraint();

    offsetLeft.value = imageConstraint.x;
    offsetTop.value = imageConstraint.y;
    sizeValue.value = imageConstraint.side;

    offsetLeft.min = 0;
    offsetTop.min = 0;
    sizeValue.min = 50;
  });

  /**
  * Обработчик события изменения рамки кадрирования
  */
  window.addEventListener('resizerchange', function() {
    var imageConstraint = Resizer.instance.getConstraint();
    var x = imageConstraint.x;
    var y = imageConstraint.y;
    var maxValueX = x + imageConstraint.side;
    var maxValueY = y + imageConstraint.side;
    var imageSize = Resizer.instance.getImageSize();
    var redrawNeed = false;

    if (x < 0) {
      offsetLeft.value = 0;
      redrawNeed = true;
    }

    if (maxValueX > imageSize.width) {
      offsetLeft.value = imageSize.width - imageConstraint.side;
      redrawNeed = true;
    }

    if (y < 0) {
      offsetTop.value = 0;
      redrawNeed = true;
    }

    if (maxValueY > imageSize.height) {
      offsetTop.value = imageSize.height - imageConstraint.side;
      redrawNeed = true;
    }

    if (redrawNeed) {
      Resizer.instance.setConstraint(offsetLeft.value, offsetTop.value, sizeValue.value);
    }

    offsetLeft.value = imageConstraint.x;
    offsetTop.value = imageConstraint.y;
  });

  /**
   * Обработчик ввода значения в поле "Сторона"
   */
  sizeValue.onchange = function() {
    var imageSize = Resizer.instance.getImageSize();

    if (imageSize.height < imageSize.width) {
      sizeValue.max = imageSize.height;
    } else {
      sizeValue.max = imageSize.width;
    }

    if (offsetLeft.value >= imageSize.width - sizeValue.value) {
      offsetLeft.value = imageSize.width - sizeValue.value;
    }

    if (offsetLeft.value < 0) {
      offsetLeft.value = 0;
    }

    if (offsetTop.value >= imageSize.height - sizeValue.value) {
      offsetTop.value = imageSize.height - sizeValue.value;
    }

    if (offsetTop.value < 0) {
      offsetTop.value = 0;
    }

    if (sizeValue.value > sizeValue.max) {
      sizeValue.value = sizeValue.max;
    }

    Resizer.instance.setConstraint(offsetLeft.value, offsetTop.value, sizeValue.value);
  };

  /**
   * Обработчик ввода значения в поле "Слева"
   */
  offsetLeft.onchange = function() {
    var imageSize = Resizer.instance.getImageSize();
    offsetLeft.max = imageSize.width - sizeValue.value;
    Resizer.instance.setConstraint(offsetLeft.value, offsetTop.value, sizeValue.value);
  };

  /**
   * Обработчик ввода значения в поле "Сверху"
   */
  offsetTop.onchange = function() {
    var imageSize = Resizer.instance.getImageSize();
    offsetTop.max = imageSize.height - sizeValue.value;
    Resizer.instance.setConstraint(offsetLeft.value, offsetTop.value, sizeValue.value);
  };

  /**
   * Обработчик клика на кнопке назад
   */
  prevButton.onclick = function(evt) {
    evt.preventDefault();

    resizeForm.reset();
    uploadForm.reset();
    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработчик клика на кнопке вперед
   */
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    var image = Resizer.instance.exportImage();

    filterForm.elements['filter-image-src'].src = image.src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  };


});
