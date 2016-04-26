'use strict';

define([
  'resize-picture'
], function(Resizer) {
  var uploadForm = document.forms['upload-select-image'];
  var resizeForm = document.forms['upload-resize'];

  var fileElement = uploadForm['upload-file'];
  var resizer;

  function uploadImage(element, callback) {
    var fileReader = new FileReader();
    fileReader.onload = function(evt) {
      var image = evt.target.result;
      callback(image);
    };

    fileReader.readAsDataURL(element.files[0]);
  }

  fileElement.onchange = function() {
    if (fileElement.value) {
      fileElement.classList.add('upload-input-hasvalue');
    }
  };

  uploadForm.onsubmit = function(evt) {
    evt.preventDefault();

    uploadImage(fileElement, function(image) {
      sessionStorage.setItem('uploaded-image', image);

      if (typeof resizer !== 'undefined') {
        resizer.remove();
      }

      resizer = new Resizer(image);
      Resizer.instance = resizer;
      resizer.setElement(resizeForm);

      uploadForm.classList.add('invisible');
      resizeForm.classList.remove('invisible');

    });
  };

  uploadForm.onreset = function() {
    fileElement.classList.remove('upload-input-hasvalue');
  };
});
