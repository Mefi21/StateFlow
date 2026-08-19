import Link from "next/link";

const trend = [42, 48, 46, 55, 53, 61, 66, 63, 71, 69, 76, 74];

export default function Home() {
  const points = trend
    .map((value, index) => `${index * 36},${108 - value}`)
    .join(" ");

  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Основная навигация">
        <Link href="/" className="wordmark" aria-label="StateFlow — главная">
          <span className="mark" aria-hidden="true">
            S
          </span>
          StateFlow
        </Link>
        <div className="nav-actions">
          <Link href="/demo" className="text-link">
            Демо
          </Link>
          <Link href="/login" className="button button-secondary">
            Войти
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Longitudinal state tracking</p>
          <h1>Поймите, как ваше состояние меняется со временем.</h1>
          <p className="hero-lead">
            Не одна оценка настроения, а точная картина удовольствия, желания
            будущего, энергии, сна, контекста и внутридневных изменений.
          </p>
          <div className="hero-actions">
            <Link href="/demo" className="button button-primary">
              Открыть живое демо
            </Link>
            <a href="#principles" className="button button-ghost">
              Как это работает
            </a>
          </div>
          <p className="privacy-note">
            Ваши записи принадлежат только вам. Без рекламной аналитики.
          </p>
        </div>

        <div
          className="product-preview"
          data-theme="light"
          aria-label="Пример панели состояния"
        >
          <div className="preview-topline">
            <div>
              <span className="preview-kicker">Сегодня · 18 августа</span>
              <h2>Добрый вечер</h2>
            </div>
            <span className="status-pill">
              <i /> Синхронизировано
            </span>
          </div>

          <div className="state-card">
            <div className="state-heading">
              <div>
                <span>Текущее состояние</span>
                <strong>18:04</strong>
              </div>
              <span className="context-label">прогулка · музыка</span>
            </div>
            <div className="metric-row">
              {[
                ["Хочу будущего", "6", "+2"],
                ["Удовольствие", "8", "+4"],
                ["Энергия", "7", "+2"],
                ["Тревога", "3", "−3"],
              ].map(([label, value, delta]) => (
                <div className="metric" key={label}>
                  <span>{label}</span>
                  <strong>
                    {value}
                    <small>/10</small>
                  </strong>
                  <em>{delta}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="preview-grid">
            <div className="chart-card">
              <div className="card-title-row">
                <div>
                  <span>Хочу своего будущего</span>
                  <strong>6.2</strong>
                </div>
                <small>последние 14 дней</small>
              </div>
              <svg
                viewBox="0 0 396 112"
                role="img"
                aria-label="Тренд показателя за 14 дней"
              >
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#567660" stopOpacity=".22" />
                    <stop offset="100%" stopColor="#567660" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={`0,112 ${points} 396,112`} fill="url(#area)" />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#567660"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="chart-caption">
                <span>7-дн. среднее 5.8</span>
                <span>↑ 0.7 к прошлой неделе</span>
              </div>
            </div>
            <div className="today-card">
              <span>Контекст дня</span>
              <dl>
                <div>
                  <dt>Сон</dt>
                  <dd>7ч 24м</dd>
                </div>
                <div>
                  <dt>Кофеин</dt>
                  <dd>140 мг</dd>
                </div>
                <div>
                  <dt>Снимки</dt>
                  <dd>3</dd>
                </div>
              </dl>
            </div>
          </div>

          <Link href="/demo/snapshot" className="snapshot-cta">
            <span aria-hidden="true">＋</span>
            <span>
              <strong>Зафиксировать состояние</strong>
              <small>15–30 секунд</small>
            </span>
            <b aria-hidden="true">→</b>
          </Link>
        </div>
      </section>

      <section className="principles" id="principles">
        <p>Состояние многомерно</p>
        <div className="principle-grid">
          <article>
            <span>01</span>
            <h2>Удовольствие ≠ желание будущего</h2>
            <p>
              StateFlow сохраняет разные стороны переживания отдельно, не сводя
              их к одной шкале.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>Контекст объясняет динамику</h2>
            <p>
              Сон, кофеин, работа и занятия помогают увидеть устойчивые связи в
              ваших данных.
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>Наблюдение, не диагноз</h2>
            <p>
              Нейтральная статистика показывает изменения и неопределённость без
              медицинских выводов.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
