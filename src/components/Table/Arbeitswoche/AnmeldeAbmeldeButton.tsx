import { ArbeitsWochenTag, getDateForWeekdayInWeek } from "../Table";
import { api } from "../../../utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = {
  tag: ArbeitsWochenTag;
  ausgewaehlteWoche: number;
  refetch: () => Promise<any>;
  ausgewaehltesJahr: number;
};

export default function AnmeldeAbmeldeButton(props: Props) {
  const [isAngemeldet, setIsAngemeldet] = useState(true);
  const session = useSession();
  const anwesenheitenMutation = api.anwesenheiten.createAnwesenheit.useMutation(
    {
      async onSuccess() {
        await props.refetch();
      },
    }
  );

  const removeAnwesenheitMutation =
    api.anwesenheiten.anwesenheitLoeschen.useMutation({
      async onSuccess() {
        await props.refetch();
      },
    });
  const [buttonStyle, setButtonStyle] = useState(
    "rounded py-2 px-4 font-bold text-white hover:bg-green-700 bg-green-500"
  );

  function handleAnwesenheit(date: Date) {
    anwesenheitenMutation.mutate({
      tag: date,
    });
  }

  function handleAbmelden(id: string) {
    if (id.length === 0) return;
    removeAnwesenheitMutation.mutate({
      anwesenheitId: id,
    });
  }

  return (
    <button
      className={buttonStyle}
      onClick={() => {
        const isAbwesend = !props.tag.anwesendeMember?.find(
          (m) => m?.id === session.data?.user.id
        );

        if (isAbwesend) {
          setButtonStyle(
            "rounded py-2 px-4 font-bold text-white hover:bg-red-700 bg-red-500"
          );
          setIsAngemeldet(false);
          handleAnwesenheit(
            getDateForWeekdayInWeek(
              props.tag.tag,
              props.ausgewaehlteWoche,
              props.ausgewaehltesJahr
            )
          );
        } else {
          setButtonStyle(
            "rounded py-2 px-4 font-bold text-white hover:bg-green-700 bg-green-500"
          );
          setIsAngemeldet(true);
          handleAbmelden(
            props.tag.anwesendeMember?.find(
              (e) => e?.id === session.data?.user.id
            )?.tagesId ?? ""
          );
        }
      }}
    >
      {isAngemeldet ? "+" : "-"}
    </button>
  );
}
