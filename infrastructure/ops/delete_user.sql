-- ==============================================================================
-- LearnOps - KVKK / GDPR Uyumlu Manuel Hesap Silme Scripti
-- ==============================================================================
---

BEGIN;

DELETE FROM quiz_attempt_answers WHERE attempt_id IN
  (SELECT id FROM quiz_attempts WHERE user_id = $1);
DELETE FROM quiz_attempts WHERE user_id = $1;
DELETE FROM user_progress WHERE user_id = $1;
DELETE FROM enrollments WHERE user_id = $1;
DELETE FROM oauth_accounts WHERE user_id = $1;
DELETE FROM users WHERE id = $1;

INSERT INTO deleted_accounts (user_id, deleted_at, deletion_reason)
VALUES ($1, NOW(), $2);

COMMIT;