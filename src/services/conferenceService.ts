import axios from "axios";

export async function call_control_create_conf(
  f_call_control_id: any,
  f_name: any,
  // f_callback: any
) {
  console.log(f_call_control_id, "f_call_control_id");

  const res = axios.post(
    "https://api.telnyx.com/v2/conferences/",

    {
      call_control_id: f_call_control_id,
      name: f_name,
      end_conference_on_exit: true,
      hold_audio_url:
        "https://file-examples.com/storage/fe45dfa76e66c6232a111c9/2017/11/file_example_MP3_700KB.mp3",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + process.env.REACT_APP_TELNYX_API_KEY,
      },
    }
  );
  console.log(res , "server conf_id");
  return res;
}

export function call_control_join_conf(
  f_telnyx_api_auth_v2: any,
  f_call_control_id: any,
  f_conf_id: any
) {
  var l_cc_action = "join";

  axios.post(
    "https://api.telnyx.com/v2/conferences/" +
      f_conf_id +
      "/actions/" +
      l_cc_action,

    {
      call_control_id: f_call_control_id,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + f_telnyx_api_auth_v2,
      },
    }
  );
}

export function call_control_hangup(
  f_telnyx_api_auth_v2: any,
  f_call_control_id: any
) {
  axios.post(
    "https://api.telnyx.com/v2/calls/" +
      f_call_control_id +
      "/actions/" +
      "hangup",

    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + f_telnyx_api_auth_v2,
      },
    },
    {}
  );
}

export async function call_control_dial(f_dest: any) {
  const res = axios.post(
    "https://api.telnyx.com/v2/calls/",
    {
      to: f_dest,
      from: process.env.REACT_APP_TELNYX_PHONE_NUMBER,
      connection_id: process.env.REACT_APP_TELNYX_CALL_CONTROL_APPLICATION_ID,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + process.env.REACT_APP_TELNYX_API_KEY,
      },
    }
  );
  return res;
}
