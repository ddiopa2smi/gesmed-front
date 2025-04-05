import { message } from "antd";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
export function useImportFile(expectedHeaders: string[]) {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (file) {
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });

        // Lire la première feuille du fichier Excel
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir en JSON
        const jsonData: any = XLSX.utils.sheet_to_json(sheet);
        if (jsonData.length === 0) {
          message.error("Le fichier est vide !");
          return;
        }
        
        // Vérifier les en-têtes
        // let fileHeaders = jsonData[0];
        // if (!Array.isArray(fileHeaders)) {
        //   fileHeaders = Object.keys(fileHeaders);
        // }
        // const isValid = expectedHeaders.every((header) =>
        //   fileHeaders.includes(header)
        // );

        // if (!isValid) {
        //   message.error(
        //     "Les en-têtes du fichier ne correspondent pas aux colonnes attendues !"
        //   );
        //   return;
        // }

        setData(jsonData);
        message.success("Fichier importé avec succès");
      };

      reader.readAsBinaryString(file);
    }
  }, [file]);

  return { file, setFile, data };
}
