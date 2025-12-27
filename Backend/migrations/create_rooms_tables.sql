-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_created_by (created_by),
  INDEX idx_is_active (is_active)
);

-- Create room_members table (junction table)
CREATE TABLE IF NOT EXISTS room_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role ENUM('admin', 'member') DEFAULT 'member',
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_user (room_id, user_id),
  INDEX idx_room_id (room_id),
  INDEX idx_user_id (user_id)
);

-- Modify polls table to support rooms
ALTER TABLE polls ADD COLUMN room_id INT NULL AFTER created_by;
ALTER TABLE polls ADD FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
ALTER TABLE polls ADD INDEX idx_room_id (room_id);

-- Create room_polls table (for managing poll settings specific to rooms)
CREATE TABLE IF NOT EXISTS room_polls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  poll_id INT NOT NULL,
  room_id INT NOT NULL,
  duration_minutes INT DEFAULT 60,
  status ENUM('pending', 'active', 'closed') DEFAULT 'pending',
  started_at TIMESTAMP NULL,
  closed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_room_poll (poll_id, room_id),
  INDEX idx_poll_id (poll_id),
  INDEX idx_room_id (room_id),
  INDEX idx_status (status)
);
