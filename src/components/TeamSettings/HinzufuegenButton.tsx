export type HinzufuegenButtonProps = {
  onClick: () => void;
};
export default function HinzufuegenButton(props: HinzufuegenButtonProps) {
  return (
    <>
      <button
        onClick={props.onClick}
        className="self-end rounded-full bg-purple-800 bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
      >
        ⨁
      </button>
    </>
  );
}
