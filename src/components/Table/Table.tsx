import { useSession } from "next-auth/react";
import { Suspense, useEffect } from "react";
import type { WocheMitAnwesenheiten } from "../../server/api/routers/attendance";
import type { PresentTeamMember } from "../../server/api/routers/teamMember";
import { api } from "../../utils/api";
import { getWeekNumber } from "../../utils/getWeek";
import SignIn from "../SignIn";
import TeamsSettingsView from "../TeamSettings/TeamsSettingsView";
import { atom, useAtom } from "jotai";
import Arbeitswoche from "./Arbeitswoche/Arbeitswoche";

type Wochentag = "Montag" | "Dienstag" | "Mittwoch" | "Donnerstag" | "Freitag";
export type ArbeitsWochenTag = {
  tag: Wochentag;
  anwesendeMember?: PresentTeamMember[];
};

const datumsbereichVonKalenderwocheAtom = atom("");
export const ausgewaehlteWocheAtom = atom<number>(getWeekNumber(new Date()));
export const ausgewaehltesJahrAtom = atom<number>(new Date().getFullYear());

export default function Table() {
  const session = useSession();
  const hasSession = session.status === "authenticated";
  const date = new Date();
  const currentWeek = getWeekNumber(date);

  const [datumsbereichVonKalenderwoche, setDatumsbereichVonKalenderwoche] =
    useAtom(datumsbereichVonKalenderwocheAtom);
  const [ausgewaehlteWoche, setAusgewaehlteWoche] = useAtom(
    ausgewaehlteWocheAtom
  );
  const [ausgewaehltesJahr, setAusgewaehltesJahr] = useAtom(
    ausgewaehltesJahrAtom
  );

  const {
    data: getWeek,
    status,
    refetch,
  } = api.anwesenheiten.getAnwesenheitenDesTeams.useQuery({
    jahr: ausgewaehltesJahr,
    woche: ausgewaehlteWoche,
  });
  const { data: isTeamMember } = api.teamMember.isTeamMember.useQuery();

  function handleZurueckWoche() {
    if (ausgewaehlteWoche > 0) {
      setAusgewaehlteWoche(ausgewaehlteWoche - 1);
      setDatumsbereichVonKalenderwoche(
        getDatumsbereichVonKalenderwoche(ausgewaehlteWoche, ausgewaehltesJahr)
      );
    }
    if (ausgewaehlteWoche === 1) {
      setAusgewaehlteWoche(ausgewaehltesJahr - 1);
      setAusgewaehlteWoche(52);
      setDatumsbereichVonKalenderwoche(
        getDatumsbereichVonKalenderwoche(ausgewaehlteWoche, ausgewaehltesJahr)
      );
    }
  }

  function handleVorWoche() {
    if (ausgewaehlteWoche < 52) {
      setAusgewaehlteWoche(ausgewaehlteWoche + 1);
    }
    if (ausgewaehlteWoche === 52) {
      setAusgewaehlteWoche(ausgewaehltesJahr + 1);
      setAusgewaehlteWoche(1);
    }
    setDatumsbereichVonKalenderwoche(
      getDatumsbereichVonKalenderwoche(ausgewaehlteWoche, ausgewaehltesJahr)
    );
  }

  useEffect(() => {
    setAusgewaehlteWoche(currentWeek);
    setAusgewaehltesJahr(date.getFullYear());
    setDatumsbereichVonKalenderwoche(
      getDatumsbereichVonKalenderwoche(ausgewaehlteWoche, ausgewaehltesJahr)
    );
  }, []);

  switch (hasSession) {
    case true:
      return isTeamMember ? (
        <>
          <div className="flex h-full min-h-min w-full flex-col gap-9 bg-white p-4">
            <div className="flex w-full justify-between">
              <button className="text-3xl" onClick={handleZurueckWoche}>
                ⬅️
              </button>
              <p className="text-center">
                Kalenderwoche: {ausgewaehlteWoche} {ausgewaehltesJahr}
              </p>

              <button className="text-3xl" onClick={handleVorWoche}>
                ➡️
              </button>
            </div>
            <p>{datumsbereichVonKalenderwoche}</p>
            <Suspense fallback={<p>Lade</p>}>
              <Arbeitswoche
                ausgewaehlteWoche={ausgewaehlteWoche}
                ausgewaehltesJahr={ausgewaehltesJahr}
                refetch={refetch}
                getWeek={getWeek}
              />
            </Suspense>
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

export function mapWochenMitAnwesenheitenToWorkWeek(
  week: WocheMitAnwesenheiten
): ArbeitsWochenTag[] {
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
export function getDatumsbereichVonKalenderwoche(
  kalenderwoche: number,
  jahr: number
): string {
  const tagDerWoche = 1; // 1 = Montag
  const datum = new Date(jahr, 0, (tagDerWoche - 1) * 7 + 1);
  const tagDesJahres = datum.getDay();
  const tageBisZumMontag = tagDerWoche - tagDesJahres;
  const tagImMonat =
    datum.getDate() + tageBisZumMontag + (kalenderwoche - 1) * 7;

  const startDatum = new Date(jahr, 0, tagImMonat);
  const endDatum = new Date(jahr, 0, tagImMonat + 5);

  const startTag = startDatum.getDate().toString().padStart(2, "0");
  const startMonat = (startDatum.getMonth() + 1).toString().padStart(2, "0");
  const endTag = endDatum.getDate().toString().padStart(2, "0");
  const endMonat = (endDatum.getMonth() + 1).toString().padStart(2, "0");

  return `${startTag}.${startMonat} bis ${endTag}.${endMonat}`;
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
