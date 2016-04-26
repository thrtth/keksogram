/* global Backbone: true */

'use strict';

define(function() {
  /**
   * @constructor
   * @extends {Backbone.Model}
   */
  var PhotoModel = Backbone.Model.extend({
    initialize: function() {
      this.set('liked', false);
    },

    like: function() {
      this.set({
        liked: true,
        likes: this.get('likes') + 1
      });
    },

    dislike: function() {
      this.set({
        liked: false,
        likes: this.get('likes') - 1
      });
    },

    isVideo: function() {
      return typeof this.get('preview') !== 'undefined';
    }
  });

  return PhotoModel;

});
