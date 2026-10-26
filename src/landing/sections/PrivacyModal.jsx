import { useRef } from "react";
import { Link } from "react-router";
import { useLandingCopy } from "../landingCopy";
import LandingModal from "./LandingModal";

export default function PrivacyModal({ onClose }) {
  const closeRef = useRef(null);
  const copy = useLandingCopy();
  const modal = copy.modals.privacy;

  return (
    <LandingModal titleId="privacy-title" onClose={onClose} wide initialFocusRef={closeRef}>
      <p className="eyebrow">{modal.eyebrow}</p>
      <h2 id="privacy-title">{modal.title}</h2>
      <div className="lmodal-body">
        {modal.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <ul className="lmodal-list">
          {modal.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p>{modal.note}</p>
      </div>
      <div className="lmodal-acts">
        <button ref={closeRef} className="btn" type="button" onClick={onClose}>
          {copy.modals.close}
        </button>
        <Link className="btn out" to="/contacts" onClick={onClose}>
          {modal.contact}
        </Link>
      </div>
      <p className="lmodal-note">
        {copy.modals.auth.noteBefore} <b className="num">14</b>{copy.modals.auth.noteAfter}
      </p>
    </LandingModal>
  );
}
