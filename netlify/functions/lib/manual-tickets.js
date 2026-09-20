// Stripeを通さない手売り（現金）チケット。ここに追記すると在庫カウントと管理一覧の両方に反映される。
// amount: この行の金額（円）。単価×人数と矛盾しないよう手入力で管理する。
const CREATED = 1789441200; // 2026-09-15 登録分
const CREATED_2 = 1789527600; // 2026-09-16 登録分
const CREATED_3 = 1789566865; // 追加登録分
const CREATED_4 = 1789748576; // 2026-09-19 登録分

module.exports = [
  { last_name: '百木', first_name: '蓮', last_name_kana: 'モモキ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/現役）', created: CREATED },
  { last_name: '宮川', first_name: 'いろは', last_name_kana: 'ミヤガワ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/現役）', created: CREATED },
  { last_name: '永江', first_name: '碧羽菜', last_name_kana: 'ナガエ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/現役）', created: CREATED },
  { last_name: '中島', first_name: '鶴斗', last_name_kana: 'ナカシマ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/卒業生）', created: CREATED },
  { last_name: '大串', first_name: '絵恋', last_name_kana: 'オオクシ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/卒業生）', created: CREATED },
  { last_name: '西村', first_name: '花音', last_name_kana: 'ニシムラ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/卒業生）', created: CREATED },
  { last_name: '吉田', first_name: '碧', last_name_kana: 'ヨシダ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/中学生・附属中）', created: CREATED },
  { last_name: '吉田', first_name: '倫子', last_name_kana: 'ヨシダ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/中学生・碧様の母）', created: CREATED },
  { last_name: '小ヶ倉中吹奏楽部', first_name: '', last_name_kana: '', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 8, child_count: 0, amount: 8000, note: '団体割@1,000×8名・当日精算（長崎南/中学生）', created: CREATED },
  { last_name: '畑原', first_name: '', last_name_kana: 'ハタハラ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/一般）', created: CREATED },
  { last_name: '永川', first_name: '', last_name_kana: 'ナガカワ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南/一般）', created: CREATED },
  { last_name: '上原', first_name: '', last_name_kana: 'ウエハラ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 2, child_count: 0, amount: 3000, note: '@1,500×2名・有明立替（3組計¥9,000）', created: CREATED_2 },
  { last_name: '田中', first_name: '', last_name_kana: 'タナカ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 2, child_count: 0, amount: 3000, note: '@1,500×2名・有明立替（3組計¥9,000）', created: CREATED_2 },
  { last_name: '伊藤', first_name: '', last_name_kana: 'イトウ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 2, child_count: 0, amount: 3000, note: '@1,500×2名・有明立替（3組計¥9,000）', created: CREATED_2 },
  { last_name: '村尾', first_name: '直俊', last_name_kana: 'ムラオ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1000, note: '団体割@1,000・当日精算（長崎南）', created: CREATED_3 },
  { last_name: '森川', first_name: '', last_name_kana: 'モリカワ', first_name_kana: '', phone: '', referrer: '伊藤 有明', adult_count: 1, child_count: 0, amount: 1500, note: '@1,500・有明立替（伊藤関係者）', created: CREATED_4 },
];
