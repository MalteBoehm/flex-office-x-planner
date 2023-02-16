import type { Team } from "@prisma/client";
import { useEffect, useState } from "react";

export default function TeamAuwahl({
  data,
  status,
  switchTeamMutation,
  deleteTeam,
}: {
  data: Team[] | undefined;
  status: string;
  switchTeamMutation: {
    mutate: (id: string) => void;
  };
  deleteTeam: (id: string) => void;
}) {
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  useEffect(() => {
    setSelectedTeam(data?.[0]?.id || "");
  }, [data]);
  return (
    <div>
      <h2 className="text-lg font-bold">Team wechseln</h2>
      <div className="flex">
        <select
          onChange={(e) => setSelectedTeam(e.target.value)}
          value={selectedTeam}
          className="flex w-40 gap-5"
        >
          {status === "success" &&
            data?.map((team, i) => (
              <option key={i} value={team.id}>
                {team.name}
              </option>
            ))}
        </select>
        <button
          onClick={() => {
            switchTeamMutation.mutate(selectedTeam);
          }}
          className="px-1 text-sm font-semibold  text-orange-500 no-underline transition hover:bg-white/20"
        >
          Team beitreten
        </button>
        <button
          onClick={() => deleteTeam(selectedTeam)}
          className="px-1 text-sm font-semibold  text-orange-500 no-underline transition hover:bg-white/20"
        >
          LÖSCHEN
        </button>
      </div>
    </div>
  );
}
