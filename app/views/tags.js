var _ = require('lodash'),
  CollectionView = require('backbone.collectionview'),
  TagView = require('../views/tag.js'),
  Chosen = require('chosen');

module.exports = CollectionView.extend({
  el: '[name="tags"]',
  selectable: false,
  itemView: TagView,
  preSelected: [],

  events: {
    'change': 'onChange'
  },

  chosen: function () {
    _.bindAll(this);
    var self = this;

    var chosen = this.$el.chosen({
      no_results_text: 'Add New Tag'
    });

    this.$chosen = this.$el.parent().find('.chosen-container');
    this.$chosen.find('input').val('');

    this.$chosen.on('keydown', this.onKeyDown);
    this.$chosen.on('click', this.onClick);

    this.$el.on('change', function (e, change) {
      var tag = change.selected || change.unselected;
      var selected = (!_.isUndefined(change.selected));
      var model = self.collection.findWhere({ tag: tag });

      if (!model) return;
      model.set('selected', selected);
    });
  },

  refreshChosen: function () {
    _(function () {
      this.$el.trigger('chosen:updated');
      this.$el.trigger('chosen:activate');
    }).bind(this).delay(0);
  },

  addTag: function () {
    var newTag = {
      tag: this.$chosen.find('input').val(),
      count: 1,
      selected: true
    };

    this.collection.add(newTag);
    this.refreshChosen();
  },

  selectTag: function (model) {
    model.set('selected', true);
    this.$el.find('[value="' + model.get('tag') + '"]').prop('selected', true);
    this.refreshChosen();
  },

  serialize: function() {
    var $options = this.$el.find(':selected');
    return _.map($options, function(option){
      return option.value || option.text;
    });
  },

  onClick: function (e) {
    if ($(e.toElement).hasClass('no-results')) {
      this.addTag();
    }
  },

  onKeyDown: function (e) {
    var $target = $(e.delegateTarget);
    var match = this.collection.findWhere({ tag: $.trim($target.find('input').val()) });

    if ((e.keyCode == 13 || e.keyCode == 32) && _.isEmpty(match)) {
      this.addTag();
    } else if (e.keyCode == 32 && !_.isEmpty(match)) {
      this.selectTag(match);
    }

    if (e.keyCode == 27) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

});