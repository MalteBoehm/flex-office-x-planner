// create function component Table that returns a table with five columns from monday to friday

import { useSession } from "next-auth/react";
import type { Arbeitswoche } from "../server/api/routers/firestore";
import { api } from "../utils/api";
import Tag from "./Tag";

type TagProps = {
  tag: string;
  menschenIds: string[];
};

export default function Table() {
  const woche = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
  const session = useSession();

  const { data, status } = api.firestore.getWeek.useQuery();
  const addToDayMutation = api.firestore.addToDay.useMutation();
  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error</div>;

  const handle = () => {
    addToDayMutation.mutate({
      keyOfDay: "Montag",
      userId: session.data?.user.id ?? "",
    });
  };
  type ArbeitsWocheKey = keyof Arbeitswoche;
  return (
    <>
      <>
        <div className="flex h-full w-full flex-col justify-center">
          <div
            onClick={handle}
            className="flex h-[600px] flex-row justify-between gap-6"
          >
            {woche.map((e, i) => {
              // @ts-ignore

              const key: ArbeitsWocheKey = (e.toLowerCase() +
                "BesucherIds") as ArbeitsWocheKey;
              const userIds = data[0][key] ?? [];
              console.log(key);
              return <Tag key={i} name={e} userIds={userIds} />;
            })}
          </div>
        </div>
      </>
    </>
  );
}
