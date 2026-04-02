from pydantic import BaseModel


class DeleteAccountRequest(BaseModel):
    confirmation: str
