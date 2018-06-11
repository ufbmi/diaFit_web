module Api
	class PatientsController < ApplicationController



		def index
			lambda = Aws::Lambda::Client.new(
				region: 'us-east-1',
				credentials: aws_credentials,
				)

			json_patient = generate_json_read("diaFitDoctors", "tvmendoza@gmail.com")
			patients_call = lambda_invoke(lambda, "handlerDiaFIT", json_patient)
			patients_result = JSON.parse(patients_call.payload.string)
			patients =  patients_result["Item"]["patients"]
			email = patients[params[:patient].to_i]
			arn = ""
			if email.kind_of?(Array) 
				arn = email[1]
				email = email[0]
			end

			lambda = Aws::Lambda::Client.new(
				region: 'us-east-1',
				credentials: aws_credentials,
				)
			message = params[:message]
			if !message.nil?
				send_message(lambda,email,message)
			end
			
			#glucose
			json_object_glucose = generate_json_read("diaFitGlucose", email)
			glucose_call = lambda_invoke(lambda, "handlerDiaFIT", json_object_glucose)
			@glucose = JSON.parse(glucose_call.payload.string)
			glucose_data= create_array_of_glucose_data(@glucose)
			#steps
			json_object_steps = generate_json_read("userSteps", email)
			get_steps_call = lambda_invoke(lambda, "handlerDiaFIT", json_object_steps)
			@steps_result = JSON.parse(get_steps_call.payload.string)
			steps_data = create_array_of_data(@steps_result)
			#nutrition
			json_object_nutrition = generate_json_read("diaFitNutrition", email)
			nutrition_call = lambda_invoke(lambda, "handlerDiaFIT", json_object_nutrition)
			@nutrition_result = JSON.parse(nutrition_call.payload.string)
			nutrition_data = create_array_of_data_nutrition(@nutrition_result)
			#Medications
			json_object_medication = generate_json_read("diafitMeds", email)
			medication_call = lambda_invoke(lambda, "handlerDiaFIT", json_object_medication)
			@meds_result = JSON.parse(medication_call.payload.string)

			meds_data = create_array_of_data_general(@meds_result)
			#general Information
			json_object_general = generate_json_general_read("diaFitUsers", email, "age,height,gender,weight,race,familyHistory")
			general_info_call = lambda_invoke(lambda, "handlerDiaFIT", json_object_general)
			@general_info_result = JSON.parse(general_info_call.payload.string)
			general_data = create_array_of_data_general(@general_info_result)

			#Generate json with all the data.
			@result_json = JSON.generate({steps: steps_data, glucose: glucose_data, nutrition: nutrition_data, general: general_data, medications: meds_data })
			render json: @result_json
	end


	private

	
	def create_array_of_data_general(data)
		arr = []
		if !data["Item"].nil?
			data["Item"].each do |item|
				arr << [item[0],item[1]]
			end

		end
		arr
	end

	def create_array_of_glucose_data(data)
		arr = []
		if !data["Item"].nil?
			data["Item"].each do |item|
				date = item[0]
				d, m, y = item[0].split '/'
				validated = Date.valid_date? y.to_i, m.to_i, d.to_i
				if  validated && !(date.include? "_")
					arr << [DateTime.parse(date), item[1]]		
				end
			end
			if arr.empty?
				data["Item"].each do |item|
					date = item[0].dup
					if date.include? "_HK"
						date.slice! "_HK"
						arr << [DateTime.parse(date), item[1]]
					end
				end
			end
			sorted_array = arr.sort! { |a,b| a[0] <=> b[0] }
			sorted_array.each do |item|
				item[0] = item[0].strftime '%Q'
				item[0].to_i
			end
		end

		sorted_array
	end


	def create_array_of_data(data)
		arr = []
		if !data["Item"].nil?
			data["Item"].each do |item|
				date = item[0]
				d, m, y = item[0].split '/'
				validated = Date.valid_date? y.to_i, m.to_i, d.to_i
				if  validated && !(date.include? "_")
					arr << [DateTime.parse(date), item[1]]
				end
			end
			sorted_array = arr.sort! { |a,b| a[0] <=> b[0] }
			sorted_array.each do |item|
				item[0] = item[0].strftime '%Q'
				item[0].to_i
			end
		end

		sorted_array
	end



	def create_array_of_data_nutrition(data)
		arr = []
		carbs = []
		fiber = []
		protein = []
		fat = []
		cals = []
		names = []
		if !data["Item"].nil?
			data["Item"].each do |date|
				if date[0] != "email"
					arr << [DateTime.parse(date[0]), date[1]]
				end
			end
			sorted_array = arr.sort! { |a,b| a[0] <=> b[0] }
			last_date = ""
			sorted_array.each do |nutrients|
				nutrients[1].each do |nutrient|
					date_converted = nutrients[0].strftime '%Q'
					if nutrient[0] == ":carbohydrates"
						carbs = add_date(carbs,nutrients[0],nutrient[1])
					elsif nutrient[0] == ":dietaryFiber"
						fiber = add_date(fiber,nutrients[0],nutrient[1])

					elsif nutrient[0] == ":protein"
						protein = add_date(protein,nutrients[0],nutrient[1])

					elsif nutrient[0] == ":lipids"
						fat = add_date(fat,nutrients[0],nutrient[1])

					elsif nutrient[0] == ":energyKCal"
						cals = add_date(cals,nutrients[0],nutrient[1])

					elsif nutrient[0] == ":food_name"
						names = add_names(names,nutrients[0],nutrient[1])
					end
				end
			end
			return JSON.generate({carbs: carbs, fiber: fiber, protein: protein, fat: fat, cals: cals, names: names})
		end
	end

	def add_names(names_array, date, value)
		date_converted = date.strftime '%Q'
		if(names_array.empty?)
			names_array << [date_converted, value]
		else
			last_date =  DateTime.strptime(names_array.last[0],'%Q')
			if(Time.at(date).to_date === Time.at(last_date).to_date)
				names_array.last[1] = names_array.last[1] + "#" + value
			else
				names_array << [date_converted, value]
			end
		end
		return names_array
	end

	def add_date(nutrient_array, date, value)
		date_converted = date.strftime '%Q'
		if(nutrient_array.empty?)
			nutrient_array << [date_converted, value]
		else
			last_date =  DateTime.strptime(nutrient_array.last[0],'%Q')
			if(Time.at(date).to_date === Time.at(last_date).to_date)
				nutrient_array.last[1] = nutrient_array.last[1] + value
			else
				nutrient_array << [date_converted, value]
			end
		end
		return nutrient_array
	end

	def send_message(lambda, email, message)
		json_object_message = generate_json_send_message(email, message)
		msg_call = lambda_invoke(lambda, "diaFitMessagesHandler", json_object_message)
		msg_response = msg_call.payload.string
		if msg_response != "Success"
			@result_json = JSON.generate({steps: "NOT SUCCESS"})
			#show it to the doctor as an error or as success.
		end
	end


	def generate_json_send_message(email, message)
		JSON.generate ({email: email, message: message})
	end

	def generate_json_read(table_name, email)
		JSON.generate({ operation: "read", TableName: table_name, Key: { email: email } })
	end

	def generate_json_general_read(table_name, email, fields)
		JSON.generate({ operation: "read", TableName: table_name, Key: { email: email }, ProjectionExpression: fields })
	end

	def lambda_invoke(lambda, function_name, payload)
		lambda.invoke({
			function_name: function_name,
			payload: payload
			})
	end
	def aws_credentials
		creds = YAML.load(File.read(File.join(Rails.root, 'config', 'aws_secret.yml')))
		credentials = Aws::Credentials.new(creds['access_key_id'], creds['secret_access_key'])
	end

end
end
