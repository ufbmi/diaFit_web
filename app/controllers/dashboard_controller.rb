require 'json'
require "set"
require "bigdecimal"
require 'aws-sdk-rails'

class DashboardController < ApplicationController

	def index
		lambda = Aws::Lambda::Client.new(
			region: 'us-east-1',
			credentials: aws_credentials,
		)
		 #Patients:
		json_patient = generate_json_read("diaFitDoctors", "tvmendoza@gmail.com")
		patients_call = lambda_invoke(lambda, "handlerDiaFIT", json_patient)
		patients_result = JSON.parse(patients_call.payload.string)
		patients =  patients_result["Item"]["patients"]
		gon.total_options = patients.size

		puts params[:patient_name]
		puts params["patient_name"]
	end

	private
	def aws_credentials
		creds = YAML.load(File.read(File.join(Rails.root, 'config', 'aws_secret.yml')))
		credentials = Aws::Credentials.new(creds['access_key_id'], creds['secret_access_key'])
	end


	def generate_json_read(table_name, email)
		JSON.generate({ operation: "read", TableName: table_name, Key: { email: email } })
	end


	def lambda_invoke(lambda, function_name, payload)
		lambda.invoke({
			function_name: function_name,
			payload: payload
			})
	end
end
