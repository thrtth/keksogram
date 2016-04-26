/* global Backbone: true */

'use strict';

define([
  'models/photo'
], function() {
  var VideoView = Backbone.View.extend({
    events: {
      'click video': '_onClick'
    },

    initialize: function() {
      this._onClick = this._onClick.bind(this);
    },

    render: function() {
      var videoElement = this.el.querySelector('video');
      videoElement.src = this.model.get('url');
      videoElement.poster = this.model.get('preview');
      videoElement.loop = true;
      videoElement.autoplay = true;
      videoElement.controls = 'controls';
      this.el.querySelector('.likes-count').innerText = this.model.get('likes');
      this.el.querySelector('.comments-count').innerText = this.model.get('comments');

    },

    toggleLike: function() {
      if (this.model.get('liked')) {
        this.model.dislike();
        this.el.querySelector('.likes-count').classList.remove('likes-count-liked');
      } else {
        this.model.like();
        this.el.querySelector('.likes-count').classList.add('likes-count-liked');
      }
    },

    _onClick: function(evt) {
      evt.preventDefault();
      this.toggleLike();

    }

  });

  return VideoView;
});
