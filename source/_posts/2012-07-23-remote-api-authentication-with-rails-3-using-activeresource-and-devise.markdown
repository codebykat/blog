---
layout: post
title: "Remote API Authentication With Rails 3 Using ActiveResource and Devise"
date: 2012-07-23 14:49
comments: true
categories: Rails Ruby code walkthroughs
---

I recently had to implement this workflow for a client project, and it got a little confusing.  There's a lot of example code floating around, but it took some trial and error to get everything working smoothly.  So, on the off-chance it'll be helpful for someone else, here's a walkthrough that illustrates the complete package.

<!--more-->

Caveat: ActiveResource [has been removed from Rails core](http://news.ycombinator.com/item?id=3818223), and I hear there may be better solutions out there for interacting with remote APIs.  At the outset of this project it seemed like the best way to quickly get things working, but your mileage may vary.

### Contents

[Part 0: The Big Picture](#part0)<br />
[Part 1: The Backend](#backend)<br />
[Part 2: The Front End](#frontend)<br />
[Part 3: The Fiddly Bits](#part3)

## <a id='part0'>Part 0: The Big Picture</a>
The basic architecture consists of two Rails sites:

**The Backend:** A pure JSON API that authenticates users via Devise's token_authenticatable module.  Uses ActiveRecord database models, no session storage.

**The Front End:** A client that signs users in by requesting and storing a token from the backend.  Uses session storage and ActiveResource models.

I'll talk about the configuration for each of these separately, and then some of the integration work (read: hacking) I had to do to get everything running smoothly.

**Security Warning!** This setup is **completely insecure** if used over HTTP (since email/password are sent in plaintext).  You definitely want to ensure that your front end communicates with your backend strictly via HTTPS in order to protect against man-in-the-middle attacks.

## <a id='backend'>Part 1: The Backend</a>

### 1. Install Devise

This is covered well elsewhere so I won’t get into it.  Add ‘devise’ to your gemfile and check out the Devise [documentation](https://github.com/plataformatec/devise#getting-started) for basic setup.  [RailsCasts](http://railscasts.com/episodes/209-introducing-devise?view=asciicast) are also a great resource for this.

### 2. Configure Devise to use :token_authenticatable
The [token_authenticatable](http://rdoc.info/github/plataformatec/devise/master/Devise/Models/TokenAuthenticatable) module adds authentication tokens to a model and sets it up so Devise can use them to log users in.

First, we need a new database column.  Older versions of Devise had the t.token_authenticatable shorthand for this, but that is now deprecated, so we need to set up the column and index manually.

Create a new database migration:
    class AddTokensToUsers < ActiveRecord::Migration
      def change
        change_table :users do |t|
          t.string :authentication_token
        end
        add_index  :users, :authentication_token, :unique => true
      end
    end

Tell Devise to use tokens for the User model by adding :token_authenticatable to the devise line in your model, e.g.:
    class User < ActiveRecord::Base
    devise :database_authenticatable, :registerable, :token_authenticatable,
           :recoverable, :rememberable, :trackable, :validatable

Then a few small changes to the Devise config (config/initializers/devise.rb):
    config.skip_session_storage = [:http_auth, :token_auth]
    config.token_authentication_key = :auth_token

The first line tells Devise not to store the user in the session.

The second line changes what you’re going to call your authentication token parameter -- I changed mine to "auth_token" because I didn't want to be typing "authentication_token" all the time, but you can call it whatever you want (or leave it as the default).

Now any protected content needs to be wrapped with a filter that tells it to deny access if the user is not authenticated.  In my Users controller, I added:
    before_filter :authenticate_user!, :except => [:create, :new, :show]

So now we have all the infrastructure in place.  Next, we need a way to actually authenticate the user.  That's the job of the Sessions controller, which checks a given username and password and, if they're valid, returns a token (as well as the ID of the user in question).  Note that, since there’s no session-based sign-in on the backend, we never call Devise's sign_in/sign_out methods.  We're just validating the password, making sure the user has an auth token generated, and returning it.

(In some sense, a user is "signed in" to the backend as long as they have a valid authentication token.  If you want, you can expire this token after some period of time instead of having it stick around indefinitely.  You could also reset it after a certain number of uses.)

	SessionsController:
		def create
			build_resource
			resource = User.find_for_database_authentication(:email => params[:email])
			return invalid_login_attempt unless resource
			
			if resource.valid_password?(params[:password])
			resource.ensure_authentication_token!  #make sure the user has a token generated
			render :json => { :authentication_token => resource.authentication_token, :user_id => resource.id }, :status => :created
			return
		end
	end
	
	def destroy
		# expire auth token
		@user=User.where(:authentication_token=>params[:auth_token]).first
		@user.reset_authentication_token!
		render :json => { :message => ["Session deleted."] },  :success => true, :status => :ok
	end
	
	def invalid_login_attempt
		warden.custom_failure!
		render :json => { :errors => ["Invalid email or password."] },  :success => false, :status => :unauthorized
	end
	
On login, we call @user.ensure_authentication_token! to make sure the user has a token saved.  You could also add this call to your User#create method to generate the token when the user is first created.

When the session is destroyed, we call @user.reset_authentication_token! to expire the current token and generate a new one.

The last piece of the puzzle is making sure you have sign_in and sign_out routes.  This should actually be a given if you have Devise set up correctly, but just to cover all the bases, a simple devise_for call in config/routes.rb will route /users/sign_in and /users/sign_out to the right places:

	devise_for(:users, :controllers => { :sessions => "sessions" })

	$ rake routes
	user_session			POST	/users/sign_in(.:format)	sessions#create
	destroy_user_session	DELETE	/users/sign_out(.:format)	sessions#destroy
             
Now you should be able to test the backend via curl or an app like [HTTPClient](http://ditchnet.org/httpclient/).  Here's a quick cheat sheet to test that everything's working properly.  This assumes you've already created a user on the backend.  Obviously, replace "localhost:3000" with your test URL.

	curl http://localhost:3000/users/sign_in --data "email=me@example.com&password=secret"
	# should return the token and user ID.

	curl http://localhost:3000/a_protected_page
	# no token - should return 401 Unauthorized.

	curl http://localhost:3000/a_protected_page&auth_token={token}
	# should return the requested information.

	curl -x DELETE http://localhost:3000/users/sign_out&auth_token={token}
	# should log out the user, changing the authentication token.

All good?  Now we just have to set it up so the front end knows how to play this game.

## <a id='frontend'>Part 2: The Front End</a>

The front end does not have Devise installed.  We don’t need it, because the user and session models are so simple, almost stubs.  All they do is add a layer of abstraction to the API calls.  You could probably still use Devise to manage your sessions and templates, but since I'm using custom sign in and registration templates, it felt like overkill.

The user model on the front end is just an ActiveResource model whose site points to the backend URL.

	class User < ActiveResource::Base
		self.site = "http://localhost:3000"  # your backend URL here
	end

We have another custom Sessions Controller on the front end which is responsible for managing login and logout.  It sends the provided email and password to the backend and saves the returned token and user ID in the session cookie.

	class SessionsController < ApplicationController

  		def create
    		# uses ActiveResource custom REST method
    		# POST to @user.site/users/sign_in with params email/password and receive a token in return
    		response = User.post(:sign_in, :email => params[:username], :password => params[:password])
    		if response.code == "201"
      			response_body = JSON.parse(response.body)
      			session[:auth_token] = response_body["authentication_token"]
      			session[:current_user_id] = response_body["user_id"]
    		else
      			# handle errors gracefully
    		end

    		redirect_to root_url and return
  		end

  		def destroy
    		# DELETE to @user.site/users/sign_out
    		response = User.delete(:sign_out)
    		# TODO might want to check response to make sure it worked..

    		# clean up our session and instance variables
    		session.delete(:auth_token)
    		session.delete(:current_user_id)
    		@current_user = nil

    		redirect_to root_url and return
  		end
	end

Oh, know what else would be nice?  A helper method to see if we’re logged in and get the current user, similar to the one Devise provides.  This goes in the Application controller:

	helper_method :current_user

  	protected
    def current_user
      	@_current_user ||= session[:current_user_id] && User.find(session[:current_user_id])
    end
    
 So, cool, now you can refer to current_user from templates just like in Devise.
 
## <a id='part3'>Part 3. The Fiddly Bits</a>
There's only one piece missing: appending the stored authentication token to every backend API call.  I didn't expect this to be the hard part, but... now it gets complicated.

Basically, ActiveResource doesn’t support this use case.  You can set an extra parameter on the object, but then ActiveResource will pass it wrapped up as part of the object, not on its own, which will break the Devise magic on the backend.

	@user.auth_token = token
	# the backend gets {:user => {:email => "me@example.com", ... :auth_token => token}}

Some ActiveResource methods *do* support passing extra parameters, but you can't do it for every method, the format is inconsistent (and apparently undocumented), and we don't want to type all that out all the time anyway...

	> User.delete(:sign_out, :auth_token => session[:auth_token])
	# that works, but...
	> g = Group.find(:first, :params => {:auth_token => session[:auth_token])
	# hmm... that works too, but the format is different...
	> g.name = "edited name"
	> g.save!
	ActiveResource::UnauthorizedAccess: Failed.  Response code = 401.  Response message = Unauthorized .
	# whoops... what about...
	> Group.site = "http://localhost:3030?auth_token=" . session[:auth_token]
	> g.save!
	> ActiveResource::UnauthorizedAccess: Failed.  Response code = 401.  Response message = Unauthorized .
	# OK, this is getting ugly...
	> g.save!(:auth_token => "wh5xeZpwf6zHG9aHzy6M")
  	ArgumentError: wrong number of arguments (1 for 0)
	# fine then!
	> g.put(g)
	URI::InvalidURIError: bad URI(is not URI?): /groups/1/#<Group:0x007fe0d4998880>.json
	#  (╯°□°）╯︵ ┻━┻) 

OK, look, forget it.  What we *really* want is a way to automatically send the authentication token, if we have it, with every single request -- in a way that works transparently with ActiveResource, so it won't matter if we're doing a find, update, or delete.

As it happens, you can overload ActiveResource's basic HTTP authentication functionality to add the token to the headers on every request.  The catch is that we then have to add some more backend code, to pull the token out of the header and treat it like an ordinary param.

Clear as mud?  Let's look at the code.

First, the front end.

ActiveResource supports HTTP digest authentication: if you set a user and password on the ActiveResource object, they will get passed with every request, just like we want (albeit as a header, not a parameter).  But we don't want to set the *same* token for the entire class (since each user will have their own token), so instead of putting it in the model, we'll have to add a filter to set it each time.

First, add the following function to the "protected" section of the Application controller:

	def set_auth_token
    	User.user = session[:auth_token]
    end

Then, add a filter near the top, so we call this function for every request:
	before_filter :set_auth_token
	
If you examine the request sent to the backend, you'll see that it now contains a "HTTP-AUTHORIZATION" header.  So far, so good.

Side note: If you have multiple ActiveResource models interacting with the backend, you will have to set the user on each one.   For example: "Group.user = session[:auth_token]".  The "user" (i.e., token) will then be sent for every Group request, such as Group.find, @group.save, etc.

Now ActiveResource is sending the auth_token in the header, but the backend is expecting to find it as a GET or POST parameter.  So we need a little hack on the backend to fish it out, thus allowing Devise to continue transparently handling authentication.

To the backend code!

	class ApplicationController < ActionController::Base
  		prepend_before_filter :get_auth_token

  		private
  		def get_auth_token
    		if auth_token = params[:auth_token].blank? && request.headers["HTTP_AUTHORIZATION"]
      			# we're overloading ActiveResource's Basic HTTP authentication here, so we need to
      			# do some unpacking of the auth token and re-save it as a parameter.
      			params[:auth_token] = auth_token.split.last.unpack('m').first.chop
    		end
  		end
	end

Yeah, ActiveResource is also encrypting that token, and then sending it in the HTTP digest format "user:password".  Since we didn't set the password and used our auth_token as the user string, we're looking at "encryptedtoken:" instead.

So we throw a little string manipulation dance party: split/last/unpack/first/chop, swing your partner, do-si-do!  This unencrypts the token, chops the colon off the end, and adds it to the params for every request so Devise can validate it.

So that's it -- feels like a bit of a hack, but seems to work pretty well in practice.  Has anyone else implemented a system like this?  I'd love to hear how you did it!

## Resources

####Documentation

* [ActiveResource documentation](http://api.rubyonrails.org/classes/ActiveResource/Base.html)
* [Rails 3 In A Nutshell: ActiveResource](http://ofps.oreilly.com/titles/9780596521424/activeresource_id59243.html)
* [Devise wiki](https://github.com/plataformatec/devise/wiki)

####Helpful examples
Mad props to the following lovely folks who shared their code.  It was not always exactly what I needed, but it was a great help in figuring out how to tackle this problem.

* [Two great examples on the Devise wiki](https://github.com/plataformatec/devise/wiki/How-To:-Simple-Token-Authentication-Example)
* [Jesse Wolgamott: The One With A JSON API Login Using Devise](http://jessewolgamott.com/blog/2012/01/19/the-one-with-a-json-api-login-using-devise/)
* [Justin Britten.com: Rails API Authentication Using restful-authentication](http://www.justinbritten.com/work/2009/05/rails-api-authentication-using-restful-authentication/)
* [eribium: RESTful Authentication](http://www.eribium.org/blog/?p=77)

####Alternate Solutions
Stuff that didn't work for me, but might work for you.

* [Using a custom Warden authentication strategy](http://blog.shuntyard.co.za/2011/10/adding-custom-authentication-strategy.html)
* [Extending Devise](http://www.railsatwork.com/2010/10/implementing-devise-extensions.html)
* [Using OmniAuth with the Identity strategy](https://github.com/intridea/omniauth/wiki/List-of-Strategies)
* [Add an API key to every request using Rack middleware](http://stackoverflow.com/questions/6046705/add-api-key-on-every-request-with-rack-middleware)