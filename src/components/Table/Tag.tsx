import HinzufuegenButton from "../TeamSettings/HinzufuegenButton";

export type TagProps = {
  name: string;
  userIds: string[];
};
export default function Tag(props: TagProps) {
  // const set = new Set(data);
  //const unique = [...set];

  return (
    <>
      <div className="h-full flex-1 bg-white">
        <h2>{props.name}</h2>
        <ul>
          {/* {users.map((e, i) => {
            return (
              <li key={i}>
                <Image src={e.image} alt={""} height={50} width={50} />
                {e.name}
              </li>
            );
          })} */}
        </ul>
        <HinzufuegenButton onClick={() => alert()} />
      </div>
    </>
  );
}
