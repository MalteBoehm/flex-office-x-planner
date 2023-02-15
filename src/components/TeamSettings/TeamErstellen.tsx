export default function TeamErstellen({
  createTeam,
  textfield,
  setTextfield,
}: {
  createTeam: () => void;
  textfield: string;
  setTextfield: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">
        Ist dein Team nicht dabei? Erstelle es hier!
      </h2>
      <form className="b-0 m-0" onSubmit={() => createTeam()}>
        <input
          className="rounded-full bg-white/70 px-10 py-2 font-semibold text-orange-500 no-underline transition hover:bg-white/20"
          type="text"
          value={textfield}
          onChange={(e) => setTextfield(e.target.value)}
        />
        <button
          disabled={textfield.length === 0}
          className="rounded-full bg-white/70 px-10 py-2 font-semibold text-orange-500 no-underline transition hover:bg-white/20"
        >
          Erstelle Team
        </button>
      </form>
    </div>
  );
}
