-- 抑制積立アプリ 拡張スキーマ
-- Supabase SQL Editorで実行してください

-- settings テーブルに抑制設定カラムを追加
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS addiction_label TEXT,
  ADD COLUMN IF NOT EXISTS pledge TEXT,
  ADD COLUMN IF NOT EXISTS alternative_actions TEXT,
  ADD COLUMN IF NOT EXISTS urge_timer_minutes INTEGER DEFAULT 20;

-- regret_notes の reason 制約を汎用化
-- 旧値(給料日/誘われた)も互換性のため残しつつ、汎用的な値を追加
ALTER TABLE regret_notes DROP CONSTRAINT IF EXISTS regret_notes_reason_check;
ALTER TABLE regret_notes
  ADD CONSTRAINT regret_notes_reason_check
  CHECK (reason IN ('暇', 'ストレス', '不安', '衝動的に', '周りに流された', '習慣', 'その他', '給料日', '誘われた'));
