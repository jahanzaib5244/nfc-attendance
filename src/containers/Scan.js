import React, { useCallback, useContext, useEffect, useState } from "react";
import Scanner from "../components/Scanner/Scanner";
import { ActionsContext } from "../contexts/context";
import { GoogleSpreadsheet } from "google-spreadsheet";
import spreadSheetConfig from "../spreadsheet.json";
import SweetAlert from "react-bootstrap-sweetalert";
const Scan = ({type}) => {
  const doc = new GoogleSpreadsheet(
    "1F09e5ZDCAanslBnaSjjLABRS2UV-UfsdOOJV_9MetMU"
  );
  const [message, setMessage] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [alert, setalert] = useState(false)
  const [responseType, setresponseType] = useState('success')
  const { actions, setActions } = useContext(ActionsContext);
  const scan = useCallback(async () => {
    if(actions?.type !== ''){
    if ("NDEFReader" in window) {
      try {
        const ndef = new window.NDEFReader();
        await ndef.scan();

        console.log("Scan started successfully.");
        ndef.onreadingerror = () => {
          console.log("Cannot read data from the NFC tag. Try another one?");
        };

        ndef.onreading = (event) => {
          console.log("NDEF message read.");
          new onReading(event);
        };
      } catch (error) {
        console.log(`Error! Scan failed to start: ${error}.`);
      }
    }
  }
  }, [setActions]);

  const onReading = async ({ message, serialNumber }) => {
   
    setSerialNumber(serialNumber);
    const record =  (message.records)[0]
    // for (const record of message.records) {
      switch (record.recordType) {
        case "text":
          const textDecoder = new TextDecoder(record.encoding);
          setMessage(textDecoder.decode(record.data));
          /*Google Sheet Code*/
          await doc.useServiceAccountAuth({
            client_email: spreadSheetConfig.client_email,
            private_key: spreadSheetConfig.private_key,
          });
          await doc.loadInfo();
          const sheet = doc.sheetsByIndex[0];
          const headers = ["ID", "Type", "Timestamp"];
          await sheet.setHeaderRow(headers);
          await sheet.addRows([
            {
              ID: textDecoder.decode(record.data),
              Type: (actions.type).toLowerCase(),
              Timestamp: new Date(),
            },
          ]);
          setActions({
            scan: "scanned",
            write: null,
          });
          setresponseType('success')
          setalert(true)
          // create new post request
          // const url = `https://attendezz.com/dashboard/api/index.php?action=mark_attendance_geolocation&emp_id=${textDecoder.decode(record.data)}&business_id=0&lat=0&lon=0&shift=${actions.type}&device_type=nfc`;
          // fetch(url, {
          //   method: "GET",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          // })
          //   .then((res) => {
          //     setActions({
          //       scan: "scanned",
          //       write: null,
          //     });
          //     setresponseType('success')
          //     setalert(true)
          //   })
          //   .catch((err) => {
          //     setActions({
          //       scan: "scanned",
          //       write: null,
          //     });
          //     setresponseType('danger')
          //     setalert(true)

          //   });
          //

          break;
        case "url":
          // TODO: Read URL record with record data.
          break;
        default:
        // TODO: Handle other records with record data.
      }
    
  };

  useEffect(() => {
   scan();
  }, [actions?.type]);
  return (
    <>
      <SweetAlert
        title={"Attendace Marked"}
        onConfirm={()=>{
          setalert(false)
          setresponseType('')
          setActions(null);
        }}
        onCancel={()=>{
          setalert(false)
          setresponseType('')
        }}
        type={responseType}
        // dependencies={[alert]}
        show={alert}
        btnSize="small"
      ></SweetAlert>
      
      {actions.scan === "scanned" ? (
        <div>
          {/* <p>Serial Number: {serialNumber}</p>
          <p>Message: {message}</p> */}
        </div>
      ) : (
        <Scanner status={actions.scan}></Scanner>
      )}
    </>
  );
};

export default Scan;
