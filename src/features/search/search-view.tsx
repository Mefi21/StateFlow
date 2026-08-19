import Link from "next/link";
import { Search } from "lucide-react";

export type SearchResult = {
  id: string;
  type: string;
  date: string;
  title: string;
  excerpt: string;
};
export function SearchView({
  query,
  results,
  demo = false,
}: {
  query: string;
  results: SearchResult[];
  demo?: boolean;
}) {
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Только ваши тексты</p>
          <h1>Поиск</h1>
          <span>Заметки, daily check-ins, события и цели.</span>
        </div>
      </header>
      <form className="search-form">
        <Search size={18} />
        <input
          name="q"
          defaultValue={query}
          placeholder="Например: экзамен, музыка, программирование"
          autoFocus
        />
        <button className="primary-control">Найти</button>
      </form>
      {demo ? (
        <p className="boundary-note">
          Поиск выполняется по синтетическим demo-заметкам.
        </p>
      ) : null}
      <section className="search-results">
        {results.map((result) => (
          <article className="panel" key={`${result.type}-${result.id}`}>
            <div>
              <span>{result.type}</span>
              <time>{new Date(result.date).toLocaleDateString("ru-RU")}</time>
            </div>
            <h2>{result.title}</h2>
            <p>{result.excerpt}</p>
            <Link href={demo ? "/demo/timeline" : "/app/timeline"}>
              В хронологии →
            </Link>
          </article>
        ))}
        {query && !results.length ? (
          <div className="panel module-empty">
            <Search />
            <h2>Совпадений нет</h2>
            <p>Поиск всегда ограничен данными текущего аккаунта.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
