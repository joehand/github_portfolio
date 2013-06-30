define([ 'jquery', 'backbone'], function($, Backbone) {
    var MainModel = Backbone.Model.extend({
        url: '/github_data.json',

        initialize : function(attrs, options) {
            console.log(this);
            var main = this;

            this.config = options;
            this.on('change:local_data', this.checkDataReady);

            this.fetch({
                success: function(data, resp) {
                    $.extend(resp.user, attrs.user);
                    $.extend(resp.repos, attrs.repos);

                    //init models with all the local data
                    main.initModels(resp.user, resp.repos)
                    main.set('local_data', true);
                },
                error: function() {
                    // no local data, will just use github api
                    console.warn('no local data, asking github');
                    main.set('local_data', false);

                    // init models so we can change urls and fetch
                    main.initModels(attrs.user, attrs.repos);
                    main.fetchRemoteData();
                }
            });
        },

        initModels : function(user, repos) {
            this.set('user', new User(user));
            this.set('repos', new Repos(repos));
        },

        checkDataReady : function() {
            if (this.get('local_data')) {
                this.set('ready', true);
            } else {
                //Going to have to fetch remote data
                //Make sure we have it all before being ready
                this.set('remote_fetched', 0);
                this.on('change:remote_fetched', function() {
                    // we want 2 things
                    if (this.get('remote_fetched') == 2) {
                        this.set('ready', true);
                    }
                }, this);
            }
        },

        fetchRemoteData : function() {
            var main = this,
                remote_url = 'https://api.github.com/users/' + this.config.github_user;


            // update to use github API urls
            this.get('user').url = remote_url;
            this.get('repos').url = remote_url + '/repos' + '?type=' + this.config.repo_type + '&sort=' + this.config.repo_sort;

            // fetch user info
            this.get('user').fetch({
                success: function(data, textStatus, request) {
                    console.warn('Remaining Github Requests: ' + request.xhr.getResponseHeader('X-RateLimit-Remaining'));
                    
                    fetched = main.get('remote_fetched') + 1;
                    main.set('remote_fetched', fetched);
                }
            });

            //fetch repositories
            this.get('repos').fetch({
                success: function(data, textStatus, request) {
                    fetched = main.get('remote_fetched') + 1;
                    main.set('remote_fetched', fetched);
                }
            });
        }
    });
    
    // Our basic user and repo models/collections
    var User = Backbone.Model.extend({}),
        Repo = Backbone.Model.extend({
            defaults : {
                        "created_at"    : null, 
                        "description"   : null, 
                        "homepage"      : null, 
                        "html_url"      : null,
                        "img"           : null,
                        "language"      : null, 
                        "name"          : null,
                        "show"          : true,
                        "size"          : null, 
                        "title"         : null,
                        "updated_at"    : null, 
                        "url"           : null
            }
        }),
        Repos = Backbone.Collection.extend({
            model: Repo
        });


    return MainModel;
});


        