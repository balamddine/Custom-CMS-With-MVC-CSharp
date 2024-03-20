using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System.Data;
using System.Web;

namespace CMS
{    
    public class OpenXmlExcel
    {
        public OpenXmlExcel()
        {
        }

        public static DataTable ReadAsDataTable(string fileName, int sheetindex = 0,int startfromrow=0, bool RemoveHeader = false)
        {
            DataTable dataTable = new DataTable();

            using (DocumentFormat.OpenXml.Packaging.SpreadsheetDocument spreadSheetDocument__1 = SpreadsheetDocument.Open(fileName, false))
            {
                WorkbookPart workbookPart = spreadSheetDocument__1.WorkbookPart;
                IEnumerable<Sheet> sheets = spreadSheetDocument__1.WorkbookPart.Workbook.GetFirstChild<Sheets>().Elements<Sheet>();
                string relationshipId = sheets.First().Id.Value;
                WorksheetPart worksheetPart = (WorksheetPart)spreadSheetDocument__1.WorkbookPart.GetPartById(relationshipId);
                Worksheet workSheet = worksheetPart.Worksheet;
                SheetData sheetData = workSheet.GetFirstChild<SheetData>();
                IEnumerable<Row> rows = sheetData.Descendants<Row>();

                foreach (Row row in rows)
                {
                    //Use the first row to add columns to DataTable.
                    if (row.RowIndex.Value == startfromrow)
                    {
                        foreach (Cell cell in row.Descendants<Cell>())
                        {
                            dataTable.Columns.Add(GetCellValue(spreadSheetDocument__1, cell));
                        }
                    }
                    if (row.RowIndex.Value > startfromrow)
                    {
                        //Add rows to DataTable.
                        dataTable.Rows.Add();
                        int i = 0;
                        foreach (Cell cell in row.Descendants<Cell>())
                        {
                            dataTable.Rows[dataTable.Rows.Count - 1][i] = GetCellValue(spreadSheetDocument__1, cell);
                            i++;
                        }
                    }
                }


                //foreach (Cell cell in rows.ElementAt(startfromrow))
                //    dataTable.Columns.Add(GetCellValue(spreadSheetDocument__1, cell));

                //foreach (Row row in rows)
                //{
                //    DataRow dataRow = dataTable.NewRow();

                //    for (int i = startfromrow; i <= row.Descendants<Cell>().Count(); i++)
                //    {
                //        try
                //        {
                //            Cell cell = row.Descendants<Cell>().ElementAt(i);
                //            int actualCellIndex = CellReferenceToIndex(cell);
                //            dataRow[actualCellIndex] = GetCellValue(spreadSheetDocument__1, cell);


                //            //dataRow[i] = GetCellValue(spreadSheetDocument__1, row.Descendants<Cell>().ElementAt(i));
                //        }
                //        catch (Exception ex)
                //        {
                //        }
                //    }
                //    dataTable.Rows.Add(dataRow);
                //}
            }

            if (RemoveHeader)
            {
                if (dataTable.Rows.Count > 0)
                {                    
                        dataTable.Rows.RemoveAt(0);                    
                }                    
            }
            foreach (DataRow rw in dataTable.Rows)
            {
                if (dataTable.Columns.Contains("DateOfBirth") && rw["DateOfBirth"].ToString() != "")
                {
                    double d = double.Parse(rw["DateOfBirth"].ToString());
                    DateTime conv = DateTime.FromOADate(d);
                    rw["DateOfBirth"] = conv;
                    dataTable.AcceptChanges();
                }
                if (dataTable.Columns.Contains("CovidDate") && rw["CovidDate"].ToString() != "")
                {
                    double d = double.Parse(rw["CovidDate"].ToString());
                    DateTime conv = DateTime.FromOADate(d);
                    rw["CovidDate"] = conv;
                    dataTable.AcceptChanges();
                }
                if (dataTable.Columns.Contains("1stDoseDate") && rw["1stDoseDate"].ToString() != "")
                {
                    double d = double.Parse(rw["1stDoseDate"].ToString());
                    DateTime conv = DateTime.FromOADate(d);
                    rw["1stDoseDate"] = conv;
                    dataTable.AcceptChanges();
                }
            }
            return dataTable;
        }
        private static int CellReferenceToIndex(Cell cell)
        {
            int index = 0;
            string reference = cell.CellReference.ToString().ToUpper();
            foreach (char ch in reference)
            {
                if (Char.IsLetter(ch))
                {
                    int value = (int)ch - (int)'A';
                    index = (index == 0) ? value : ((index + 1) * 26) + value;
                }
                else
                    return index;
            }
            return index;
        }
        public static string GetCellValue(SpreadsheetDocument document, Cell cell)
        {
            //SharedStringTablePart stringTablePart = document.WorkbookPart.SharedStringTablePart;
            //string value = cell.CellValue.InnerXml;

            //if (cell.DataType != null && cell.DataType.Value == CellValues.SharedString)
            //    return stringTablePart.SharedStringTable.ChildElements[Int32.Parse(value)].InnerText;
            //else
            //    return value;

            try
            {
                if (cell.CellValue==null)
                    return "";

                string value = cell.CellValue.InnerXml;

                if (cell.DataType != null && cell.DataType.Value == CellValues.SharedString)
                {
                    SharedStringTablePart stringTablePart = document.WorkbookPart.SharedStringTablePart;
                    return stringTablePart.SharedStringTable.ChildElements[Int32.Parse(value)].InnerText;
                }
                else
                    return value;
            }
            catch (Exception ex)
            {
                return "";
            }

        }       
    }
}