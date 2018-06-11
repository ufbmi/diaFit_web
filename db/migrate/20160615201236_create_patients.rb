class CreatePatients < ActiveRecord::Migration
  def change
    create_table :patients do |t|
      t.string :username

      t.timestamps null: false
    end
  end
end
