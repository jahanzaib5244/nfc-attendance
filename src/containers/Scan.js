import React, { useCallback, useContext, useEffect, useState } from "react";
import Scanner from "../components/Scanner/Scanner";
import { ActionsContext } from "../contexts/context";
import { GoogleSpreadsheet } from "google-spreadsheet";
import spreadSheetConfig from "../spreadsheet.json";
const Scan = () => {
  // nfc-attendace@nfc-attendance-376501.iam.gserviceaccount.com

  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    "1F09e5ZDCAanslBnaSjjLABRS2UV-UfsdOOJV_9MetMU"
  );
  const [message, setMessage] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const { actions, setActions } = useContext(ActionsContext);
  const scan = useCallback(async () => {
    /*Google Sheet Code*/
    await doc.useServiceAccountAuth({
      client_email: spreadSheetConfig.client_email,
      private_key: spreadSheetConfig.private_key,
    });
    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const headers = ["ID", "TimeStamp"];
    await sheet.setHeaderRow(headers);
    // await sheet.loadCells("A2:B2");
    
    await sheet.addRows([{ ID: 1, TimeStamp: new Date() }]);
    console.log("row added successfully");
    // const cell = sheet.getCell(1, 1);
    // cell.value = "new value";

    // await sheet.saveUpdatedCells();
    // await sheet.addRow([{ column1: "add 1 colum", column2: "add 2 colum" }]);
    // await doc.updateProperties({ title: 'testing spreadsheet' });
    // await sheet.loadInfo(); // loads document properties and worksheets
    // await sheet.loadCells("A2:B2");
    // const cell = sheet.getCell(1, 1);
    // cell.value = "new value";

    // await sheet.saveUpdatedCells();
    // const rows = await doc.updateProperties();
    // console.log(rows);
    // await doc.updateProperties({ ID: '1',Timestamp: new Date() });

    /* const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        console.log(sheet.title);
        console.log(sheet.rowCount);

        // adding / removing sheets
        const newSheet = await doc.addSheet({ title: 'hot new sheet!' });
        await newSheet.delete();*/

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
          onReading(event);
          setActions({
            scan: "scanned",
            write: null,
          });
        };
      } catch (error) {
        console.log(`Error! Scan failed to start: ${error}.`);
      }
    }
  }, [setActions]);

  const onReading = ({ message, serialNumber }) => {
    setSerialNumber(serialNumber);
    for (const record of message.records) {
      switch (record.recordType) {
        case "text":
          const textDecoder = new TextDecoder(record.encoding);
          setMessage(textDecoder.decode(record.data));
          break;
        case "url":
          // TODO: Read URL record with record data.
          break;
        default:
        // TODO: Handle other records with record data.
      }
    }
  };

  useEffect(() => {
    scan();
  }, [scan]);

  return (
    <>
      {actions.scan === "scanned" ? (
        <div>
          <p>Serial Number: {serialNumber}</p>
          <p>Message: {message}</p>
        </div>
      ) : (
        <Scanner status={actions.scan}></Scanner>
      )}
    </>
  );
};

export default Scan;
