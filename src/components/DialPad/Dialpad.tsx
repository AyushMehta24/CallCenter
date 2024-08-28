import React, { useCallback, useContext, useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { MdBackspace } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { ImPhoneHangUp } from "react-icons/im";
import { BsMicMuteFill } from "react-icons/bs";
import { MdPhonePaused } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import {
  Audio,
  TelnyxRTCContext,
  useCallbacks,
  useNotification,
} from "@telnyx/react-client";
// import Loader from "components/common/Loader";
import FadeLoader from "react-spinners/FadeLoader";
import { INotification } from "@telnyx/webrtc";
import {
  call_control_create_conf,
  call_control_dial,
  call_control_join_conf,
} from "services/conferenceService";

type CallType = {
  call_control_id: string;
  record_type: string;
  call_leg_id: string;
  client_state: string;
  call_duration: 1;
  call_session_id: string;
};

const dialPadConfig = [
  { digit: "1", subset: "" },
  { digit: "2", subset: "ABC" },
  { digit: "3", subset: "DEF" },
  { digit: "4", subset: "GHI" },
  { digit: "5", subset: "JKL" },
  { digit: "6", subset: "MNO" },
  { digit: "7", subset: "PQRS" },
  { digit: "8", subset: "TUV" },
  { digit: "9", subset: "WXYZ" },
  { digit: "*", subset: "" },
  { digit: "0", subset: "+" },
  { digit: "#", subset: "" },
];

const Dialpad = () => {
  //===================== States ======================================//
  const [destinationNumber, setDestinationNumber] = useState("");
  const [searchParams] = useSearchParams();
  const [isClientConnected, setIsClientConnected] = useState(false);
  const [confId, setConfId] = useState("");
  const [recipentCallControlId, setRecipentCallControlId] = useState("");

  const client = useContext(TelnyxRTCContext);
  const [mute, setMute] = useState(false);
  const notification = useNotification();

  // New state for timer
  const [callDuration, setCallDuration] = useState(0);
  const [timer, setTimer] = useState<any>(null);

  useCallbacks({
    onReady: () => {
      setIsClientConnected(true);
    },
  });

  //===================== variables ======================================//

  const callingFrom = `${searchParams.get("from")}`;
  const callingTo = `${searchParams.get("to")}`;
  const call = notification?.call;

  const callState = call?.state;

  useCallbacks({
    onNotification: (message: INotification) => {
      console.log("WebRTC client notification:", message);
      if (message.type === "callUpdate") {
        const call: any = message?.call;
        localStorage.setItem("sessionId", call?.options.telnyxSessionId);
        localStorage.setItem("legId", call?.options.telnyxLegId);
      }
    },
  });

  const url = `https://api.telnyx.com/v2/connections/${process.env.REACT_APP_TELNYX_CONNECTION_ID}/active_calls`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.REACT_APP_TELNYX_API_KEY}`,
  };

  const getSessionId = async () => {
    axios
      .get(url, { headers })
      .then((response) => {
        response.data.data.filter((call: CallType) => {
          call.call_session_id = localStorage.getItem("sessionId") || "";
          call.call_leg_id = localStorage.getItem("legId") || "";
        });
        localStorage.setItem(
          "callControlId",
          response.data.data[0].call_control_id
        );
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
      });
  };

  useEffect(() => {
    setDestinationNumber(callingTo);
  }, [callingTo]);

  // New useEffect for timer
  useEffect(() => {
    if (callState === "active") {
      setTimer(setInterval(() => setCallDuration((prev) => prev + 1), 1000));
      getSessionId();
    } else if (callState === "destroy") {
      clearInterval(timer);
      setTimer(null);
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  //====================== Functions ==============================//

  function makeCall(to: string, from: string) {
    client?.newCall({
      destinationNumber: to,
      callerName: process.env.REACT_APP_TELNYX_CALLERNAME || "",
      callerNumber: from,
    });
  }

  function firstCall() {
    try {
      makeCall(destinationNumber, callingFrom);
    } catch (err) {
      console.error("error while creating new call", err);
    }
  }

  const handleDigitClick = useCallback(
    (value: string) => () => {
      setDestinationNumber((destinationNumber) =>
        destinationNumber.concat(value)
      );
    },
    []
  );

  const handleDialClick = () => {
    firstCall();
  };

  const handleHangUpClick = () => {
    call.hangup();
  };

  const handleHoldClick = async () => {
    try {
      await call.toggleHold();
    } catch (error) {
      console.error("Error holding the call:", error);
    }
  };

  const handleMuteClick = async () => {
    call.toggleAudioMute();
    setMute((prev) => !prev);
  };

  const handleBackspaceClick = () => {
    setDestinationNumber((destinationNumber) => destinationNumber.slice(0, -1));
  };

  const handleEmptyClick = () => {
    setDestinationNumber("");
  };

  const handleAddParticipantClick = async () => {
    try {
      const res = await call_control_create_conf(
        localStorage.getItem("callControlId"),
        "TriageLogic Test"
      );
      console.log(res.data.data.id, "conf_id ");
      setConfId(res.data.data.id);

      console.log("Holding current call...");
      // Hold the current call

      // Start a new call
      console.log("Making a new call...");

      const CCId = await call_control_dial(
        process.env.REACT_APP_TELNYX_RECIPENT_NUMBER2
      );
      setRecipentCallControlId(CCId.data.data.call_control_id);

      setTimeout(() => {
        call_control_join_conf(
          process.env.REACT_APP_TELNYX_API_KEY,
          recipentCallControlId,
          confId
        );
      }, 5000);

      console.log("Participant added to conference.");
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  // ========================= component flow ==============================//

  if (!callingFrom || !callingTo) {
    window.close();
    return <></>;
  }

  if (!isClientConnected)
    return <FadeLoader color="#3498db" className="mx-auto" />;

  return (
    <div
      className="flex flex-col max-w-[280px] mx-auto gap-5"
      data-testid="dial-pad"
    >
      {/* {<FadeLoader color="#3498db"/>} */}
      {(callState === "active" || callState === "held") && (
        <div className="text-center mb-2">
          Call Duration: {Math.floor(callDuration / 60)}:
          {(callDuration % 60).toString().padStart(2, "0")}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="justify-center text-[1.8rem] h-12 px-[0] relative inline-flex items-center">
          <input
            value={destinationNumber}
            className="border w-[280px] p-1 h-[56px] rounded pr-[20px]"
            onChange={(e) => setDestinationNumber(e.target.value)}
          />
          {destinationNumber && (
            <RxCross2
              className="absolute block right-[5px] rounded-[50%] text-[#fff] bg-[#ccc] text-center leading-[1em] text-xl cursor-pointer"
              onClick={handleEmptyClick}
            />
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-around">
        {dialPadConfig.map((dialKey) => (
          <button
            className="select-none flex flex-col justify-center items-center cursor-pointer text-[1.6rem] w-[60px] h-[60px] m-[8px] bg-[rgba(211,_211,_211,_0.1)] border-[1px] border-[rgba(211,211,211,1)] rounded-[50%]"
            onClick={handleDigitClick(dialKey.digit)}
            key={dialKey.digit}
          >
            {dialKey.digit}
            {dialKey.subset && (
              <div className="text-[grey] text-[0.5rem] font-semibold h-3">
                {dialKey.subset}
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex justify-around ">
        <div className="w-1/3">
          {call && callState !== "destroy" && (
            <div
              className={`m-[8px] mx-auto w-[60px] h-[60px] text-3xl flex items-center ${
                mute ? "bg-green-400 text-white" : "bg-white text-black"
              } justify-center rounded-full`}
              onClick={handleMuteClick}
            >
              <BsMicMuteFill />
            </div>
          )}
        </div>
        <div className="w-1/3">
          {callState && callState !== "destroy" ? (
            <div
              className="m-[8px] mx-auto w-[60px] h-[60px] text-3xl flex items-center bg-red-500 justify-center rounded-full"
              onClick={handleHangUpClick}
            >
              <ImPhoneHangUp className="text-white" />
            </div>
          ) : (
            <div
              className={`m-[8px] mx-auto w-[60px] h-[60px] text-3xl flex items-center ${
                isClientConnected ? "bg-green-500" : "bg-slate-400"
              } justify-center rounded-full`}
              onClick={isClientConnected ? handleDialClick : () => {}}
            >
              <IoCall className="text-white" />
            </div>
          )}
        </div>
        <div className="w-1/3">
          {callState && callState !== "destroy" ? (
            (callState === "active" || callState === "held") && (
              <div
                className={`flex justify-center ${
                  callState === "held"
                    ? "bg-green-400 text-white"
                    : "bg-white text-black"
                } rounded-full items-center m-[8px] w-[60px] h-[60px] text-3xl`}
                onClick={handleHoldClick}
              >
                <MdPhonePaused />
              </div>
            )
          ) : (
            <div
              className="flex justify-center items-center m-[8px] w-[60px] h-[60px] text-3xl"
              onClick={handleBackspaceClick}
            >
              <MdBackspace />
            </div>
          )}
        </div>
      </div>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={handleAddParticipantClick}
        disabled={callState !== "active"}
      >
        Add Participant
      </button>
      <Audio stream={call?.remoteStream} />
    </div>
  );
};

export default Dialpad;
