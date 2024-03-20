using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;

namespace Data.Common
{
    public class ExcelExport
    {
        #region Export to excel
        public static void GenerateExcelReport(DataTable queryDt, string[] cols, string[] Hidecols, string sheetname, string filenamePrefix)
        {
            string myfilename = filenamePrefix  + ".xlsx";
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (ExcelPackage p = new ExcelPackage())
            {
                // set the workbook properties and add a default sheet in it
                SetWorkbookProperties(p);
                // Create a sheet
                ExcelWorksheet ws = CreateSheet(p, sheetname);

                if (queryDt != null && queryDt.Rows.Count > 0)
                {
                    if (Hidecols.Length > 0)
                    {
                        for (int i = 0; i < Hidecols.Length; i++)
                        {
                            queryDt.Columns.Remove(Hidecols[i]);
                        }

                    }
                    int rowIndex = 1;
                    CreateHeader(ws, ref rowIndex, queryDt, cols);

                    ws.Cells["A2"].LoadFromDataTable(queryDt, false);
                    int colNumber = 1;
                    foreach (DataColumn col in queryDt.Columns)
                    {
                        if (col.DataType == typeof(DateTime))
                            ws.Column(colNumber).Style.Numberformat.Format = "dd/MM/yyyy";                       
                        colNumber += 1;
                    }

                    ws.Cells[ws.Dimension.Address].AutoFitColumns();
                    // Generate A File with Random name
                    // byte[] myBytes = p.GetAsByteArray();
                    byte[] myBytes = p.GetAsByteArray();
                    HttpContext.Current.Response.Clear();
                    HttpContext.Current.Response.ContentEncoding = System.Text.Encoding.UTF8;
                    HttpContext.Current.Response.AddHeader("Content-Disposition", "attachment; filename=" + myfilename);
                    HttpContext.Current.Response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    HttpContext.Current.Response.BinaryWrite(myBytes);
                    HttpContext.Current.Response.End();
                }
            }
        }
        private static ExcelWorksheet CreateSheet(ExcelPackage p, string sheetName)
        {
            p.Workbook.Worksheets.Add(sheetName);
            ExcelWorksheet ws = p.Workbook.Worksheets[0];
            ws.Name = sheetName;
            // Setting Sheet's name
            ws.Cells.Style.Font.Size = 11;
            // Default font size for whole sheet
            ws.Cells.Style.Font.Name = "Calibri";
            // Default Font name for whole sheet
            return ws;
        }

        private static void SetWorkbookProperties(ExcelPackage p)
        {
            // Here setting some document properties
            p.Workbook.Properties.Author = "Best Properties";
            p.Workbook.Properties.Title = "Best Properties";
        }

        private static void CreateHeader(ExcelWorksheet ws, ref int rowIndex, DataTable dt, string[] cols)
        {
            List<string> myheaderList = new List<string>();

            myheaderList.Add("0");
            for (int i = 0; i < cols.Length; i++)
            {
                myheaderList.Add(cols[i]);
            }
            int colIndex = 1;
            foreach (DataColumn dc in dt.Columns)
            {
                // Creating Headings
                var cell = ws.Cells[rowIndex, colIndex];
                cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                cell.Style.Font.Bold = true;
                cell.Style.WrapText = false;


                // Setting the background color of header cells to Gray
                var fill = cell.Style.Fill;
                fill.PatternType = ExcelFillStyle.Solid;
                fill.BackgroundColor.SetColor(System.Drawing.Color.Gray);

                // Setting Top/left,right/bottom borders.
                var border = cell.Style.Border;
                border.Bottom.Style = border.Top.Style = border.Left.Style = border.Right.Style = ExcelBorderStyle.Thin;


                // Setting Value in cell
                try
                {
                    if (myheaderList[colIndex] != null)
                        cell.Value = myheaderList[colIndex];
                }
                catch (Exception ex)
                {
                    cell.Value = "";
                }
                colIndex += 1;
            }
        }


        


        #endregion         
    }
}