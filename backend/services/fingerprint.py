import hashlib


class Fingerprinter:
    def from_request_context(self, user_agent: str, ip: str, extra: str = "") -> str:
        raw = f"{user_agent}:{ip}:{extra}"
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    def is_new_user(self, fingerprint: str, db) -> bool:
        from models import Event
        return not db.query(Event).filter_by(fingerprint=fingerprint).first()
