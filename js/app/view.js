define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/container.html',
    'text!template/project.html',
    'text!template/user.html'
], function($, _, Backbone, containerTemplate, repoTemplate, userTemplate) {

    var RepoView = Backbone.View.extend({
        template : _.template(repoTemplate),

        class : 'project',

        initialize: function() {
            _.bindAll(this);
            this.render();
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var UserView = Backbone.View.extend({
        template : _.template(userTemplate),

        class : 'user',

        initialize: function() {
            _.bindAll(this);
            this.render();
            console.log(this);
        },

        render: function() {
            this.$el.html(this.template({'user' : this.model.toJSON()}));
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

        addOneRepo: function(repo) {
            if ((this.model.get('local_data') || !repo.get('fork')) && repo.get('show')) {

                var el = '<div class="project"></div>'

                var repoView = new RepoView({
                        model : repo,
                        el : el
                });

                this.$el.find('.holder').append(repoView.el);
            }
        },

        addUser: function(user) {
            var $el = this.$el.find('.user')

            var userView = new UserView({
                model : user,
                $el : $el
            });

            $el.html(userView.el);
        },

        render: function() {
            console.log('RENDER MAIN');
            console.log(this.model.toJSON());

            this.$el.css('opacity', 0).html(this.template(this.model.toJSON()));
            this.addUser(this.model.get('user'));
            this.model.get('repos').each(this.addOneRepo);

            $('#shell').html(this.$el.fadeTo('375', 1));
            return this;
        }
    });

    return MainView;
});




        