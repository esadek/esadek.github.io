export const layout = "base.tsx";

export default ({ children, search }: Lume.Data, helpers: Lume.Helpers) => (
  <>
    <div className="text-lg">
      {children}
    </div>
    <hr className="my-12" />
    <div>
      {search.pages("layout=post.tsx", "date=desc").map((page) => (
        <div className="flex justify-between mb-2">
          <a href={page.url}>{page.title}</a>
          <p className="text-gray-500 font-light">
            {helpers.date(page.date, "HUMAN_DATE")}
          </p>
        </div>
      ))}
    </div>
  </>
);
