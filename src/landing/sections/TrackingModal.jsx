import { useRef } from "react";
import { Link } from "react-router";
import { LOGIN_PATH, MY_REPORTS_PATH, REGISTER_PATH } from "../../config";
import { isAuthenticated } from "../../lib/session";
import { useLandingCopy } from "../landingCopy";
import LandingModal from "./LandingModal";

export default function TrackingModal({ onClose }) {
  const primaryRef = useRef(null);
  const authenticated = isAuthenticated();
  const copy = useLandingCopy();
  const modal = copy.modals.tracking;

  return (
    <LandingModal titleId="tracking-title" onClose={onClose} initialFocusRef={primaryRef}>
      <p className="eyebrow">{modal.eyebrow}</p>
      <h2 id="tracking-title">{modal.title}</h2>
      <div className="lmodal-body">
        {modal.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <ul className="lmodal-list">
          {modal.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
      <div className="lmodal-acts">
        {authenticated ? (
          <Link ref={primaryRef} className="btn red" to={MY_REPORTS_PATH} onClick={onClose}>
            {modal.open}
          </Link>
        ) : (
          <>
            <Link
              ref={primaryRef}
              className="btn red"
              to={LOGIN_PATH}
              state={{ from: MY_REPORTS_PATH }}
              onClick={onClose}
            >
              {modal.login}
            </Link>
            <Link
              className="btn out"
              to={REGISTER_PATH}
              state={{ from: MY_REPORTS_PATH }}
              onClick={onClose}
            >
              {modal.register}
            </Link>
          </>
        )}
      </div>
      <p className="lmodal-note">{modal.note}</p>
    </LandingModal>
  );
}
