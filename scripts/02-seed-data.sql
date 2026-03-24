-- EduQuest Seed Data
-- Populate the database with initial subjects, chapters, and lessons

-- Insert Subjects
INSERT INTO subjects (name, description, color, total_chapters) VALUES
('History Quest', 'Journey through Kenya''s rich heritage', 'history', 8),
('Science Explorer', 'Discover the wonders of natural science', 'science', 10),
('Digital Pioneer', 'Master computer literacy skills', 'computer', 6)
ON CONFLICT DO NOTHING;

-- Get subject IDs for reference
DO $$
DECLARE
  history_id UUID;
  science_id UUID;
  computer_id UUID;
BEGIN
  SELECT id INTO history_id FROM subjects WHERE name = 'History Quest';
  SELECT id INTO science_id FROM subjects WHERE name = 'Science Explorer';
  SELECT id INTO computer_id FROM subjects WHERE name = 'Digital Pioneer';

  -- History chapters
  INSERT INTO chapters (subject_id, chapter_number, title, description, xp_reward) VALUES
  (history_id, 1, 'Ancient Kenya', 'Explore the early civilizations and kingdoms of Kenya', 150),
  (history_id, 2, 'Arab and Swahili Influence', 'Learn about the coastal trade and cultural exchange', 150),
  (history_id, 3, 'Portuguese Era', 'Understand the Portuguese colonial period', 150),
  (history_id, 4, 'British Colonial Period', 'Study the British rule and its impact', 150),
  (history_id, 5, 'Independence Movement', 'Discover the struggle for Kenyan independence', 150),
  (history_id, 6, 'Post-Independence Kenya', 'Learn about modern Kenya''s development', 150),
  (history_id, 7, 'Cultural Heritage', 'Explore Kenya''s diverse ethnic groups and traditions', 150),
  (history_id, 8, 'Contemporary Kenya', 'Study modern challenges and achievements', 150);

  -- Science chapters
  INSERT INTO chapters (subject_id, chapter_number, title, description, xp_reward) VALUES
  (science_id, 1, 'Matter and Its Properties', 'Understanding states of matter and molecular structure', 150),
  (science_id, 2, 'Forces and Motion', 'Newton''s laws and mechanical principles', 150),
  (science_id, 3, 'Energy Forms', 'Kinetic, potential, and energy transformations', 150),
  (science_id, 4, 'Electricity and Magnetism', 'Electric circuits and magnetic fields', 150),
  (science_id, 5, 'Light and Sound', 'Wave properties and electromagnetic spectrum', 150),
  (science_id, 6, 'Cell Biology', 'Structure and function of living cells', 150),
  (science_id, 7, 'Human Body Systems', 'Anatomy and physiology', 150),
  (science_id, 8, 'Genetics and Evolution', 'Heredity and natural selection', 150),
  (science_id, 9, 'Ecology', 'Ecosystems and biodiversity', 150),
  (science_id, 10, 'Chemical Reactions', 'Atoms, molecules, and reactions', 150);

  -- Computer chapters
  INSERT INTO chapters (subject_id, chapter_number, title, description, xp_reward) VALUES
  (computer_id, 1, 'Computer Basics', 'Hardware, software, and system components', 150),
  (computer_id, 2, 'Operating Systems', 'Windows, Linux, and system management', 150),
  (computer_id, 3, 'Internet and Networks', 'Connectivity, protocols, and cybersecurity', 150),
  (computer_id, 4, 'Productivity Tools', 'Office suites and document management', 150),
  (computer_id, 5, 'Digital Media', 'Graphics, audio, and video editing basics', 150),
  (computer_id, 6, 'Programming Fundamentals', 'Logic, algorithms, and coding concepts', 150);

END $$;

-- Insert lessons for History Chapter 1
DO $$
DECLARE
  chapter_id UUID;
BEGIN
  SELECT id INTO chapter_id FROM chapters WHERE title = 'Ancient Kenya' LIMIT 1;
  
  INSERT INTO lessons (chapter_id, lesson_number, title, lesson_type, xp_reward, game_type, content) VALUES
  (chapter_id, 1, 'The First Inhabitants', 'story', 50, NULL, '{"text": "Learn about the earliest inhabitants of Kenya and their way of life.", "sections": [{"heading": "Early Settlement", "content": "The first humans in Kenya arrived during the Paleolithic era..."}]}'),
  (chapter_id, 2, 'Kingdom of Kush Trade', 'interactive', 50, NULL, '{"text": "Explore trading routes and economic systems."}'),
  (chapter_id, 3, 'Kingdom of Punt', 'quiz', 50, NULL, '{"questions": [{"question": "Which ancient kingdom traded with Egypt?", "options": ["Kush", "Punt", "Nile"], "correct": 1}]}'),
  (chapter_id, 4, 'Timeline Challenge', 'mini-game', 75, 'timeline', '{"events": [{"year": 1000, "event": "Bantu Migration", "id": "e1"}, {"year": 500, "event": "Iron Age", "id": "e2"}]}');
END $$;

-- Insert lessons for Science Chapter 1
DO $$
DECLARE
  chapter_id UUID;
BEGIN
  SELECT id INTO chapter_id FROM chapters WHERE title = 'Matter and Its Properties' LIMIT 1;
  
  INSERT INTO lessons (chapter_id, lesson_number, title, lesson_type, xp_reward, game_type, content) VALUES
  (chapter_id, 1, 'States of Matter', 'story', 50, NULL, '{"text": "Understand the three main states of matter: solid, liquid, and gas."}'),
  (chapter_id, 2, 'Molecular Movement', 'interactive', 50, NULL, '{"text": "Explore how molecules behave in different states."}'),
  (chapter_id, 3, 'Matter Properties Quiz', 'quiz', 50, NULL, '{"questions": [{"question": "At what temperature does water freeze?", "options": ["0°C", "100°C", "-10°C"], "correct": 0}]}'),
  (chapter_id, 4, 'Sort the Elements', 'mini-game', 75, 'drag-drop', '{"items": [{"id": "solid1", "label": "Iron", "type": "solid"}, {"id": "liquid1", "label": "Water", "type": "liquid"}], "categories": ["Solid", "Liquid", "Gas"]}');
END $$;

-- Insert lessons for Computer Chapter 1
DO $$
DECLARE
  chapter_id UUID;
BEGIN
  SELECT id INTO chapter_id FROM chapters WHERE title = 'Computer Basics' LIMIT 1;
  
  INSERT INTO lessons (chapter_id, lesson_number, title, lesson_type, xp_reward, game_type, content) VALUES
  (chapter_id, 1, 'Inside the Computer', 'story', 50, NULL, '{"text": "Learn about computer hardware components and how they work together."}'),
  (chapter_id, 2, 'Input and Output', 'interactive', 50, NULL, '{"text": "Explore different input and output devices."}'),
  (chapter_id, 3, 'Hardware Quiz', 'quiz', 50, NULL, '{"questions": [{"question": "Which component stores data permanently?", "options": ["RAM", "Hard Drive", "GPU"], "correct": 1}]}'),
  (chapter_id, 4, 'Code Challenge', 'mini-game', 75, 'coding-puzzle', '{"challenge": "Complete the function to add two numbers", "starterCode": "function add(a, b) { return ", "solution": "a + b;"}');
END $$;

-- Create demo test users (passwords would be hashed in production)
-- NOTE: These are placeholder. In production, use proper password hashing
INSERT INTO users (email, password_hash, name, role) VALUES
('student1@eduquest.local', 'hashed_password_123', 'Alex Johnson', 'student'),
('student2@eduquest.local', 'hashed_password_456', 'Maria Garcia', 'student'),
('student3@eduquest.local', 'hashed_password_789', 'James Smith', 'student'),
('student4@eduquest.local', 'hashed_password_012', 'Amara Omondi', 'student'),
('student5@eduquest.local', 'hashed_password_345', 'Zakir Hassan', 'student'),
('teacher1@eduquest.local', 'hashed_password_999', 'Professor Chen', 'teacher')
ON CONFLICT DO NOTHING;

-- Create student profiles
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM users WHERE email = 'student1@eduquest.local';
  INSERT INTO student_profiles (user_id, level, total_xp, streak, badges_earned) VALUES
  (user_id, 8, 2450, 5, ARRAY['first_lesson', 'week_warrior'])
  ON CONFLICT DO NOTHING;

  SELECT id INTO user_id FROM users WHERE email = 'student2@eduquest.local';
  INSERT INTO student_profiles (user_id, level, total_xp, streak, badges_earned) VALUES
  (user_id, 6, 1890, 3, ARRAY['first_lesson'])
  ON CONFLICT DO NOTHING;

  SELECT id INTO user_id FROM users WHERE email = 'student3@eduquest.local';
  INSERT INTO student_profiles (user_id, level, total_xp, streak, badges_earned) VALUES
  (user_id, 10, 3200, 12, ARRAY['first_lesson', 'week_warrior', 'master_explorer'])
  ON CONFLICT DO NOTHING;

  SELECT id INTO user_id FROM users WHERE email = 'student4@eduquest.local';
  INSERT INTO student_profiles (user_id, level, total_xp, streak, badges_earned) VALUES
  (user_id, 5, 1450, 2, ARRAY[])
  ON CONFLICT DO NOTHING;

  SELECT id INTO user_id FROM users WHERE email = 'student5@eduquest.local';
  INSERT INTO student_profiles (user_id, level, total_xp, streak, badges_earned) VALUES
  (user_id, 9, 2950, 8, ARRAY['first_lesson', 'week_warrior'])
  ON CONFLICT DO NOTHING;
END $$;

-- Create teacher class
DO $$
DECLARE
  teacher_id UUID;
  class_id UUID;
  student_id UUID;
BEGIN
  SELECT id INTO teacher_id FROM users WHERE email = 'teacher1@eduquest.local';
  
  INSERT INTO teacher_classes (teacher_id, class_name, subject) VALUES
  (teacher_id, 'Form 3 Science', 'Science')
  RETURNING id INTO class_id;

  -- Add all students to the class
  FOR student_id IN SELECT id FROM users WHERE role = 'student' LOOP
    INSERT INTO class_students (class_id, student_id) VALUES (class_id, student_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
