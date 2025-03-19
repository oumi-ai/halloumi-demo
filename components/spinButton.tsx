import { Spinner } from "@nextui-org/spinner";

export interface SpinButtonProps {
  // The styling to apply to this button.
  className?: string;

  // The text to display on the button.
  text: string;

  // An onclick handler.
  onClick?: () => void;

  // Whether the button is currently in progress.
  inProgress?: boolean;
}

export function SpinButton(props: SpinButtonProps) {
  const disabledClasses = "text-oumi-blue bg-slate-100 border-oumi-blue";
  const enabledClasses = "text-white bg-oumi-blue border-oumi-blue hover:bg-white hover:text-oumi-blue";
  return (
    <div className={`${props.className || ""}`}>
      <button
        disabled={props.inProgress}
        className={`relative inline-flex font-inria text-lg px-11 py-2.5 font-medium rounded-md transition-colors border ${props.inProgress ? disabledClasses : enabledClasses}`}
        onClick={props.onClick}
      >
        <span className={props.inProgress ? "invisible" : "visible"}>
          {props.text}
        </span>
        <span className={`spinner ${props.inProgress ? "" : "hidden"}`}>
          <Spinner />
        </span>
      </button>
    </div>
  )
}