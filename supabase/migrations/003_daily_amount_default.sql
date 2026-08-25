-- 貯金額の初期値を1日500円へ変更
ALTER TABLE settings ALTER COLUMN weekly_amount SET DEFAULT 3500;
ALTER TABLE settings ALTER COLUMN daily_amount SET DEFAULT 500;
ALTER TABLE settings ALTER COLUMN savings_basis SET DEFAULT 'daily';

-- 以前の初期値を変更していないユーザーだけを新しい初期値へ移行
UPDATE settings
SET weekly_amount = 3500,
    daily_amount = 500,
    savings_basis = 'daily',
    updated_at = now()
WHERE weekly_amount = 3000
  AND daily_amount IS NULL
  AND savings_basis = 'weekly';
