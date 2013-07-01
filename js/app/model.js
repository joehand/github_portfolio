define(['backbone', 'underscore'], function(Backbone, _) {
    var MainModel = Backbone.Model.extend({
        url: '/github_data.json',

        initialize : function(attrs, options) {
            var main = this;

            this.config = options;
            this.on('change:local_data', this.checkDataReady);
            this.initModels(attrs.user, attrs.repos); //start with the bootstrap data

            //Figure out which kind of data to use
            if (this.config.use_api) {
                this.initRemoteData();
            } else {
                this.initLocalData();
            }
        },

        parse : function(resp) {
            //Combine old data with new data 
            var user = _.extend(resp.user, this.get('user').toJSON());
            var repos =  this.get('repos').merge(this.get('repos').toJSON(), resp.repos);

            // Just set new models; Don't actually return a response.
            this.initModels(user, repos);
        },

        initModels : function(user, repos) {
            this.set('user', new User(user));
            this.set('repos', new Repos(repos));
            this.get('repos').config =  this.get('config');
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

        initLocalData : function() {
            var main = this;

            this.fetch({
                success: function() {
                    console.log('Using Local Data - woot');
                    //auto init models with all the local data
                    main.set('local_data', true);
                },
                error: function() {
                    // no local data, will just use github api
                    console.warn('no local data, asking github');
                    main.initRemoteData();
                }
            });
        },

        initRemoteData : function() {
            console.log('Using GitHub API data');
            this.set('local_data', false);
            this.fetchRemoteData();
        },

        fetchRemoteData : function() {
            var main = this,
                remote_url = 'https://api.github.com/users/' + this.config.github_user;

            // update to use github API urls
            this.get('user').url = remote_url;
            this.get('repos').url = remote_url + '/repos' + '?type=' + this.config.repo_type + '&sort=' + this.config.repo_sort;

            // fetch user info
            this.get('user').fetch({
                success: function(model, response, options) {
                    console.warn('Remaining Github Requests: ' + options.xhr.getResponseHeader('X-RateLimit-Remaining'));

                    fetched = main.get('remote_fetched') + 1;
                    main.set('remote_fetched', fetched);
                }
            });

            //fetch repositories
            this.get('repos').fetch({
                success: function(models, response, options) {
                    fetched = main.get('remote_fetched') + 1;
                    main.set('remote_fetched', fetched);
                }
            });
        }
    });
    
    // Our basic user and repo models/collections
    var User = Backbone.Model.extend({
            parse : function(resp, options) {
                //This only runs when getting API data
                //need to keep our old data in. anything in there overwrites API stuff
                _.extend(resp, this.toJSON());
                return resp;
            }
        }),
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
            model: Repo,

            comparator : function(repo) {
                if (!_.isUndefined(this.config)) {
                    var sorter = this.config.repo_sort;

                    if (sorter == 'full_name') {
                        return repo.get('name');
                    } else { 
                        sorter = sorter + '_at'; //add at for created_at, updated_at, pushed_at
                        return -repo.get(sorter); //minus to have most recent first
                    }
                } else {
                    return -repo.get('created_at'); //minus to have most recent first
                }
            },

            parse : function(resp) {
                //This only runs when getting API data
                //need to keep our old data in. anything in there overwrites API stuff
                return this.merge(this.toJSON(), resp);
            },

            merge: function(origRepos, newRepos) {
                //Merge the two sets of repos. Check for uniqueness w/ name & id
                _.each(newRepos, function(repo) {
                    var match = _.find(origRepos, function(r){ return r.name == repo.name || r.id == repo.id; });

                    if (match) {
                        match.match = true;
                        _.defaults(match, repo); //this fills in any undefined/null fields in match
                        _.extend(repo, match); //this extends repo with any missing keys
                    }
                });

                //Return the merged array of Repositories
                return newRepos.concat(_.filter(origRepos, function(r){ return !r.match; }));
            },

        });


    return MainModel;
});


        