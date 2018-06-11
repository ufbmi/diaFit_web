
class Users::SessionsController < Devise::SessionsController

	def create
		@user = User.new(user_params)
		if @user.email != "" && @user.password != ""
			puts @user.email
			creds = YAML.load(File.read(File.join(Rails.root, 'config', 'aws_secret.yml')))
			credentials = Aws::Credentials.new(creds['access_key_id'], creds['secret_access_key'])
			lambda = Aws::Lambda::Client.new(
				region: 'us-east-1',
				credentials: credentials, 
				)
			data = JSON.generate ({email: @user.email,password: @user.password})
			resp = lambda.invoke({
		        function_name: "diaFitLogin", # required
		        payload: data,
		        })
			response = JSON.parse(resp.payload.string)
			if response['login'] == true
				puts "WAS ABLE TO LOGIN"
			else 
				flash[:notice] = "Incorrect Email/Password."
				redirect_to :action => 'new'
			end
		elsif @user.email == "" && @user.password == ""
			flash[:notice] = "Please provide an email and password."
			redirect_to :action => 'new'
		elsif @user.email ==""
			flash[:notice] = "Please provide an email"
			redirect_to :action => 'new'
		else 
			flash[:notice] = "Please provide a password"
			redirect_to :action => 'new'
		end
	end

	def new
		@user = User.new
	end

	def show
		@user = User.find(params[:id])
	end

	private
	def user_params
		params.require(:user).permit(:email, :password)
	end


end