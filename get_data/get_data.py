import json
from github3 import login


config = {
	'username' 		: 'iamuser',				# GitHub Username
	'password' 		: 'asdfasdfasdfasdf',		# GitHub Password
	'repo_type'		: 'owner', 					# Type of Repo to Show: 'all', 'owner', 'public', 'private', 'member'
	'repo_sort'		: 'updated',				# Order of Repos: (desc) - 'created', 'updated', 'pushed'; (asc) - 'full_name'
}	

#keys to keep in the data, throw out the rest
keys = {
	'user' : ['bio', 'blog',  'company',  'created_at',  'email', 'gravatar_id',  'hireable' , 'html_url', 'id', 'location', 'login', 'name'],
	'repo' : ['created_at', 'description', 'html_url', 'homepage', 'id', 'language', 'name', 'size', 'updated_at']
}
        
def clean_data(d, kind):
	return dict((k,v) for k,v in d.iteritems() if any(k in l for l in keys[kind]))

def get_user(gh):
	return clean_data(gh.user(login=config['username']).to_json(), 'user')

def get_repos(gh):
	return [clean_data(repo.to_json(), 'repo') for repo in gh.iter_repos(type=config['repo_type'], sort=config['repo_sort']) if not repo.fork]


if __name__ == '__main__':

	gh = login(config['username'], password=config['password'])
	
	#print 'rate limit: ' + str(gh.ratelimit_remaining)

	data = {
		'user' : get_user(gh),
		'repos': get_repos(gh)
	}
	
	with open('../github_data.json', 'w') as outfile:
  		json.dump(data, outfile, indent=4, sort_keys = True)

  	print 'data got'