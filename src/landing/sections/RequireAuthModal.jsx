import { useRef } from "react";
import { Link } from "react-router";
import { LOGIN_PATH, REGISTER_PATH } from "../../config";
import { useLandingCopy } from "../landingCopy";
import LandingModal from "./LandingModal";

const FROM = "/submit-alert";

// Sur la landing (page publique), le signalement est réservé aux membres connectés :
// on affiche une fenêtre invitant à se connecter au lieu d'ouvrir le formulaire.
export default function RequireAuthModal({ onClose }) {
  const primaryRef = useRef(null);
  const copy = useLandingCopy();
  const modal = copy.modals.auth;

  return (
    <LandingModal titleId="lmodal-title" onClose={onClose} initialFocusRef={primaryRef}>
      <p className="eyebrow">{modal.eyebrow}</p>
      <h2 id="lmodal-title">{modal.title}</h2>
      <p className="lmodal-txt">{modal.text}</p>
      <div className="lmodal-acts">
        <Link
          ref={primaryRef}
          className="btn red"
          to={LOGIN_PATH}
          state={{ from: FROM }}
          onClick={onClose}
        >
          {modal.login}
        </Link>
        <Link className="btn out" to={REGISTER_PATH} state={{ from: FROM }} onClick={onClose}>
          {modal.register}
        </Link>
      </div>
      <p className="lmodal-note">
        {modal.noteBefore} <b className="num">14</b>{modal.noteAfter}
      </p>
    </LandingModal>
  );
}
