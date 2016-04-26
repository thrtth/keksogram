/* global Backbone: true */

'use strict';

define([
  'views/photo-preview',
  'views/video-preview'
], function(GalleryView, VideoView) {
  /**
   * Коды клавиш для обработки
   * @enum {number}
   */
  var Key = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };

  /**
   * Конструктор объекта фотогалереи
   * @constructor
   */
  var Gallery = function() {
    this._photosCollection = new Backbone.Collection();
    this._photoElement = document.querySelector('.gallery-overlay-preview');
    this._imgElement = this._photoElement.querySelector('img');
    this._galleryElement = document.querySelector('.gallery-overlay');
    this._closeButton = this._galleryElement.querySelector('.gallery-overlay-close');

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  };

  /**
   * Записывает список фотографий для галереи в коллекцию
   * @param  {Collection} photos
   */
  Gallery.prototype.setPhotos = function(photos) {
    this._photosCollection = photos;
  };

  /**
   * Показывает фото в галерее
   * @param  {Model} photoModel
   */
  Gallery.prototype.showPhoto = function(photoModel) {
    this._index = this._photosCollection.indexOf(photoModel);
    this._currentPhoto = photoModel;

    this._galleryElement.classList.remove('invisible');
    this._closeButton.addEventListener('click', this._onCloseClick);
    document.body.addEventListener('keydown', this._onDocumentKeyDown);

    if (this._currentPhoto.isVideo()) {
      var videoElement = document.createElement('video');
      this._photoElement.insertBefore(videoElement, this._photoElement.firstChild);
      this._imgElement.classList.remove('gallery-overlay-image');
      this._imgElement.src = '';

      var galleryElement = new VideoView({
        model: this._currentPhoto,
        el: this._photoElement
      });
    } else {
      galleryElement = new GalleryView({
        model: this._currentPhoto,
        el: this._photoElement
      });
    }

    galleryElement.render();
  };

  /**
   * Прячет галерею и убирает обработчик закрытия галереи
   */
  Gallery.prototype.hide = function() {
    this._galleryElement.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    document.body.removeEventListener('keydown', this._onDocumentKeyDown);
    if (this._currentPhoto.isVideo()) {
      var videoElement = this._photoElement.querySelector('video');
      this._photoElement.removeChild(videoElement);
      this._imgElement.classList.add('gallery-overlay-image');
    }
  };

  /**
   * Обработчик нажатия клавиш ESC, влево и вправо
   * @param {Event} evt
   * @private
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    switch (evt.keyCode) {
      case Key.ESC:
        this.hide();
        break;
      case Key.LEFT:
        this.hide();
        this.showPhoto(this._photosCollection.at(this._index - 1));
        break;
      case Key.RIGHT:
        this.hide();
        this.showPhoto(this._photosCollection.at(this._index + 1));
        break;
      default: break;
    }
  };

  /**
   * Обработчик закрытия галереи
   * @param  {Event} evt
   * @private
   */
  Gallery.prototype._onCloseClick = function(evt) {
    evt.preventDefault();
    this.hide();
  };

  return Gallery;
});
