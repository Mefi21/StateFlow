import { SearchView } from "@/features/search/search-view";
export default async function DemoSearchPage({
  searchParams,
}: PageProps<"/demo/search">) {
  const query = String((await searchParams).q ?? "").trim();
  const all = [
    {
      id: "1",
      type: "Snapshot",
      date: "2026-08-18",
      title: "Прогулка · музыка",
      excerpt:
        "Закончил задачу, энергично иду домой, любимый альбом и хорошая погода.",
    },
    {
      id: "2",
      type: "Daily",
      date: "2026-08-12",
      title: "Daily Check-in",
      excerpt:
        "Завершил часть TypeScript проекта, это дало ощущение прогресса.",
    },
  ];
  const results = query
    ? all.filter((item) =>
        `${item.title} ${item.excerpt}`
          .toLocaleLowerCase("ru")
          .includes(query.toLocaleLowerCase("ru")),
      )
    : [];
  return <SearchView demo query={query} results={results} />;
}
