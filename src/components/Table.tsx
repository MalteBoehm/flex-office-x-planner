// create function component Table that returns a table with five columns from monday to friday

import { api } from "../utils/api";

export default function Table() {
  const { data, status } = api.firestore.getWeek.useQuery();
  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error</div>;

  return (
    <>
      {data.length == 0 && (
        <button className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20">
          Create Week
        </button>
      )}
      {data?.map((week, i) => (
        <>
          <table key={i}>
            <h2>{week?.kalenderwoche}</h2>
            <thead>
              <tr>
                <th>Monday</th>

                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
            </thead>
            <tbody>{/* Add table rows here */}</tbody>
          </table>
        </>
      ))}
    </>
  );
}
