export const layout = "base.tsx";

export default (
  { title, date, children }: Lume.Data,
  helpers: Lume.Helpers,
) => (
  <>
    <div className="mb-12">
      <h1 className="text-3xl font-medium mb-3">{title}</h1>
      <p className="text-gray-500">
        {helpers.date(date, "HUMAN_DATE")}
      </p>
    </div>
    <div className="post">
      {children}
    </div>
  </>
);
