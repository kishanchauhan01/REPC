-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     name VARCHAR(255),
--     role VARCHAR(20) CHECK (role IN ('student', 'admin')) NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE exams (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     title VARCHAR(255),
--     exam_code VARCHAR(10) UNIQUE NOT NULL,
--     start_time TIMESTAMP NOT NULL,
--     end_time TIMESTAMP NOT NULL,
--     duration INT NOT NULL, -- in minutes
--     created_by UUID REFERENCES users(id),
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- Index on exam table
-- CREATE INDEX idx_exam_code ON exams(exam_code);

-- CREATE TABLE topics (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) UNIQUE NOT NULL
-- );

-- CREATE TABLE questions (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     topic_id INT REFERENCES topics(id),
--     question TEXT NOT NULL,
--     difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
--     explanation TEXT,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE question_images (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

--     question_id UUID REFERENCES questions(id) ON DELETE CASCADE,

--     image_type VARCHAR(20) NOT NULL CHECK (
--         image_type IN ('question', 'explanation')
--     ),

--     image_url TEXT,      -- preferred (S3/CDN)

--     display_order INT DEFAULT 1,

--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE options (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
--     option_key CHAR(1), -- A, B, C, D
--     option_text TEXT NOT NULL,
--     is_correct BOOLEAN DEFAULT FALSE
-- );

-- CREATE TABLE exam_questions (
--     exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
--     question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
--     PRIMARY KEY (exam_id, question_id)
-- );

-- Index on questions 
-- CREATE INDEX idx_question_topic ON questions(topic_id);

-- CREATE TABLE student_exams (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES users(id),
--     exam_id UUID REFERENCES exams(id),
--     status VARCHAR(20) CHECK (
--         status IN ('not_started', 'in_progress', 'submitted', 'auto_submitted')
--     ),
--     start_time TIMESTAMP,
--     end_time TIMESTAMP,
--     warnings INT DEFAULT 0,
--     score INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- Index on student_exam
-- CREATE INDEX idx_user_exam ON student_exams(user_id, exam_id);

-- CREATE TABLE answers (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     student_exam_id UUID REFERENCES student_exams(id) ON DELETE CASCADE,
--     question_id UUID REFERENCES questions(id),
--     selected_option_id UUID REFERENCES options(id),
--     is_marked_for_review BOOLEAN DEFAULT FALSE,
--     visited BOOLEAN DEFAULT FALSE,
--     answered BOOLEAN DEFAULT FALSE,
--     updated_at TIMESTAMP DEFAULT NOW()
-- );

-- Index on answers
-- CREATE INDEX idx_answers_exam ON answers(student_exam_id);

-- CREATE TABLE proctoring_events (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     student_exam_id UUID REFERENCES student_exams(id),
--     event_type VARCHAR(50), -- TAB_SWITCH, COPY_PASTE, FULLSCREEN_EXIT
--     metadata JSONB,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- Index on proctoring_events
CREATE INDEX idx_proctoring_exam ON proctoring_events(student_exam_id);