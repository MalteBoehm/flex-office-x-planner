import type { ArbeitsWochenTag } from "../Table";
import AnmeldeAbmeldeButton from "./AnmeldeAbmeldeButton";
import { useSession } from "next-auth/react";

type Props = {
  getWeek: ArbeitsWochenTag[] | undefined;
  refetch: () => Promise<any>;
  ausgewaehlteWoche: number;
  ausgewaehltesJahr: number;
};
export default function Arbeitswoche(props: Props) {
  const { data: session } = useSession();
  return (
    <ul className="flex w-full flex-col justify-between md:-flex-row">
      {props.getWeek?.map((tag, i) => (
        <li className=" min-h-[100px] border-2 p-5 drop-shadow-lg" key={i}>
          <div className="flex flex-col ">
            <div className=" flex flex-row justify-between">
              <div>
                <p className="text-lg font-bold"> {tag.tag}</p>
              </div>
              <AnmeldeAbmeldeButton
                tag={tag}
                refetch={props.refetch}
                ausgewaehlteWoche={props.ausgewaehlteWoche}
                ausgewaehltesJahr={props.ausgewaehltesJahr}
              />
            </div>
            <div className="flex flex-row gap-2">
              {tag.anwesendeMember?.map((member, index) => {
                // write a function, that returns a random tailwind color
                const personStyle =
                  "rounded-lg drop-shadow-lg p-2 " + getRandomTailwindColor();
                return (
                  <span key={index}>
                    {member?.name !== session?.user?.name ? (
                      <p className={personStyle}>{member?.name}</p>
                    ) : (
                      <p className=" rounded-lg bg-green-500/40 p-2 drop-shadow-lg">
                        Ich
                      </p>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function getRandomTailwindColor(): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500/40",
    "bg-indigo-500",
    "bg-purple-500/40",
    "bg-orange-500/40",
    "bg-pink-500",
    "bg-teal-500/10",
    "bg-cyan-500",
    "bg-emerald-500/40",
    "bg-rose-500",
    "bg-fuchsia-500/40",
    "bg-violet-500/40",
    "bg-lime-500",
    "bg-sky-500/40",
    "bg-amber-500/40",
    "bg-cool-gray-500/40",
    "bg-true-gray-500/40",
    "bg-warm-gray-500/40",
    "bg-black-500/40",
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  const randomColor = colors[randomIndex];
  return randomColor ?? getRandomTailwindColor();
}
