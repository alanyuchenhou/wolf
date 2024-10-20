export interface PhoneCall {
  from: string
  to: string
}

export function PhoneCallConfirmation({
  phoneCall,
}: {
  phoneCall?: PhoneCall
}) {
  return phoneCall ? (
    <div>
      📞 I will place a call from {phoneCall.from} to {phoneCall.to}.
    </div>
  ) : (
    <div>
      I cannot make a phone call because the phone number is invalid. Make sure
      it is in E.164 format, e.g. +101234567890
    </div>
  )
}
