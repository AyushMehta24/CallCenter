import { TelnyxRTCProvider } from "@telnyx/react-client";
import Dialpad from "./Dialpad"
import CallLog from "./CallLog"

const VoiceCall = () => {
  const credential = {
    login: process.env.REACT_APP_TELNYX_LOGIN || "",
    login_token: process.env.REACT_APP_TELNYX_API_KEY || "",
    password: process.env.REACT_APP_TELNYX_PASSWORD || "",
  };

  return (
    <div className="p-5">
      <TelnyxRTCProvider credential={credential}>
        <div className="flex flex-col gap-5">
          <CallLog />
          <Dialpad />
        </div>
      </TelnyxRTCProvider>
    </div>
  );
};

export default VoiceCall;
