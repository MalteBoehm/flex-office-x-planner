export default function Profil({
  teamName,
  nutzerName,
}: {
  teamName: string;
  nutzerName: string;
}) {
  return (
    <>
      <div className="h-full ">
        <h2 className="text-lg font-bold">Profil</h2>
        Hallo {nutzerName} du bist im Team {teamName}
      </div>
    </>
  );
}
