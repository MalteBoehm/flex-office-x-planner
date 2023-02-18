import { ArbeitsWochenTag, getDateForWeekdayInWeek } from "../Table";
import { api } from "../../../utils/api";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Props = {
  tag: ArbeitsWochenTag;
  ausgewaehlteWoche: number;
  refetch: () => Promise<any>;
  ausgewaehltesJahr: number;
};

export default function AnmeldeAbmeldeButton(props: Props) {
  const [isAngemeldet, setIsAngemeldet] = useState(true);
  const { data: session } = useSession();
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

  const buttonStyles = {
    anwesenheitHinzufuegen:
      "rounded py-2 px-4 font-bold text-white hover:bg-green-700 bg-green-500",
    anwesenheitEntfernen:
      "rounded py-2 px-4 font-bold text-white hover:bg-red-700 bg-red-500",
  };

  const [buttonStyle, setButtonStyle] = useState(
    buttonStyles.anwesenheitHinzufuegen
  );

  function handleAnwesenheit(date: Date) {
    anwesenheitenMutation.mutate({
      tag: date.toISOString(),
    });
  }

  function handleAbmelden(id: string) {
    if (id.length === 0) return;
    removeAnwesenheitMutation.mutate({
      anwesenheitId: id,
    });
  }

  useEffect(() => {
    const isEingetragen = props.tag.anwesendeMember?.find(
      (m) => m?.id === session?.user?.id
    );
    if (isEingetragen) {
      setIsAngemeldet(true);
      return setButtonStyle(buttonStyles.anwesenheitEntfernen);
    }
    if (!isEingetragen) {
      setIsAngemeldet(false);
      return setButtonStyle(buttonStyles.anwesenheitHinzufuegen);
    }
  }, [session?.user?.id, props.tag.anwesendeMember]);

  const handleClick = () => {
    const isAbwesend = !props.tag.anwesendeMember?.find(
      (m) => m?.id === session?.user?.id
    );

    if (isAbwesend) {
      handleAnwesenheit(
        getDateForWeekdayInWeek(
          props.tag.tag,
          props.ausgewaehlteWoche,
          props.ausgewaehltesJahr
        )
      );
    } else {
      const anwesender = props.tag.anwesendeMember?.find(
        (e) => e?.id === session?.user?.id
      );
      if (!anwesender) {
        return;
      }
      handleAbmelden(anwesender.tagesId ?? "");
    }
  };
  return (
    <button className={buttonStyle} onClick={handleClick}>
      {!isAngemeldet ? "+ Ich bin da!" : "- Ich kann doch nicht"}
    </button>
  );
}
