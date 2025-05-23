const SHEET_ID = '1BR2aVxllnrpbllC7RNPXPD2wxQxoQFKhEOzUoVIj-EM'; // スプレッドシートID

function doGet(e) {
  // ウェブアプリとしてGASを機能させるため、簡単な応答を返す。
  try {
    Logger.log("doGet called, returning simple status.");
    return ContentService
      .createTextOutput(JSON.stringify({ status: "Google Apps Script is active." }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  } catch (err) {
    Logger.log(`Error in doGet (simplified): ${err.toString()} ${err.stack}`);
    return ContentService
      .createTextOutput(JSON.stringify({ error: "An unexpected error occurred in doGet.", details: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetName = 'ユーザ記録'; // 回答を記録するシート名
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      const errorMsg = `Error: Sheet named "${sheetName}" not found in spreadsheet ID "${SHEET_ID}".`;
      Logger.log(errorMsg);
      return ContentService
        .createTextOutput(JSON.stringify({ error: errorMsg }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    const data = JSON.parse(e.postData.contents);
    // userId, questionIndex, answer を受け取る想定
    const { userId, questionIndex, answer } = data;

    // questionIndex は 0-indexed で来ると想定
    // スプレッドシートの列: A列(1)にユーザーID, B列(2)に質問0の回答, C列(3)に質問1の回答...
    const targetColumn = questionIndex + 2;

    let userRow = -1;
    const records = sheet.getDataRange().getValues();
    for (let i = 1; i < records.length; i++) { // 1行目はヘッダーと仮定
      if (records[i][0] == userId) { // ユーザーIDはA列 (records[i][0])
        userRow = i + 1; // getRangeは1-indexed
        break;
      }
    }

    if (userRow === -1) {
      userRow = sheet.getLastRow() + 1;
      sheet.getRange(userRow, 1).setValue(userId); // A列にユーザーID
    }

    sheet.getRange(userRow, targetColumn).setValue(answer);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'OK', message: 'Answer recorded successfully.' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');

  } catch (err) {
    Logger.log(`Error in doPost: ${err.toString()} ${err.stack}`);
    return ContentService
      .createTextOutput(JSON.stringify({ error: "An unexpected error occurred in doPost.", details: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}