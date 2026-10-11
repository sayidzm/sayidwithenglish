import { Check, Sparkles } from "lucide-react";
import type { TutorOutput } from "@/lib/ai/schemas";
import s from "@/components/workspace/workspace.module.css";

export type TutorUiMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  correction?: TutorOutput["correction"];
};

export function CorrectionCard({ correction: c }: { correction: NonNullable<TutorOutput["correction"]> }) {
  return (
    <section className={s.correction}>
      <h3>
        <Check size={14} />
        Küçük bir düzeltme
      </h3>
      <dl>
        <div>
          <dt>Senin cümlen</dt>
          <dd lang="en">{c.original}</dd>
        </div>
        <div>
          <dt>Düzeltme</dt>
          <dd lang="en" className={s.success}>
            {c.corrected}
          </dd>
        </div>
        <div>
          <dt>Neden?</dt>
          <dd>{c.reason}</dd>
        </div>
        <div>
          <dt>Daha doğal</dt>
          <dd lang="en">{c.natural}</dd>
        </div>
      </dl>
    </section>
  );
}
export function TutorMessage({ message }: { message: TutorUiMessage }) {
  return (
    <article className={s.message} data-role={message.role}>
      {message.role === "assistant" && (
        <span className={s.avatar}>
          <Sparkles size={16} />
        </span>
      )}
      <div className={s.messageBody}>
        <p className={s.messageName}>
          {message.role === "assistant" ? "AI Tutor" : "Sen"}
        </p>
        <div className={s.messageText}>{message.text}</div>
        {message.correction && <CorrectionCard correction={message.correction} />}
      </div>
    </article>
  );
}
