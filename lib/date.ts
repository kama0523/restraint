const TIME_ZONE = "Asia/Tokyo";
const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** JST基準の今日の日付を YYYY-MM-DD で返す。サーバーのタイムゾーン設定に依存しない。 */
export function todayJST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** JST基準の今月を YYYY-MM で返す。 */
export function currentMonthJST(): string {
  return todayJST().slice(0, 7);
}

function toEpochDay(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

function fromEpochDay(epochDay: number): string {
  const date = new Date(epochDay * 86400000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD文字列に日数を加算する(タイムゾーンに依存しないUTC日単位の計算)。 */
export function addDays(dateStr: string, amount: number): string {
  return fromEpochDay(toEpochDay(dateStr) + amount);
}

/** aとbの日数差(a - b)。 */
export function diffDays(a: string, b: string): number {
  return toEpochDay(a) - toEpochDay(b);
}

export function formatJapaneseDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = WEEKDAYS_JA[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日(${weekday})`;
}

export function formatJapaneseMonthDay(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}月${d}日`;
}
