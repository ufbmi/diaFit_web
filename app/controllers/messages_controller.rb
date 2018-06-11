class MessagesController < ApplicationController
  before_action :authenticate_user!
  def new
    @message = Message.new
  end

  def create
    @message = Message.new(message_params)
    # Code to handle lambda stuff, send to db, etc
  end

  private

  def message_params
    params.require(:message).permit(:patient_email, :text_input).merge(user_id: current_user.id)
  end
end
