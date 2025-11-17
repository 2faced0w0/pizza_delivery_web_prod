-- Simple seed SQL
INSERT INTO users(email,password_hash,role,created_at) VALUES
('admin@example.com','$2b$10$replaceWithRealHash','admin',NOW());

INSERT INTO pizzas(name,description,image_url,base_price,is_active,created_at) VALUES
('Margherita','Classic tomato + mozzarella','',8,true,NOW()),
('Pepperoni','Tomato, mozzarella, pepperoni','',9,true,NOW());

INSERT INTO toppings(name,price,is_active) VALUES
('Extra Cheese',1,true),
('Olives',1,true),
('Mushrooms',1,true);
