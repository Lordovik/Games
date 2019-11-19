
CREATE TABLE users (
	id 			INT AUTO_INCREMENT PRIMARY KEY,
	user_name 		VARCHAR(255) UNIQUE,
	created_at		TIMESTAMP DEFAULT NOW(),
	total_levels		INT,
	wins			INT,
	deathes			INT,
	total_money_earned	INT,
);

CREATE TABLE levels_ratings (
	id 		INT AUTO_INCREMENT PRIMARY KEY,
	user_rates	INT,
	level_rated	INT,
	rating		FLOAT NOT NULL CHECK (rating >= 0),
	FOREIGN KEY(user_rate) 		REFERENCES users(id),
	FOREIGN KEY(level_rated)	REFERENCES levels(id)
);

CREATE TABLE campaign_ratings (
	id 		INT AUTO_INCREMENT PRIMARY KEY,
	user_rates	INT,
	campaign_rated	INT,
	rating		FLOAT NOT NULL CHECK (rating >= 0),
	FOREIGN KEY(user_rate) 		REFERENCES users(id),
	FOREIGN KEY(campaign_rated)	REFERENCES campaigns(id)
);

CREATE TABLE levels (
	id 		INT AUTO_INCREMENT PRIMARY KEY,
	level_name	VARCHAR(255) UNIQUE
	level_map	JSONB,
	level_widgets	JSONB,
	created_at 	TIMESTAMP DEFAULT NOW(),
	created_by	INT,
	current_version	FLOAT,
	FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE old_levels (
	id		INT AUTO_INCREMENT PRIMARY KEY,
	level_name	VARCHAR(255),
	rating 		FLOAT,
	level_map	JSONB,
	level_widgets	JSONB,
	created_at	TIMESTAMP,
	created_by	INT,
	version		FLOAT,
	root_of		INT,
	FOREIGN KEY(created_by) REFERENCES users(id),
	FOREIGN KEY(root_of) 	REFERENCES levels(id)
);

CREATE TABLE campaigns (
	id		INT AUTO_INCREMENT PRIMARY KEY,
	campaign_name	VARCHAR(255) UNIQUE,
	created_at	TIMESTAMP DEFAULT NOW(),
	created_by	INT,
	current_version FLOAT,
	FOREIGN KEY(created_by) 	REFERENCES users(id),
	FOREIGN KEY(includes_levels) 	REFERENCES levels(id)
);

CREATE TABLE old_campaigns (
	id		INT AUTO_INCREMENT PRIMARY KEY,
	campaign_name	VARCHAR(255),
	rating		FLOAT,
	created_at 	TIMESTAMP,
	created_by	INT,
	version 	FLOAT,
	root_of		INT,
	FOREIGN KEY(created_by) 	REFERENCES users(id),
	FOREIGN KEY(includes_levels) 	REFERENCES old_levels(id)
	FOREIGN KEY(root_of)		REFERENCES campaigns(id)
);

CREATE TABLE level_campaign (
	id 		INT AUTO_INCREMENT PRIMARY KEY,
	level_id 	INT,
	campaign_id 	INT,
	FOREIGN KEY(level_id) 		REFERENCES levels(id),
	FOREIGN KEY(campaign_id)	REFERENCES campaigns(id)
);

CREATE TABLE game_session (
	id			INT AUTO_INCREMENT PRIMARY KEY,
	user_played		INT,
	campaign_played		INT,
	level_played		INT,
	begin_playing		TIMESTAMP,
	finish_playing  	TIMESTAMP,
	score			INT,
       	total_moves		INT,
	FOREIGN KEY(user_played) 	REFERENCES users(id),
	FOREIGN KEY(campaign_played) 	REFERENCES old_campaigns(id),
	FOREIGN KEY(level_played) 	REFERENCES old_levels(id)
);


