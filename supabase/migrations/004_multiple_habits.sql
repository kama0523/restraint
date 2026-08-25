-- 複数の習慣と、習慣ごとの日次達成記録
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  amount integer NOT NULL DEFAULT 500 CHECK (amount >= 0),
  color text NOT NULL DEFAULT 'emerald',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, date)
);

CREATE INDEX IF NOT EXISTS habits_user_idx ON habits (user_id, created_at);
CREATE INDEX IF NOT EXISTS habit_records_user_date_idx ON habit_records (user_id, date DESC);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_select_own" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update_own" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON habits FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "habit_records_select_own" ON habit_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habit_records_insert_own" ON habit_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_records_delete_own" ON habit_records FOR DELETE USING (auth.uid() = user_id);

-- 旧設定の「続けたいこと」を最初の習慣として移行
INSERT INTO habits (user_id, name, amount)
SELECT s.user_id,
       s.addiction_label,
       CASE WHEN s.savings_basis = 'daily'
         THEN COALESCE(s.daily_amount, 500)
         ELSE FLOOR(s.weekly_amount / 7.0)::integer
       END
FROM settings s
WHERE NULLIF(TRIM(s.addiction_label), '') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM habits h WHERE h.user_id = s.user_id);

-- 旧形式の達成記録を最初の習慣へ移行
INSERT INTO habit_records (habit_id, user_id, date, amount, created_at)
SELECT h.id, d.user_id, d.date, d.daily_amount, d.created_at
FROM daily_records d
JOIN LATERAL (
  SELECT id FROM habits WHERE user_id = d.user_id ORDER BY created_at LIMIT 1
) h ON true
WHERE d.status <> 'went'
ON CONFLICT (habit_id, date) DO NOTHING;
