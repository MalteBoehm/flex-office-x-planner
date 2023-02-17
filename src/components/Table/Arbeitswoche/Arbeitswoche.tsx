import { ArbeitsWochenTag } from "../Table";
import AnmeldeAbmeldeButton from "./AnmeldeAbmeldeButton";

type Props = {
  getWeek: ArbeitsWochenTag[] | undefined;
  refetch: () => Promise<any>;
  ausgewaehlteWoche: number;
  ausgewaehltesJahr: number;
};
export default function Arbeitswoche(props: Props) {
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
            <div className="flex flex-row">
              {tag.anwesendeMember?.map((member, index) => (
                <span className="" key={index}>
                  <p>
                    {index > 0 && ","}
                    {index > 0 && " "}
                    {member?.name}
                    {member?.day.getDay()}
                  </p>
                  {/*{member?.image && (*/}
                  {/*  <Image*/}
                  {/*    alt={member?.name ?? ""}*/}
                  {/*    src={member?.image}*/}
                  {/*    width={200}*/}
                  {/*    height={200}*/}
                  {/*    className="mr-2 h-10 w-10 rounded-full"*/}
                  {/*  />*/}
                  {/*)}*/}
                </span>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
