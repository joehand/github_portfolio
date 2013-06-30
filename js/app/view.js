define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/container.html',
    'text!template/project.html'
], function($, _, Backbone, containerTemplate, repoTemplate) {

    var RepoView = Backbone.View.extend({
        template : _.template(repoTemplate),

        class : 'project',

        initialize: function() {
            _.bindAll(this);
            this.render();
        },

        render: function() {
            //console.log(this.model.toJSON());
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });



    var MainView = Backbone.View.extend({
        template : _.template(containerTemplate),

        initialize: function() {
            _.bindAll(this);
            //watch for our model to be ready then render if its is
            this.model.on("change:ready", function() {
                if (this.model.get('ready')) {
                    this.render()
                }
            }, this);
        },

        addOneProject: function(repo) {
            if ((this.model.get('local_data') || !repo.get('fork')) && repo.get('show')) {
                var repoView = new RepoView({
                        model : repo
                });

                this.$el.find('.holder').append(repoView.$el);
            }
        },

        render: function() {
            console.log('RENDER MAIN');
            console.log(this.model.toJSON());

            this.$el.css('opacity', 0).html(this.template(this.model.toJSON()));
            this.model.get('repos').each(this.addOneProject);

            $('#shell').html(this.$el.fadeTo('375', 1));
            return this;
        }
    });

    return MainView;
});




        