import { useState } from "react";

const HomePage = () => {
  const [recipentPhoneNumber, setRecipentPhoneNumber] = useState("");

  function openWindow(from: string, to: string) {
    const baseUrl: string = process.env.REACT_APP_TELNYX_BASE_URL || "";
    const dialerPath: string = "phone";
    const url = `${baseUrl}/${dialerPath}/?from=${from}&to=${to}`;
    const dialerWindow = "left=100,top=100,width=320,height=550";
    window.open(url, "_blank", dialerWindow);
  }

  return (
    <div>
      <h1>This is Home Page</h1>
      <div className="flex gap-3">
        <input
          value={recipentPhoneNumber}
          className="border w-[280px] p-1 h-[40px] rounded px-2"
          onChange={(e) => setRecipentPhoneNumber(e.target.value)}
        />
        <input
          className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          type="button"
          value={"Call Us Now"}
          onClick={() => {
            openWindow(
              process.env.REACT_APP_TELNYX_PHONE_NUMBER || "",
              recipentPhoneNumber ||
                process.env.REACT_APP_TELNYX_RECIPENT_NUMBER ||
                ""
            );
          }}
        />
      </div>
    </div>
  );
};

export default HomePage;
