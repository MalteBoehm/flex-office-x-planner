import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { WocheMitAnwesenheiten } from "../../server/api/routers/attendance";
import type { PresentTeamMember } from "../../server/api/routers/teamMember";
import { api } from "../../utils/api";
import { getWeekNumber } from "../../utils/getWeek";
import SignIn from "../SignIn";
import TeamsSettingsView from "../TeamSettings/TeamsSettingsView";
type Wochentag = "Montag" | "Dienstag" | "Mittwoch" | "Donnerstag" | "Freitag";
type ArbeitsWochenTag = {
  tag: Wochentag;
  anwesendeMember?: PresentTeamMember[];
};

export default function Table() {
  const session = useSession();
  const hasSession = session.status === "authenticated";

  const date = new Date();
  const currentYear = date.getFullYear();
  const currentWeek = getWeekNumber(date);
  const [aktuelleWoche, setAktuelleWoche] = useState<number>(currentWeek);
  const [aktuellesJahr, setAktuelleJahr] = useState<number>(currentYear);
  const {
    data: getWeek,
    remove,
    status,
    refetch,
  } = api.anwesenheiten.getAttendeancesOfTeam.useQuery({
    jahr: aktuellesJahr,
    woche: aktuelleWoche,
  });

  const anwesenheitenMutation = api.anwesenheiten.createAttendance.useMutation({
    async onSuccess(data, variables, context) {
      await refetch();
    },
  });

  const removeAnwesenheitMutation =
    api.anwesenheiten.removeAttendance.useMutation({
      async onSuccess(data, variables, context) {
        await refetch();
      },
    });
  const { data: isTeamMember } = api.teamMember.isTeamMember.useQuery();

  useEffect(() => {
    setAktuelleWoche(currentWeek);
    setAktuelleJahr(currentYear);
  }, [currentWeek, currentYear]);

  function handleZurueckWoche() {
    if (aktuelleWoche > 0) {
      setAktuelleWoche(aktuelleWoche - 1);
    }
    if (aktuelleWoche === 1) {
      setAktuelleJahr(aktuellesJahr - 1);
      setAktuelleWoche(52);
    }
  }

  function handleVorWoche() {
    if (aktuelleWoche < 52) {
      setAktuelleWoche(aktuelleWoche + 1);
    }
    if (aktuelleWoche === 52) {
      setAktuelleJahr(aktuellesJahr + 1);
      setAktuelleWoche(1);
    }
  }

  function handleAnwesenheit(date: Date) {
    console.log("datess" + JSON.stringify(date));
    anwesenheitenMutation.mutate({
      day: date,
    });
  }
  function handleAbmelden(id: string) {
    if (id.length === 0) return;
    removeAnwesenheitMutation.mutate({
      dateId: id,
    });
  }

  switch (hasSession) {
    case true:
      return isTeamMember ? (
        <>
          {/* <TeamsSettingsView /> */}
          <div className="flex h-full min-h-min w-full flex-col gap-9 bg-white p-4">
            {/* Es soll immer die aktuelle attendence Woche ausgeben werden, aber bei click auf Buttons vor und zurück */}
            {/* soll die attendence Woche geändert werden */}
            <div className="flex w-full justify-between">
              <button onClick={handleZurueckWoche}>zurück</button>
              <p className="text-center">
                Aktuelle Woche: {aktuelleWoche} {aktuellesJahr} {status}
              </p>
              <button onClick={handleVorWoche}>vor</button>
            </div>

            {/* Hier soll die attendence Woche ausgegeben werden
            Schreibe eine funktion die
            */}

            <ul className="flex w-full flex-col justify-between md:-flex-row">
              {getWeek &&
                getWeek?.map((tag, i) => (
                  <li key={i}>
                    <div className="flex flex-col">
                      <div className=" flex flex-row justify-between">
                        <div
                          onClick={() => handleAnwesenheit}
                          className=" text-lg font-bold"
                        >
                          <button
                            onClick={() =>
                              handleAnwesenheit(
                                getDateForWeekdayInWeek(
                                  tag.tag,
                                  currentWeek,
                                  currentYear
                                )
                              )
                            }
                          >
                            {tag.tag}
                          </button>
                        </div>

                        <button
                          className="rounded-b bg-amber-400 font-semibold text-white no-underline transition hover:bg-orange-500/20"
                          onClick={() => console.log("anwesend")}
                        ></button>
                      </div>
                      <div>
                        {tag.anwesendeMember?.map((member, index) => (
                          <span className="" key={index}>
                            <p
                              onClick={() =>
                                handleAbmelden(member?.tagesId ?? "")
                              }
                            >
                              {member?.name}
                            </p>
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </>
      ) : (
        <TeamsSettingsView />
      );

    case false:
      return <SignIn />;
    default:
      return <p>loading..</p>;
  }
}

export function mapToWorkWeek(week: WocheMitAnwesenheiten): ArbeitsWochenTag[] {
  const workWeek: ArbeitsWochenTag[] = [
    { tag: "Montag" },
    { tag: "Dienstag" },
    { tag: "Mittwoch" },
    { tag: "Donnerstag" },
    { tag: "Freitag" },
  ];

  week.forEach((day) => {
    const dayOfWeek = day?.day.getDay();
    let tag: Wochentag | undefined;

    switch (dayOfWeek) {
      case 1:
        tag = "Montag";
        break;
      case 2:
        tag = "Dienstag";
        break;
      case 3:
        tag = "Mittwoch";
        break;
      case 4:
        tag = "Donnerstag";
        break;
      case 5:
        tag = "Freitag";
        break;
      default:
        break;
    }

    if (tag) {
      const members: PresentTeamMember[] =
        day?.teamMembers?.map((member) => {
          return {
            ...member,
            tagesId: day.id,
            day: day.day,
          };
        }) ?? [];

      const dayInWorkWeek = workWeek.find((d) => d.tag === tag);
      if (dayInWorkWeek) {
        dayInWorkWeek.anwesendeMember = members;
      }
    }
  });

  return workWeek;
}

export function getDateForWeekdayInWeek(
  weekday: Wochentag,
  week: number,
  year: number
): Date {
  const daysOfWeek = [
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
  ];
  const weekdayIndex = daysOfWeek.indexOf(weekday);

  // Das `Date`-Objekt auf den 1. Januar des übergebenen Jahres setzen.
  const date = new Date(year, 0, 1);

  // Die Woche des Jahres setzen (1-basiert).
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);

  // Den Wochentag des Datums überprüfen. Falls er nicht mit dem gewünschten
  // Wochentag übereinstimmt, wird das Datum entsprechend angepasst.
  const currentWeekdayIndex = date.getUTCDay();
  const daysUntilWeekday = (7 + weekdayIndex - currentWeekdayIndex) % 7;
  date.setUTCDate(date.getUTCDate() + daysUntilWeekday);

  return date;
}
