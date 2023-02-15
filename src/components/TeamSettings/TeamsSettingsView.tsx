/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "../../utils/api";
import Profil from "./Profil";
import TeamAuwahl from "./TeamAuwahl";
import TeamErstellen from "./TeamErstellen";

export default function TeamsSettingsView() {
  const { data: session } = useSession();
  const [textfield, setTextfield] = useState<string>("");
  const { data: teamName, remove: removeOldName } =
    api.teamMember.getUsersTeamName.useQuery();

  const mutateTeam = api.teams.createTeam.useMutation({
    onSuccess: () => api.teams.getTeam.useQuery(),
  });

  const { data, status, refetch, remove } = api.teams.getTeam.useQuery();
  const deleteTeam = api.teams.deleteTeam.useMutation({
    onSuccess: () => {
      remove();
    },
  });
  const switchTeamMutation = api.teams.switchTeam.useMutation({
    onSuccess: () => {
      removeOldName();
    },
  });

  function deleteTeamHandle(id: string) {
    deleteTeam.mutate(id);
  }
  function createTeam() {
    if (textfield.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mutateTeam.mutate({ name: textfield });
    }
  }

  return (
    <div className="flex flex-col gap-9">
      <h1 className="text-xl font-bold">Team Settings</h1>
      {session?.user.name && teamName && (
        <Profil nutzerName={session?.user.name} teamName={teamName} />
      )}
      {data && data.length > 0 && (
        <TeamAuwahl
          data={data}
          status={status}
          switchTeamMutation={switchTeamMutation}
          deleteTeam={deleteTeamHandle}
        />
      )}
      <TeamErstellen
        createTeam={createTeam}
        setTextfield={setTextfield}
        textfield={textfield}
      />
    </div>
  );
}
