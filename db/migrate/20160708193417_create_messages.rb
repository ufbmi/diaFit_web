class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.references :user
      t.string :patient_email
      t.text :text_input
      t.timestamps null: false
    end

    add_foreign_key :messages, :users
  end
end
