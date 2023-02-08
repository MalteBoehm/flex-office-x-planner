import Image from "next/image";
import { api } from "../utils/api";
import HinzufuegenButton from "./HinzufuegenButton";

export type TagProps = {
  name: string;
  userIds: string[];
};
export default function Tag(props: TagProps) {
  const { data, status } = api.firestore.getUserName.useQuery({
    userIds: props.userIds,
  });

  if (status === "loading") return <div>Loading...</div>;
  const set = new Set(data);
  const unique = [...set];

  return (
    <>
      <div className="h-full flex-1 bg-white">
        <h2>{props.name}</h2>
        <ul>
          {unique.map((e, i) => {
            return (
              <li key={i}>
                <Image src={e.image} alt={""} height={50} width={50} />
                {e.name}
              </li>
            );
          })}
        </ul>
        <HinzufuegenButton onClick={() => alert()} />
      </div>
    </>
  );
}
